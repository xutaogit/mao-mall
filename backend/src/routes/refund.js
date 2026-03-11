import express from 'express';
import OrderRefund from '../models/OrderRefund.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取退款申请列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, refundSn } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    
    if (status !== undefined && status !== '') {
      query.status = parseInt(status);
    }
    
    if (refundSn) {
      query.refundSn = { $regex: refundSn, $options: 'i' };
    }

    // 如果有用户认证，只查询该用户的退款申请（管理员查所有）
    if (req.user && req.user.role !== 'admin' && req.user.id !== 'admin') {
      if (req.user.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
        query.memberId = req.user.id;
      }
    }

    const [list, total] = await Promise.all([
      OrderRefund.find(query)
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderRefund.countDocuments(query)
    ]);

    res.json({
      code: 200,
      message: '成功',
      data: {
        list,
        total,
        pageNum: parseInt(page),
        pageSize: limit,
        totalPage: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取退款申请详情
router.get('/:id', async (req, res) => {
  try {
    const refund = await OrderRefund.findById(req.params.id).populate('orderId');
    
    if (!refund) {
      return res.status(404).json({ code: 404, message: '退款申请不存在' });
    }

    res.json({ code: 200, message: '成功', data: refund });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 申请退款（需要登录）
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { orderId, refundAmount, refundType, reason, description, proofPics } = req.body;

    // 检查订单是否存在
    const order = await Order.findOne({
      _id: orderId,
      memberId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    // 检查订单状态（只有已支付的订单才能申请退款）
    if (order.status < 1) {
      return res.status(400).json({ code: 400, message: '订单未支付，无法申请退款' });
    }

    // 检查是否已有退款申请
    const existingRefund = await OrderRefund.findOne({
      orderId,
      status: { $in: [0, 1] } // 待审核或审核通过
    });

    if (existingRefund) {
      return res.status(400).json({ code: 400, message: '该订单已有退款申请' });
    }

    // 生成退款单号
    const refundSn = 'REF' + Date.now() + Math.floor(Math.random() * 1000);

    // 创建退款申请
    const refund = new OrderRefund({
      orderId,
      memberId: req.user.id,
      refundSn,
      refundAmount: refundAmount || order.payAmount,
      refundType: refundType || 0,
      reason,
      description,
      proofPics: proofPics || [],
      status: 0 // 待审核
    });

    await refund.save();

    res.json({
      code: 200,
      message: '退款申请提交成功',
      data: refund
    });
  } catch (error) {
    console.error('申请退款失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 审核退款申请（管理员）
router.post('/:id/review', async (req, res) => {
  try {
    const { status, handleNote } = req.body;

    if (![1, 2].includes(status)) {
      return res.status(400).json({ code: 400, message: '状态参数错误' });
    }

    const refund = await OrderRefund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ code: 404, message: '退款申请不存在' });
    }

    if (refund.status !== 0) {
      return res.status(400).json({ code: 400, message: '该申请已处理' });
    }

    refund.status = status;
    refund.handleNote = handleNote;
    refund.handleTime = new Date();

    // 审核通过：同步更新订单状态为已关闭，并恢复库存（退货退款时）
    if (status === 1) {
      const order = await Order.findById(refund.orderId);
      if (order) {
        // 更新订单状态为已关闭
        order.status = 4;
        await order.save();

        // 退货退款时恢复库存
        if (refund.refundType === 1) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: item.productQuantity, sale: -item.productQuantity }
            });
          }
        }
      }
    }

    await refund.save();

    res.json({
      code: 200,
      message: status === 1 ? '审核通过' : '审核拒绝',
      data: refund
    });
  } catch (error) {
    console.error('审核退款失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 完成退款（管理员）
router.post('/:id/complete', async (req, res) => {
  try {
    const refund = await OrderRefund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ code: 404, message: '退款申请不存在' });
    }

    if (refund.status !== 1) {
      return res.status(400).json({ code: 400, message: '该申请未审核通过' });
    }

    refund.status = 3; // 已完成
    refund.refundTime = new Date();
    await refund.save();

    // 更新订单状态
    await Order.findByIdAndUpdate(refund.orderId, { status: 4 }); // 已关闭

    res.json({
      code: 200,
      message: '退款完成',
      data: refund
    });
  } catch (error) {
    console.error('完成退款失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
