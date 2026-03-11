import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔗 测试 MongoDB 连接...');
    
    // 尝试不同的连接方式
    const uri = process.env.MONGODB_URI;
    console.log('连接字符串:', uri.replace(/:[^:@]+@/, ':****@'));
    
    // 添加更多选项
    const options = {
      dbName: process.env.MONGODB_DB_NAME || 'mao-mall',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    console.log('数据库名称:', options.dbName);
    console.log('尝试连接...\n');
    
    const conn = await mongoose.connect(uri, options);
    
    console.log('✅ MongoDB 连接成功！');
    console.log('主机:', conn.connection.host);
    console.log('数据库:', conn.connection.name);
    console.log('状态:', conn.connection.readyState === 1 ? '已连接' : '未连接');
    
    // 测试查询
    console.log('\n📊 测试数据库操作...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`数据库中有 ${collections.length} 个集合:`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ 测试完成，连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 网络连接问题（DNS 解析失败）');
    console.error('2. MongoDB Atlas 网络访问未配置（需要允许 0.0.0.0/0）');
    console.error('3. 用户名或密码错误');
    console.error('4. 集群未启动或已删除');
    console.error('\n建议：在你自己的电脑上（有正常网络的环境）重新测试');
    process.exit(1);
  }
};

testConnection();
