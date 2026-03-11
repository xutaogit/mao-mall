import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ showStatus: 1 })
      .sort({ sort: 1 })
      .lean();

    res.json({ code: 200, message: '成功', data: categories });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取分类详情
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    res.json({ code: 200, message: '成功', data: category });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
