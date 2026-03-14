import express from 'express';
import Distributor from '../models/Distributor.js';
import ProductCommission from '../models/ProductCommission.js';
import DistributionOrder from '../models/DistributionOrder.js';
import ProductSku from '../models/ProductSku.js';

const router = express.Router();

// 获取分销员申请列表
router.get('/applications', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    if (status !== undefined && status !== '') {
      query.status = parseInt(status);
    }

    const [list, total] = await Promise.all([
      Distributor.find(query)
        .populate('memberId', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Distributor.countDocuments(query)
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

// 审核分销员申请
router.post('/applications/:id/review', async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    if (![1, 2].includes(status)) {
      return res.status(400).json({ success: false, message: '状态参数错误' });
    }

    const distributor = await Distributor.findById(req.params.id);
    if (!distributor) {
      return res.status(404).json({ success: false, message: '申请不存在' });
    }

    if (distributor.status !== 0) {
      return res.status(400).json({ success: false, message: '该申请已审核' });
    }

    distributor.status = status;
    distributor.reviewTime = new Date();
    
    if (status === 2) {
      distributor.rejectReason = rejectReason;
    } else if (status === 1) {
      // 生成分销员代码
      distributor.distributorCode = 'D' + Date.now() + Math.floor(Math.random() * 1000);
    }

    await distributor.save();

    res.json({
      success: true,
      message: status === 1 ? '审核通过' : '已拒绝',
      data: distributor
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取分销员列表
router.get('/distributors', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const [list, total] = await Promise.all([
      Distributor.find({ status: 1 })
        .populate('memberId', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Distributor.countDocuments({ status: 1 })
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

// 获取商品佣金配置列表
router.get('/commissions', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, productId } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    if (productId) {
      query.productId = productId;
    }

    const [list, total] = await Promise.all([
      ProductCommission.find(query)
        .populate('productId', 'name pic price')
        .populate('skuId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductCommission.countDocuments(query)
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

// 设置单个商品/SKU佣金
router.post('/commissions', async (req, res) => {
  try {
    const { productId, skuId, commissionType, commissionValue, enabled = true } = req.body;

    if (!productId || commissionType === undefined || commissionValue === undefined) {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }

    // 检查是否已存在配置
    const query = { productId };
    if (skuId) query.skuId = skuId;

    let commission = await ProductCommission.findOne(query);

    if (commission) {
      // 更新
      commission.commissionType = commissionType;
      commission.commissionValue = commissionValue;
      commission.enabled = enabled;
      await commission.save();
    } else {
      // 创建
      commission = new ProductCommission({
        productId,
        skuId,
        commissionType,
        commissionValue,
        enabled
      });
      await commission.save();
    }

    res.json({
      success: true,
      message: '设置成功',
      data: commission
    });
  } catch (error) {
    console.error('设置佣金失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量设置商品佣金
router.post('/commissions/batch', async (req, res) => {
  try {
    const { productIds, skuIds, commissionType, commissionValue, enabled = true } = req.body;

    if ((!productIds || productIds.length === 0) && (!skuIds || skuIds.length === 0)) {
      return res.status(400).json({ success: false, message: '请选择商品或SKU' });
    }

    if (commissionType === undefined || commissionValue === undefined) {
      return res.status(400).json({ success: false, message: '请设置佣金类型和金额' });
    }

    const operations = [];

    // 批量设置商品佣金
    if (productIds && productIds.length > 0) {
      for (const productId of productIds) {
        operations.push({
          updateOne: {
            filter: { productId, skuId: null },
            update: { 
              $set: { 
                commissionType, 
                commissionValue, 
                enabled 
              } 
            },
            upsert: true
          }
        });
      }
    }

    // 批量设置SKU佣金
    if (skuIds && skuIds.length > 0) {
      for (const skuId of skuIds) {
        // 需要先查询SKU对应的productId
        const sku = await ProductSku.findById(skuId);
        if (sku) {
          operations.push({
            updateOne: {
              filter: { productId: sku.productId, skuId },
              update: { 
                $set: { 
                  commissionType, 
                  commissionValue, 
                  enabled 
                } 
              },
              upsert: true
            }
          });
        }
      }
    }

    if (operations.length > 0) {
      await ProductCommission.bulkWrite(operations);
    }

    res.json({
      success: true,
      message: `批量设置成功，共 ${operations.length} 条`
    });
  } catch (error) {
    console.error('批量设置佣金失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除佣金配置
router.delete('/commissions/:id', async (req, res) => {
  try {
    await ProductCommission.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取分销订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, distributorId, settlementStatus } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    if (distributorId) {
      query.distributorId = distributorId;
    }
    if (settlementStatus !== undefined && settlementStatus !== '') {
      query.settlementStatus = parseInt(settlementStatus);
    }

    const [list, total] = await Promise.all([
      DistributionOrder.find(query)
        .populate('distributorId')
        .populate('customerId', 'username')
        .populate('productId', 'name pic')
        .populate('orderId', 'orderSn status')
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

// 佣金统计
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalCommission,
      totalOrders,
      activeDistributors,
      settlementStats
    ] = await Promise.all([
      DistributionOrder.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      DistributionOrder.countDocuments(query),
      Distributor.countDocuments({ status: 1 }),
      DistributionOrder.aggregate([
        { $match: query },
        { 
          $group: { 
            _id: '$settlementStatus', 
            count: { $sum: 1 },
            amount: { $sum: '$commissionAmount' }
          } 
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalCommission: totalCommission[0]?.total || 0,
        totalOrders,
        activeDistributors,
        settlementStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
