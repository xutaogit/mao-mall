import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// 获取商品列表（支持搜索和筛选）
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword = '',
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      publishStatus,
      recommendStatus,
      newStatus
    } = req.query;
    
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 构建查询条件
    const query = { deleteStatus: 0 };
    
    // 关键词搜索（商品名称、副标题、商品编号）
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { subTitle: { $regex: keyword, $options: 'i' } },
        { productSn: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 分类筛选
    if (categoryId) {
      // 验证是否为有效的 ObjectId
      if (categoryId.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = categoryId;
      }
    }
    
    // 品牌筛选
    if (brandId) {
      // 验证是否为有效的 ObjectId
      if (brandId.match(/^[0-9a-fA-F]{24}$/)) {
        query.brandId = brandId;
      }
    }
    
    // 价格区间筛选
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // 上架状态
    if (publishStatus !== undefined && publishStatus !== '') {
      query.publishStatus = parseInt(publishStatus);
    }
    
    // 推荐状态
    if (recommendStatus !== undefined && recommendStatus !== '') {
      query.recommendStatus = parseInt(recommendStatus);
    }
    
    // 新品状态
    if (newStatus !== undefined && newStatus !== '') {
      query.newStatus = parseInt(newStatus);
    }

    // 排序
    const sortObj = {};
    const validSorts = ['createdAt', 'price', 'sale', 'stock'];
    const sortField = validSorts.includes(sort) ? sort : 'createdAt';
    sortObj[sortField] = order === 'asc' ? 1 : -1;

    // 查询数据
    const [list, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
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

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    console.log('获取商品详情，ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('商品不存在');
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    console.log('商品查询成功:', product.name);
    res.json({ code: 200, message: '成功', data: product });
  } catch (error) {
    console.error('获取商品详情错误:', error.message);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建商品
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.json({ code: 200, message: '创建成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除商品（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { deleteStatus: 1 },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    res.json({ code: 200, message: '删除成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新商品上架状态
router.patch('/:id/publish', async (req, res) => {
  try {
    const { publishStatus } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { publishStatus },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新商品推荐状态
router.patch('/:id/recommend', async (req, res) => {
  try {
    const { recommendStatus } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { recommendStatus },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
