import express from 'express';
import Distributor from '../models/Distributor.js';
import DistributionOrder from '../models/DistributionOrder.js';
import Withdrawal from '../models/Withdrawal.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 创建提现申请
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { amount, bankAccount, bankName, accountHolder } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '提现金额不合法' });
    }

    if (!bankAccount || !bankName || !accountHolder) {
      return res.status(400).json({ success: false, message: '银行信息不完整' });
    }

    // 获取分销员信息
    const distributor = await Distributor.findOne({ memberId: req.user.id });
    if (!distributor) {
      return res.status(404).json({ success: false, message: '您还不是分销员' });
    }

    if (distributor.status !== 1) {
      return res.status(400).json({ success: false, message: '您的分销员资格未通过审核' });
    }

    // 计算可提现金额（已结算的佣金）
    const settledOrders = await DistributionOrder.aggregate([
      {
        $match: {
          distributorId: distributor._id,
          settlementStatus: 1
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$commissionAmount' }
        }
      }
    ]);

    const availableAmount = settledOrders.length > 0 ? settledOrders[0].totalAmount : 0;

    if (amount > availableAmount) {
      return res.status(400).json({
        success: false,
        message: `可提现金额为¥${availableAmount.toFixed(2)}`
      });
    }

    // 创建提现记录
    const withdrawal = new Withdrawal({
      distributorId: distributor._id,
      amount,
      bankAccount,
      bankName,
      accountHolder,
      status: 0
    });

    await withdrawal.save();

    res.json({
      success: true,
      message: '提现申请已提交，请等待审核',
      data: withdrawal
    });
  } catch (error) {
    console.error('提现申请失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取提现记录列表
router.get('/records', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const distributor = await Distributor.findOne({ memberId: req.user.id });
    if (!distributor) {
      return res.status(404).json({ success: false, message: '您还不是分销员' });
    }

    const [list, total] = await Promise.all([
      Withdrawal.find({ distributorId: distributor._id })
        .sort({ applyTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments({ distributorId: distributor._id })
    ]);

    res.json({
      success: true,
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取提现统计信息
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const distributor = await Distributor.findOne({ memberId: req.user.id });
    if (!distributor) {
      return res.status(404).json({ success: false, message: '您还不是分销员' });
    }

    // 计算各类金额
    const stats = await DistributionOrder.aggregate([
      { $match: { distributorId: distributor._id } },
      {
        $group: {
          _id: '$settlementStatus',
          totalAmount: { $sum: '$commissionAmount' }
        }
      }
    ]);

    // 计算已提现金额
    const withdrawnStats = await Withdrawal.aggregate([
      {
        $match: {
          distributorId: distributor._id,
          status: 3 // 已完成
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      totalCommission: distributor.totalCommission || 0,
      pendingSettlement: 0,
      availableWithdrawal: 0,
      withdrawnAmount: 0
    };

    stats.forEach(stat => {
      if (stat._id === 0) result.pendingSettlement = stat.totalAmount;
      if (stat._id === 1) result.availableWithdrawal = stat.totalAmount;
    });

    if (withdrawnStats.length > 0) {
      result.withdrawnAmount = withdrawnStats[0].totalAmount;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 管理员：获取所有提现申请
router.get('/admin/applications', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    if (status !== undefined && status !== '') {
      query.status = parseInt(status);
    }

    const [list, total] = await Promise.all([
      Withdrawal.find(query)
        .populate('distributorId', 'phone distributorCode')
        .sort({ applyTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 管理员：审核提现申请
router.post('/admin/review/:id', async (req, res) => {
  try {
    const { approved, remark } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: '提现申请不存在' });
    }

    if (approved) {
      withdrawal.status = 1; // 已批准
      withdrawal.reviewTime = new Date();
      withdrawal.remark = remark;
    } else {
      withdrawal.status = 2; // 已拒绝
      withdrawal.reviewTime = new Date();
      withdrawal.failReason = remark;
    }

    await withdrawal.save();

    res.json({
      success: true,
      message: approved ? '已批准' : '已拒绝',
      data: withdrawal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 管理员：标记提现已完成
router.post('/admin/complete/:id', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: '提现申请不存在' });
    }

    if (withdrawal.status !== 1) {
      return res.status(400).json({ success: false, message: '只能完成已批准的提现' });
    }

    withdrawal.status = 3; // 已完成
    withdrawal.completeTime = new Date();
    await withdrawal.save();

    res.json({
      success: true,
      message: '提现已完成',
      data: withdrawal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

