import express from 'express';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 创建支付单据
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { orderId, payType } = req.body;

    if (!orderId || !payType) {
      return res.status(400).json({ success: false, message: '参数错误' });
    }

    // 查询订单
    const order = await Order.findOne({
      _id: orderId,
      memberId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== 0) {
      return res.status(400).json({ success: false, message: '订单状态不正确，无法支付' });
    }

    // 检查是否已有支付单据
    const existingPayment = await Payment.findOne({
      orderId,
      status: { $in: [0, 1] } // 待支付或支付中
    });

    if (existingPayment) {
      return res.status(400).json({ success: false, message: '该订单已有待支付的支付单据' });
    }

    // 生成支付单号
    const paymentSn = 'PAY' + Date.now() + Math.floor(Math.random() * 1000);

    // 创建支付单据
    const payment = new Payment({
      paymentSn,
      orderId,
      orderSn: order.orderSn,
      memberId: req.user.id,
      amount: order.totalAmount,
      payType,
      status: 0, // 待支付
      paymentUrl: `https://m.maomall.top/payment/${paymentSn}` // 模拟支付链接
    });

    await payment.save();

    res.json({
      success: true,
      message: '支付单据创建成功',
      data: payment
    });
  } catch (error) {
    console.error('创建支付单据失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取支付单据详情
router.get('/:paymentSn', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentSn: req.params.paymentSn
    }).populate('orderId');

    if (!payment) {
      return res.status(404).json({ success: false, message: '支付单据不存在' });
    }

    res.json({
      success: true,
      message: '成功',
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 模拟支付（开发测试用）
router.post('/:paymentSn/mock-pay', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentSn: req.params.paymentSn
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: '支付单据不存在' });
    }

    if (payment.status !== 0) {
      return res.status(400).json({ success: false, message: '支付单据状态不正确' });
    }

    // 更新支付单据状态
    payment.status = 2; // 已支付
    payment.paymentTime = new Date();
    payment.transactionId = 'MOCK_' + Date.now();
    await payment.save();

    // 更新订单状态
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      {
        status: 1, // 待发货
        payType: payment.payType,
        payAmount: payment.amount,
        paymentTime: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '模拟支付成功',
      data: {
        payment,
        order
      }
    });
  } catch (error) {
    console.error('模拟支付失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 查询支付状态
router.get('/:paymentSn/status', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      paymentSn: req.params.paymentSn
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: '支付单据不存在' });
    }

    res.json({
      success: true,
      message: '成功',
      data: {
        paymentSn: payment.paymentSn,
        status: payment.status,
        amount: payment.amount,
        payType: payment.payType,
        paymentTime: payment.paymentTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取订单的支付单据
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      memberId: req.user.id
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: '支付单据不存在' });
    }

    res.json({
      success: true,
      message: '成功',
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
