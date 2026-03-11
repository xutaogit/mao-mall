# 🚀 快速开始

## 本地开发（3 步启动）

### 1️⃣ 配置 MongoDB

编辑 `backend/.env` 文件（已存在）：

```bash
cd backend
nano .env
```

确保包含正确的 MongoDB 连接信息：
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=mao-mall
PORT=3000
```

### 2️⃣ 初始化数据库

```bash
cd backend
npm install
node test-connection.js  # 测试连接
npm run init-db          # 创建测试数据
```

### 3️⃣ 启动服务

**终端 1 - 后端：**
```bash
cd backend
npm run dev
```

**终端 2 - 前端：**
```bash
cd frontend
npm install
npm run dev
```

**访问：** http://localhost:5173

---

## 或使用快速启动脚本

```bash
bash start.sh
```

---

## 部署到生产环境

详细步骤请查看 `DEPLOYMENT-GUIDE.md`

### 快速部署步骤：

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: 猫商城 MongoDB 版本"
   git branch -M main
   git remote add origin https://github.com/你的用户名/mao-mall.git
   git push -u origin main
   ```

2. **部署后端到 Vercel**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - Root Directory: `backend`
   - 配置环境变量：`MONGODB_URI`, `MONGODB_DB_NAME`, `PORT`
   - 部署

3. **部署前端到 Vercel**
   - 再次导入同一个仓库
   - Root Directory: `frontend`
   - 配置环境变量：`VITE_API_URL=https://你的后端地址.vercel.app/api`
   - 部署

---

## 项目结构

```
mao-mall/
├── backend/          # Node.js + Express + MongoDB
├── frontend/         # Vue 3 + Vant UI
├── README.md         # 项目说明
├── DEPLOYMENT-GUIDE.md  # 详细部署指南
├── PROJECT-SUMMARY.md   # 项目总结
└── start.sh          # 快速启动脚本
```

---

## 常用命令

### 后端
```bash
npm run dev      # 开发模式
npm start        # 生产模式
npm run init-db  # 初始化数据库
node test-connection.js  # 测试连接
```

### 前端
```bash
npm run dev      # 开发模式
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

---

## API 端点

- `GET /health` - 健康检查
- `GET /api/products` - 商品列表
- `GET /api/products/:id` - 商品详情
- `GET /api/categories` - 分类列表
- `GET /api/orders` - 订单列表
- `POST /api/orders` - 创建订单

---

## 测试数据

初始化后会创建：
- ✅ 6 个商品分类
- ✅ 10 个测试商品
- ✅ 3 个测试订单

---

## 需要帮助？

- 📖 查看 `README.md` - 项目说明
- 🚀 查看 `DEPLOYMENT-GUIDE.md` - 详细部署指南
- 📊 查看 `PROJECT-SUMMARY.md` - 项目总结

---

**祝你使用愉快！** 🎉
