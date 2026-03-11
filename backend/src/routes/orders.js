import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import CartItem from '../models/CartItem.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取订单列表（可选认证）
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, orderSn = '', status } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 构建查询条件
    const query = {};
    
    if (orderSn) {
      query.orderSn = { $regex: orderSn, $options: 'i' };
    }
    
    if (status !== undefined && status !== '') {
      query.status = parseInt(status);
    }

    // 只有普通用户（非管理员）才过滤 memberId
    if (req.user && req.user.role !== 'admin' && req.user.id !== 'admin') {
      // 验证是否为有效 ObjectId
      if (req.user.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
        query.memberId = req.user.id;
      }
    }

    // 查询数据
    const [list, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
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

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '成功', data: order });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建订单（需要登录）
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { addressId, cartItemIds, note } = req.body;

    if (!addressId || !cartItemIds || cartItemIds.length === 0) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }

    // 获取购物车商品
    const cartItems = await CartItem.find({
      _id: { $in: cartItemIds },
      memberId: req.user.id
    }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ code: 400, message: '购物车商品不存在' });
    }

    // 获取地址信息
    const { MemberAddress } = await import('../models/Member.js');
    const address = await MemberAddress.findOne({
      _id: addressId,
      memberId: req.user.id
    });

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    // 计算总金额并检查库存
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productId;
      
      if (!product) {
        return res.status(400).json({ code: 400, message: '商品不存在' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ code: 400, message: `${product.name} 库存不足` });
      }

      totalAmount += item.price * item.quantity;
      orderItems.push({
        productId: product._id,
        productName: product.name,
        productPic: product.pic,
        productPrice: item.price,
        productQuantity: item.quantity
      });
    }

    // 生成订单号
    const orderSn = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

    // 创建订单
    const order = new Order({
      orderSn,
      memberId: req.user.id,
      totalAmount,
      payAmount: totalAmount,
      status: 0, // 待付款
      orderItems,
      receiverName: address.name,
      receiverPhone: address.phone,
      receiverProvince: address.province,
      receiverCity: address.city,
      receiverRegion: address.region,
      receiverAddress: address.detailAddress,
      note
    });

    await order.save();

    // 扣减库存
    for (const item of cartItems) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity, sale: item.quantity }
      });
    }

    // 删除购物车商品
    await CartItem.deleteMany({ _id: { $in: cartItemIds } });

    res.json({
      code: 200,
      message: '订单创建成功',
      data: order
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 订单支付（需要登录）
router.post('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      memberId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    if (order.status !== 0) {
      return res.status(400).json({ code: 400, message: '订单状态不正确' });
    }

    // 更新订单状态为待发货
    order.status = 1;
    order.paymentTime = new Date();
    await order.save();

    res.json({
      code: 200,
      message: '支付成功',
      data: order
    });
  } catch (error) {
    console.error('支付失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 取消订单（需要登录）
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      memberId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    if (order.status !== 0) {
      return res.status(400).json({ code: 400, message: '只能取消待付款订单' });
    }

    // 恢复库存
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.productQuantity, sale: -item.productQuantity }
      });
    }

    // 更新订单状态为已关闭
    order.status = 4;
    await order.save();

    res.json({
      code: 200,
      message: '订单已取消',
      data: order
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 确认收货（需要登录）
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      memberId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    if (order.status !== 2) {
      return res.status(400).json({ code: 400, message: '只能确认已发货订单' });
    }

    // 更新订单状态为已完成
    order.status = 3;
    order.receiveTime = new Date();
    await order.save();

    res.json({
      code: 200,
      message: '确认收货成功',
      data: order
    });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 订单发货（管理员）
router.post('/:id/delivery', async (req, res) => {
  try {
    const { deliveryCompany, deliverySn } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 2,
        deliveryCompany,
        deliverySn,
        deliveryTime: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '发货成功', data: order });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新订单状态（管理员）
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    // 根据状态更新时间
    if (status === 1) {
      updateData.paymentTime = new Date();
    } else if (status === 2) {
      updateData.deliveryTime = new Date();
    } else if (status === 3) {
      updateData.receiveTime = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: order });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
