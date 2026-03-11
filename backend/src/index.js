import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import addressRoutes from './routes/addresses.js';
import cartRoutes from './routes/cart.js';
import skuRoutes from './routes/sku.js';
import refundRoutes from './routes/refund.js';
import couponRoutes from './routes/coupon.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如 curl、Postman、服务端请求）
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());

// 连接数据库
connectDB();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sku', skuRoutes);
app.use('/api/refund', refundRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '猫商城 API 运行中 (MongoDB)' });
});

// 本地开发时启动监听；Vercel Serverless 环境下导出 app
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  });
}

export default app;
