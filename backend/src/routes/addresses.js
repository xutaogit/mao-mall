import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Member from '../models/Member.js';

const router = express.Router();

// 所有地址接口都需要认证
router.use(authMiddleware);

// 获取地址列表
router.get('/', async (req, res) => {
  try {
    // 从 member_addresses 集合获取地址
    const MemberAddress = (await import('../models/Member.js')).MemberAddress;
    const addresses = await MemberAddress.find({ memberId: req.user.id }).sort({ defaultStatus: -1, createdAt: -1 });

    res.json({
      code: 200,
      message: '成功',
      data: addresses
    });
  } catch (error) {
    console.error('获取地址列表失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取地址详情
router.get('/:id', async (req, res) => {
  try {
    const MemberAddress = (await import('../models/Member.js')).MemberAddress;
    const address = await MemberAddress.findOne({ 
      _id: req.params.id, 
      memberId: req.user.id 
    });

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    res.json({
      code: 200,
      message: '成功',
      data: address
    });
  } catch (error) {
    console.error('获取地址详情失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 添加地址
router.post('/', async (req, res) => {
  try {
    const { name, phone, province, city, region, detailAddress, defaultStatus } = req.body;

    // 验证必填字段
    if (!name || !phone || !province || !city || !region || !detailAddress) {
      return res.status(400).json({ code: 400, message: '请填写完整的地址信息' });
    }

    const MemberAddress = (await import('../models/Member.js')).MemberAddress;

    // 如果设置为默认地址，先取消其他默认地址
    if (defaultStatus === 1) {
      await MemberAddress.updateMany(
        { memberId: req.user.id },
        { defaultStatus: 0 }
      );
    }

    // 创建地址
    const address = new MemberAddress({
      memberId: req.user.id,
      name,
      phone,
      province,
      city,
      region,
      detailAddress,
      defaultStatus: defaultStatus || 0
    });

    await address.save();

    res.json({
      code: 200,
      message: '添加成功',
      data: address
    });
  } catch (error) {
    console.error('添加地址失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新地址
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, province, city, region, detailAddress, defaultStatus } = req.body;

    const MemberAddress = (await import('../models/Member.js')).MemberAddress;

    // 如果设置为默认地址，先取消其他默认地址
    if (defaultStatus === 1) {
      await MemberAddress.updateMany(
        { memberId: req.user.id, _id: { $ne: req.params.id } },
        { defaultStatus: 0 }
      );
    }

    // 更新地址
    const address = await MemberAddress.findOneAndUpdate(
      { _id: req.params.id, memberId: req.user.id },
      { name, phone, province, city, region, detailAddress, defaultStatus },
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: address
    });
  } catch (error) {
    console.error('更新地址失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除地址
router.delete('/:id', async (req, res) => {
  try {
    const MemberAddress = (await import('../models/Member.js')).MemberAddress;
    
    const address = await MemberAddress.findOneAndDelete({
      _id: req.params.id,
      memberId: req.user.id
    });

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除地址失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 设置默认地址
router.patch('/:id/default', async (req, res) => {
  try {
    const MemberAddress = (await import('../models/Member.js')).MemberAddress;

    // 取消其他默认地址
    await MemberAddress.updateMany(
      { memberId: req.user.id },
      { defaultStatus: 0 }
    );

    // 设置当前地址为默认
    const address = await MemberAddress.findOneAndUpdate(
      { _id: req.params.id, memberId: req.user.id },
      { defaultStatus: 1 },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在' });
    }

    res.json({
      code: 200,
      message: '设置成功',
      data: address
    });
  } catch (error) {
    console.error('设置默认地址失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
