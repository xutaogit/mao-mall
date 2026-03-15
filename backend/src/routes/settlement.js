import express from 'express';
import DistributionOrder from '../models/DistributionOrder.js';
import Distributor from '../models/Distributor.js';

const router = express.Router();

// 管理员：获取待结算的佣金订单
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, distributorId } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = { settlementStatus: 0 }; // 待结算
    if (distributorId) {
      query.distributorId = distributorId;
    }

    const [list, total] = await Promise.all([
      DistributionOrder.find(query)
        .populate('distributorId', 'phone distributorCode')
        .populate('customerId', 'nickname')
        .populate('productId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DistributionOrder.countDocuments(query)
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

// 管理员：批量结算佣金
router.post('/settle', async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: '请选择要结算的订单' });
    }

    // 更新订单状态为已结算
    const result = await DistributionOrder.updateMany(
      { _id: { $in: orderIds }, settlementStatus: 0 },
      { settlementStatus: 1, settlementTime: new Date() }
    );

    // 更新分销员的累计佣金
    const orders = await DistributionOrder.find({ _id: { $in: orderIds } });
    const distributorMap = {};

    orders.forEach(order => {
      const distributorId = order.distributorId.toString();
      if (!distributorMap[distributorId]) {
        distributorMap[distributorId] = 0;
      }
      distributorMap[distributorId] += order.commissionAmount;
    });

    // 批量更新分销员信息
    for (const [distributorId, amount] of Object.entries(distributorMap)) {
      await Distributor.findByIdAndUpdate(distributorId, {
        $inc: { totalCommission: amount }
      });
    }

    res.json({
      success: true,
      message: `成功结算 ${result.modifiedCount} 条订单`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 管理员：获取结算统计
router.get('/statistics', async (req, res) => {
  try {
    const stats = await DistributionOrder.aggregate([
      {
        $group: {
          _id: '$settlementStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$commissionAmount' }
        }
      }
    ]);

    const result = {
      pendingCount: 0,
      pendingAmount: 0,
      settledCount: 0,
      settledAmount: 0,
      failedCount: 0,
      failedAmount: 0
    };

    stats.forEach(stat => {
      if (stat._id === 0) {
        result.pendingCount = stat.count;
        result.pendingAmount = stat.totalAmount;
      } else if (stat._id === 1) {
        result.settledCount = stat.count;
        result.settledAmount = stat.totalAmount;
      } else if (stat._id === 2) {
        result.failedCount = stat.count;
        result.failedAmount = stat.totalAmount;
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

