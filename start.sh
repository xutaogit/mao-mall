#!/bin/bash

# 猫商城快速启动脚本

echo "🐱 猫商城快速启动"
echo "=================="
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装 Node.js"
    echo "请访问 https://nodejs.org 安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 后端设置
echo "📦 设置后端..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到 .env 文件"
    echo "请复制 .env.example 并配置 MongoDB 连接信息"
    echo ""
    echo "运行以下命令："
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📥 安装后端依赖..."
    npm install
else
    echo "✅ 后端依赖已安装"
fi

echo ""
echo "🔗 测试 MongoDB 连接..."
node test-connection.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ MongoDB 连接失败"
    echo "请检查 .env 文件中的配置"
    exit 1
fi

echo ""
read -p "是否初始化数据库（创建测试数据）？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  初始化数据库..."
    npm run init-db
fi

cd ..

# 前端设置
echo ""
echo "📦 设置前端..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
else
    echo "✅ 前端依赖已安装"
fi

cd ..

# 启动服务
echo ""
echo "🚀 准备启动服务..."
echo ""
echo "后端将运行在: http://localhost:3000"
echo "前端将运行在: http://localhost:5173"
echo ""
read -p "按 Enter 键启动服务..."

# 使用 trap 确保退出时关闭所有进程
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 启动后端
echo ""
echo "🚀 启动后端..."
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "🚀 启动前端..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📱 在浏览器中打开: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
wait
