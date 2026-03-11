import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Member from '../models/Member.js';

const router = express.Router();

// JWT 密钥（生产环境应该放在环境变量中）
const JWT_SECRET = process.env.JWT_SECRET || 'mao-mall-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    // 检查用户名是否已存在
    const existingUser = await Member.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await Member.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ code: 400, message: '手机号已被注册' });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const member = new Member({
      username,
      password: hashedPassword,
      phone,
      email,
      nickname: username,
      status: 1
    });

    await member.save();

    // 生成 Token
    const token = jwt.sign(
      { id: member._id, username: member.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        token,
        user: {
          id: member._id,
          username: member.username,
          nickname: member.nickname,
          phone: member.phone,
          email: member.email
        }
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    // 查找用户
    const member = await Member.findOne({ username });
    if (!member) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    // 检查用户状态
    if (member.status !== 1) {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    // 生成 Token
    const token = jwt.sign(
      { id: member._id, username: member.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: member._id,
          username: member.username,
          nickname: member.nickname,
          phone: member.phone,
          email: member.email,
          avatar: member.icon,
          gender: member.gender
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取当前用户信息
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查找用户
    const member = await Member.findById(decoded.id).select('-password');
    if (!member) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({
      code: 200,
      message: '成功',
      data: {
        id: member._id,
        username: member.username,
        nickname: member.nickname,
        phone: member.phone,
        email: member.email,
        avatar: member.icon,
        gender: member.gender,
        birthday: member.birthday,
        city: member.city
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: 'Token 无效' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'Token 已过期' });
    }
    console.error('获取用户信息失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { nickname, phone, email, gender, birthday, city } = req.body;

    // 更新用户信息
    const member = await Member.findByIdAndUpdate(
      decoded.id,
      { nickname, phone, email, gender, birthday, city },
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: member._id,
        username: member.username,
        nickname: member.nickname,
        phone: member.phone,
        email: member.email,
        gender: member.gender,
        birthday: member.birthday,
        city: member.city
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'Token 无效或已过期' });
    }
    console.error('更新用户信息失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '旧密码和新密码不能为空' });
    }

    // 查找用户
    const member = await Member.findById(decoded.id);
    if (!member) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, member.password);
    if (!isPasswordValid) {
      return res.status(400).json({ code: 400, message: '旧密码错误' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    member.password = hashedPassword;
    await member.save();

    res.json({
      code: 200,
      message: '密码修改成功'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'Token 无效或已过期' });
    }
    console.error('修改密码失败:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 管理员登录（账号密码硬编码，生产环境应从数据库读取）
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    // 管理员账号验证（生产环境应存入数据库）
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 生成 Token
    const token = jwt.sign(
      { id: 'admin', username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: { username, role: 'admin' }
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
