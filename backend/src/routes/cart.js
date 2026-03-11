import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

const router = express.Router();

// 所有购物车接口都需要认证
router.use(authMiddleware);

// 获取购物车列表
router.get('/', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ memberId: req.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });

    // 过滤掉商品已删除的购物车项
    const validCartItems = cartItems.filter(item => item.productId);

    res.json({
      code: 200,
      message: '成功',
      data: validCartItems
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 添加到购物车
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ code: 400, message: '商品ID不能为空' });
    }

    // 检查商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    // 检查商品是否上架
    if (product.publishStatus !== 1) {
      return res.status(400).json({ code: 400, message: '商品已下架' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    // 检查购物车中是否已存在该商品
    let cartItem = await CartItem.findOne({
      memberId: req.user.id,
      productId
    });

    if (cartItem) {
      // 如果已存在，更新数量
      cartItem.quantity += quantity;
      
      // 检查总数量是否超过库存
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ code: 400, message: '库存不足' });
      }
      
      await cartItem.save();
    } else {
      // 如果不存在，创建新的购物车项
      cartItem = new CartItem({
        memberId: req.user.id,
        productId,
        quantity,
        price: product.promotionPrice || product.price,
        productName: product.name,
        productPic: product.pic
      });
      await cartItem.save();
    }

    // 返回购物车项并填充商品信息
    await cartItem.populate('productId');

    res.json({
      code: 200,
      message: '添加成功',
      data: cartItem
    });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新购物车商品数量
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ code: 400, message: '数量必须大于0' });
    }

    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      memberId: req.user.id
    }).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ code: 404, message: '购物车项不存在' });
    }

    // 检查库存
    if (cartItem.productId && quantity > cartItem.productId.stock) {
      return res.status(400).json({ code: 400, message: '库存不足' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      code: 200,
      message: '更新成功',
      data: cartItem
    });
  } catch (error) {
    console.error('更新购物车失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除购物车商品
router.delete('/:id', async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      memberId: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({ code: 404, message: '购物车项不存在' });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 清空购物车
router.delete('/', async (req, res) => {
  try {
    await CartItem.deleteMany({ memberId: req.user.id });

    res.json({
      code: 200,
      message: '清空成功'
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 批量删除购物车商品
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, message: 'ids 参数无效' });
    }

    await CartItem.deleteMany({
      _id: { $in: ids },
      memberId: req.user.id
    });

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('批量删除失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
