import express from 'express';
import { ProductAttribute, SkuStock } from '../models/ProductSku.js';
import Product from '../models/Product.js';

const router = express.Router();

// 获取商品的规格属性
router.get('/product/:productId/attributes', async (req, res) => {
  try {
    const attributes = await ProductAttribute.find({ productId: req.params.productId });
    res.json({ code: 200, message: '成功', data: attributes });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 添加商品规格属性
router.post('/product/:productId/attributes', async (req, res) => {
  try {
    const { name, values } = req.body;
    
    const attribute = new ProductAttribute({
      productId: req.params.productId,
      name,
      values
    });
    
    await attribute.save();
    res.json({ code: 200, message: '添加成功', data: attribute });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取商品的 SKU 列表
router.get('/product/:productId/skus', async (req, res) => {
  try {
    const skus = await SkuStock.find({ productId: req.params.productId });
    res.json({ code: 200, message: '成功', data: skus });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 添加 SKU
router.post('/product/:productId/skus', async (req, res) => {
  try {
    const { skuCode, price, stock, lowStock, pic, spData } = req.body;
    
    // 检查 SKU 编码是否已存在
    const existingSku = await SkuStock.findOne({ skuCode });
    if (existingSku) {
      return res.status(400).json({ code: 400, message: 'SKU 编码已存在' });
    }
    
    const sku = new SkuStock({
      productId: req.params.productId,
      skuCode,
      price,
      stock,
      lowStock,
      pic,
      spData
    });
    
    await sku.save();
    res.json({ code: 200, message: '添加成功', data: sku });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新 SKU
router.put('/skus/:id', async (req, res) => {
  try {
    const { price, stock, lowStock, pic, spData } = req.body;
    
    const sku = await SkuStock.findByIdAndUpdate(
      req.params.id,
      { price, stock, lowStock, pic, spData },
      { new: true }
    );
    
    if (!sku) {
      return res.status(404).json({ code: 404, message: 'SKU 不存在' });
    }
    
    res.json({ code: 200, message: '更新成功', data: sku });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除 SKU
router.delete('/skus/:id', async (req, res) => {
  try {
    const sku = await SkuStock.findByIdAndDelete(req.params.id);
    
    if (!sku) {
      return res.status(404).json({ code: 404, message: 'SKU 不存在' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 根据规格获取 SKU
router.post('/product/:productId/sku/match', async (req, res) => {
  try {
    const { spData } = req.body;
    
    // 查找匹配的 SKU
    const sku = await SkuStock.findOne({
      productId: req.params.productId,
      spData: { $all: spData }
    });
    
    if (!sku) {
      return res.status(404).json({ code: 404, message: '未找到匹配的 SKU' });
    }
    
    res.json({ code: 200, message: '成功', data: sku });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
