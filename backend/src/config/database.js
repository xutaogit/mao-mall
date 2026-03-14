import mongoose from 'mongoose';

const connectDB = async () => {
  // Serverless 环境下复用已有连接，避免每次请求重新连接
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'mao-mall',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📦 数据库名称: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    // Serverless 环境下不要退出进程，而是抛出错误
    throw error;
  }
};

export default connectDB;
