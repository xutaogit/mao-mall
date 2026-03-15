import express from 'express';
import Distributor from '../models/Distributor.js';
import DistributionRelation from '../models/DistributionRelation.js';
import DistributionOrder from '../models/DistributionOrder.js';
import ProductCommission from '../models/ProductCommission.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 提交分销申请
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: '手机号不能为空' });
    }

    // 检查是否已申请
    const existing = await Distributor.findOne({ memberId: req.user.id });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: existing.status === 0 ? '申请审核中' : existing.status === 1 ? '您已是分销员' : '申请已被拒绝'
      });
    }

    // 创建申请
    const distributor = new Distributor({
      memberId: req.user.id,
      phone,
      status: 0 // 待审核
    });

    await distributor.save();

    res.json({
      success: true,
      message: '申请提交成功，请等待审核',
      data: distributor
    });
  } catch (error) {
    console.error('提交分销申请失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取分销员信息
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const distributor = await Distributor.findOne({ memberId: req.user.id });

    if (!distributor) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: distributor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取分销中心数据
router.get('/center', authMiddleware, async (req, res) => {
  try {
    const distributor = await Distributor.findOne({ 
      memberId: req.user.id,
      status: 1 // 已通过
    });

    if (!distributor) {
      return res.status(403).json({ success: false, message: '您还不是分销员' });
    }

    // 统计今日预估佣金
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await DistributionOrder.find({
      distributorId: distributor._id,
      createdAt: { $gte: today },
      settlementStatus: { $in: [0, 1] } // 待结算或已结算
    });

    const todayCommission = todayOrders.reduce((sum, order) => sum + order.commissionAmount, 0);

    // 获取推广人数
    const customerCount = await DistributionRelation.countDocuments({
      distributorId: distributor._id
    });

    res.json({
      success: true,
      data: {
        totalCommission: distributor.totalCommission,
        todayCommission,
        totalOrders: distributor.totalOrders,
        totalCustomers: customerCount,
        distributorCode: distributor.distributorCode
      }
    });
  } catch (error) {
    console.error('获取分销中心数据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取佣金明细
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const distributor = await Distributor.findOne({ 
      memberId: req.user.id,
      status: 1
    });

    if (!distributor) {
      return res.status(403).json({ success: false, message: '您还不是分销员' });
    }

    const [list, total] = await Promise.all([
      DistributionOrder.find({ distributorId: distributor._id })
        .populate('orderId', 'orderSn')
        .populate('productId', 'name pic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DistributionOrder.countDocuments({ distributorId: distributor._id })
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

// 绑定分销关系（通过推广链接访问时调用）
router.post('/bind', authMiddleware, async (req, res) => {
  try {
    const { distributorCode } = req.body;

    if (!distributorCode) {
      return res.status(400).json({ success: false, message: '分销员代码不能为空' });
    }

    // 查找分销员
    const distributor = await Distributor.findOne({ 
      distributorCode,
      status: 1
    });

    if (!distributor) {
      return res.status(404).json({ success: false, message: '分销员不存在或未激活' });
    }

    // 不能绑定自己
    if (distributor.memberId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: '不能绑定自己为分销员' });
    }

    // 检查是否已有有效绑定关系
    const existing = await DistributionRelation.findOne({
      customerId: req.user.id,
      expireTime: { $gt: new Date() }
    });

    if (existing) {
      // 更新为最后点击的分销员（最后点击有效原则）
      existing.distributorId = distributor._id;
      existing.bindTime = new Date();
      existing.expireTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天
      await existing.save();
    } else {
      // 创建新绑定关系
      const relation = new DistributionRelation({
        customerId: req.user.id,
        distributorId: distributor._id,
        expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
      });
      await relation.save();

      // 更新分销员推广人数
      await Distributor.findByIdAndUpdate(distributor._id, {
        $inc: { totalCustomers: 1 }
      });
    }

    res.json({
      success: true,
      message: '绑定成功'
    });
  } catch (error) {
    console.error('绑定分销关系失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取商品佣金信息（供前端展示）
router.get('/product/:productId/commission', async (req, res) => {
  try {
    const { productId } = req.params;

    // 查询商品佣金配置
    const commission = await ProductCommission.findOne({
      productId,
      skuId: null, // 整个商品的佣金
      enabled: true
    });

    if (!commission) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        commissionType: commission.commissionType,
        commissionValue: commission.commissionValue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
