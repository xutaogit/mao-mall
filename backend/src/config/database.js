import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'mao-mall'
    });
    
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📦 数据库名称: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

export default connectDB;
