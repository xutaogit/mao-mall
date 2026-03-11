#!/bin/bash

# 猫猫商城后台管理系统启动脚本

echo "🚀 启动后台管理系统..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 进入后台管理目录
cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 访问地址: http://localhost:5174"
echo ""
echo "提示："
echo "  - 确保后端服务已启动（端口 3001）"
echo "  - 按 Ctrl+C 停止服务"
echo ""

npm run dev
