import express from 'express';
import { Coupon, CouponHistory } from '../models/Coupon.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取优惠券列表（可选认证）
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, useType } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {};
    
    if (status !== undefined && status !== '') {
      query.status = parseInt(status);
    }
    
    if (useType !== undefined && useType !== '') {
      query.useType = parseInt(useType);
    }

    // 只显示已发布且在有效期内的优惠券
    if (!req.user || req.query.available === 'true') {
      query.status = 1;
      query.startTime = { $lte: new Date() };
      query.endTime = { $gte: new Date() };
    }

    const [list, total] = await Promise.all([
      Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query)
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

// 获取优惠券详情
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ code: 404, message: '优惠券不存在' });
    }

    res.json({ code: 200, message: '成功', data: coupon });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建优惠券（管理员）
router.post('/', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    
    res.json({ code: 200, message: '创建成功', data: coupon });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新优惠券（管理员）
router.put('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ code: 404, message: '优惠券不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: coupon });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除优惠券（管理员）
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ code: 404, message: '优惠券不存在' });
    }

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 领取优惠券（需要登录）
router.post('/:id/claim', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ code: 404, message: '优惠券不存在' });
    }

    // 检查优惠券状态
    if (coupon.status !== 1) {
      return res.status(400).json({ code: 400, message: '优惠券未发布' });
    }

    // 检查有效期
    const now = new Date();
    if (now < coupon.startTime || now > coupon.endTime) {
      return res.status(400).json({ code: 400, message: '优惠券不在有效期内' });
    }

    // 检查库存
    if (coupon.receiveCount >= coupon.count) {
      return res.status(400).json({ code: 400, message: '优惠券已领完' });
    }

    // 检查是否已领取
    const existingHistory = await CouponHistory.findOne({
      couponId: req.params.id,
      memberId: req.user.id
    });

    if (existingHistory) {
      return res.status(400).json({ code: 400, message: '您已领取过该优惠券' });
    }

    // 生成优惠券码
    const couponCode = 'CPN' + Date.now() + Math.floor(Math.random() * 10000);

    // 创建领取记录
    const history = new CouponHistory({
      couponId: req.params.id,
      memberId: req.user.id,
      couponCode,
      getType: 0,
      useStatus: 0
    });

    await history.save();

    // 更新优惠券领取数量
    coupon.receiveCount += 1;
    await coupon.save();

    res.json({
      code: 200,
      message: '领取成功',
      data: history
    });
  } catch (error) {
    console.error('领取优惠券失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取我的优惠券（需要登录）
router.get('/my/list', authMiddleware, async (req, res) => {
  try {
    const { useStatus } = req.query;
    
    const query = { memberId: req.user.id };
    
    if (useStatus !== undefined && useStatus !== '') {
      query.useStatus = parseInt(useStatus);
    }

    const histories = await CouponHistory.find(query)
      .populate('couponId')
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      message: '成功',
      data: histories
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 使用优惠券（订单创建时调用）
router.post('/use', authMiddleware, async (req, res) => {
  try {
    const { couponCode, orderId, orderSn } = req.body;

    const history = await CouponHistory.findOne({
      couponCode,
      memberId: req.user.id
    }).populate('couponId');

    if (!history) {
      return res.status(404).json({ code: 404, message: '优惠券不存在' });
    }

    if (history.useStatus !== 0) {
      return res.status(400).json({ code: 400, message: '优惠券已使用或已过期' });
    }

    // 检查优惠券有效期
    const coupon = history.couponId;
    const now = new Date();
    if (now > coupon.endTime) {
      history.useStatus = 2; // 已过期
      await history.save();
      return res.status(400).json({ code: 400, message: '优惠券已过期' });
    }

    // 标记为已使用
    history.useStatus = 1;
    history.useTime = new Date();
    history.orderId = orderId;
    history.orderSn = orderSn;
    await history.save();

    // 更新优惠券使用数量
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { useCount: 1 }
    });

    res.json({
      code: 200,
      message: '优惠券使用成功',
      data: history
    });
  } catch (error) {
    console.error('使用优惠券失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
