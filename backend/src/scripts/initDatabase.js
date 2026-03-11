import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

dotenv.config();

const initDatabase = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    console.log('🗑️  清空现有数据...');
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({})
    ]);
    
    console.log('📦 插入分类数据...');
    const categories = await Category.insertMany([
      { name: '手机数码', level: 0, sort: 1, showStatus: 1, icon: '📱' },
      { name: '电脑办公', level: 0, sort: 2, showStatus: 1, icon: '💻' },
      { name: '家用电器', level: 0, sort: 3, showStatus: 1, icon: '🏠' },
      { name: '服饰鞋包', level: 0, sort: 4, showStatus: 1, icon: '👔' },
      { name: '美妆护肤', level: 0, sort: 5, showStatus: 1, icon: '💄' },
      { name: '运动户外', level: 0, sort: 6, showStatus: 1, icon: '⚽' }
    ]);
    console.log(`✅ 插入 ${categories.length} 个分类`);
    
    console.log('📦 插入商品数据...');
    const products = await Product.insertMany([
      {
        name: 'iPhone 15 Pro',
        productSn: 'IP15PRO001',
        categoryId: categories[0]._id,
        price: 7999,
        stock: 100,
        sale: 50,
        publishStatus: 1,
        newStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1592286927505-2fd0fcb0d3f6?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1592286927505-2fd0fcb0d3f6?w=400',
          'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400'
        ],
        subTitle: '全新A17 Pro芯片',
        description: '苹果最新旗舰手机，性能强劲，拍照出色',
        unit: '台'
      },
      {
        name: 'MacBook Pro 14',
        productSn: 'MBP14001',
        categoryId: categories[1]._id,
        price: 14999,
        stock: 50,
        sale: 20,
        publishStatus: 1,
        newStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
        ],
        subTitle: 'M3芯片强劲性能',
        description: '专业级笔记本电脑，适合开发和设计',
        unit: '台'
      },
      {
        name: 'AirPods Pro 2',
        productSn: 'APP2001',
        categoryId: categories[0]._id,
        price: 1899,
        stock: 200,
        sale: 150,
        publishStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'
        ],
        subTitle: '主动降噪耳机',
        description: '无线蓝牙耳机，音质出色，降噪效果好',
        unit: '副'
      },
      {
        name: 'iPad Air',
        productSn: 'IPADAIR001',
        categoryId: categories[1]._id,
        price: 4799,
        stock: 80,
        sale: 35,
        publishStatus: 1,
        newStatus: 1,
        pic: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'
        ],
        subTitle: 'M1芯片平板',
        description: '轻薄便携，性能强大，适合办公娱乐',
        unit: '台'
      },
      {
        name: 'Apple Watch Series 9',
        productSn: 'AWS9001',
        categoryId: categories[0]._id,
        price: 3199,
        stock: 120,
        sale: 60,
        publishStatus: 1,
        newStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'
        ],
        subTitle: '健康监测专家',
        description: '智能手表，全天候健康监测，运动追踪',
        unit: '块'
      },
      {
        name: 'Sony WH-1000XM5',
        productSn: 'SONYWH001',
        categoryId: categories[0]._id,
        price: 2499,
        stock: 90,
        sale: 45,
        publishStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
        albumPics: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400'
        ],
        subTitle: '降噪耳机之王',
        description: '顶级降噪，音质卓越，佩戴舒适',
        unit: '副'
      },
      {
        name: 'Dyson V15吸尘器',
        productSn: 'DYSONV15001',
        categoryId: categories[2]._id,
        price: 4990,
        stock: 60,
        sale: 25,
        publishStatus: 1,
        pic: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
        subTitle: '激光探测灰尘',
        description: '强劲吸力，智能清洁，家居必备',
        unit: '台'
      },
      {
        name: 'Nike Air Max 270',
        productSn: 'NIKEAM270001',
        categoryId: categories[5]._id,
        price: 1299,
        stock: 150,
        sale: 80,
        publishStatus: 1,
        pic: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        subTitle: '经典运动鞋',
        description: '舒适透气，时尚百搭',
        unit: '双'
      },
      {
        name: 'Lululemon瑜伽裤',
        productSn: 'LULU001',
        categoryId: categories[3]._id,
        price: 890,
        stock: 200,
        sale: 120,
        publishStatus: 1,
        pic: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
        subTitle: '高弹力运动裤',
        description: '舒适贴身，运动必备',
        unit: '条'
      },
      {
        name: 'SK-II神仙水',
        productSn: 'SKII001',
        categoryId: categories[4]._id,
        price: 1690,
        stock: 100,
        sale: 55,
        publishStatus: 1,
        recommendStatus: 1,
        pic: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        subTitle: '护肤精华水',
        description: '改善肤质，提亮肤色',
        unit: '瓶'
      }
    ]);
    console.log(`✅ 插入 ${products.length} 个商品`);
    
    console.log('📦 插入测试订单...');
    const orders = await Order.insertMany([
      {
        orderSn: 'ORD202403040001',
        memberUsername: 'user001',
        totalAmount: 7999,
        payAmount: 7999,
        payType: 2,
        status: 1,
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverProvince: '广东省',
        receiverCity: '深圳市',
        receiverRegion: '南山区',
        receiverDetailAddress: '科技园南区'
      },
      {
        orderSn: 'ORD202403040002',
        memberUsername: 'user002',
        totalAmount: 14999,
        payAmount: 14999,
        payType: 1,
        status: 2,
        receiverName: '李四',
        receiverPhone: '13900139000',
        receiverProvince: '北京市',
        receiverCity: '北京市',
        receiverRegion: '朝阳区',
        receiverDetailAddress: '望京SOHO',
        paymentTime: new Date(),
        deliveryTime: new Date()
      },
      {
        orderSn: 'ORD202403040003',
        memberUsername: 'user003',
        totalAmount: 1899,
        payAmount: 1899,
        payType: 2,
        status: 3,
        receiverName: '王五',
        receiverPhone: '13700137000',
        receiverProvince: '上海市',
        receiverCity: '上海市',
        receiverRegion: '浦东新区',
        receiverDetailAddress: '陆家嘴金融中心',
        paymentTime: new Date(),
        deliveryTime: new Date(),
        receiveTime: new Date()
      }
    ]);
    console.log(`✅ 插入 ${orders.length} 个订单`);
    
    console.log('\n🎉 数据初始化完成！');
    console.log(`📊 统计：`);
    console.log(`   - 分类：${categories.length} 个`);
    console.log(`   - 商品：${products.length} 个`);
    console.log(`   - 订单：${orders.length} 个`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
