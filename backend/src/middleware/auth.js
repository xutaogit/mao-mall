import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mao-mall-secret-key-2024';

// 认证中间件
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录，请先登录' });
    }

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: 'Token 无效' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'Token 已过期，请重新登录' });
    }
    return res.status(401).json({ code: 401, message: '认证失败' });
  }
};

// 可选认证中间件（不强制要求登录）
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};
