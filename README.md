# 🐱 猫商城 (Mao Mall)

基于 MongoDB + Node.js + Vue3 的现代化电商系统

## 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose
- RESTful API

### 前端
- Vue 3 + Vite
- Vant UI (移动端组件库)
- Pinia (状态管理)
- Axios

## 项目结构

```
mao-mall/
├── backend/              # Node.js 后端
│   ├── src/
│   │   ├── config/      # 数据库配置
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── scripts/     # 初始化脚本
│   │   └── index.js     # 入口文件
│   ├── .env.example     # 环境变量模板
│   └── package.json
├── frontend/            # Vue3 前端 H5 商城
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── views/      # 页面组件
│   │   ├── router/     # 路由配置
│   │   ├── utils/      # 工具函数
│   │   └── styles/     # 样式文件
│   ├── .env.production # 生产环境变量
│   └── package.json
├── admin/               # Vue3 后台管理系统
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── views/      # 页面组件
│   │   ├── router/     # 路由配置
│   │   └── utils/      # 工具函数
│   └── package.json
└── README.md
```

## 快速开始

### 1. 配置 MongoDB 数据库

#### 使用 MongoDB Atlas（推荐）

1. 访问 https://www.mongodb.com/cloud/atlas
2. 创建免费集群
3. 创建数据库用户
4. 获取连接字符串

#### 使用本地 MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb
```

### 2. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 MongoDB 连接信息

# 测试数据库连接
node test-connection.js

# 初始化数据库（创建测试数据）
npm run init-db

# 启动服务
npm run dev
```

后端将运行在 http://localhost:3000

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

### 4. 启动后台管理系统（可选）

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后台管理系统将运行在 http://localhost:5174

## 功能模块

### H5 商城（frontend）
- ✅ 首页（轮播图、分类导航、商品列表）
- ✅ 商品详情
- ✅ 分类浏览
- ✅ 购物车
- ✅ 个人中心
- 🚧 订单管理
- 🚧 收货地址
- 🚧 用户登录注册

### 后台管理系统（admin）
- ✅ 商品管理（列表、添加、编辑、删除、上下架）
- ✅ 订单管理（列表、详情、发货）
- ✅ 分类管理（列表、详情）
- 🚧 用户管理
- 🚧 数据统计

### 后端 API
- ✅ 商品管理（CRUD、上下架、推荐）
- ✅ 订单管理（创建、查询、发货）
- ✅ 分类管理
- 🚧 用户认证
- 🚧 购物车管理

## API 文档

### 商品接口

- `GET /api/products` - 获取商品列表
  - 参数：page, pageSize, keyword, categoryId
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PATCH /api/products/:id/publish` - 更新上架状态
- `PATCH /api/products/:id/recommend` - 更新推荐状态

### 订单接口

- `GET /api/orders` - 获取订单列表
  - 参数：page, pageSize, orderSn, status
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PATCH /api/orders/:id/status` - 更新订单状态
- `POST /api/orders/:id/delivery` - 订单发货

### 分类接口

- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情

## 环境变量

### 后端 (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=mao-mall
PORT=3000
```

### 前端 (.env.production)
```
VITE_API_URL=你的后端API地址
```

## 部署

### 后端部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目，选择 backend 目录
3. 配置环境变量：
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `PORT`
4. 部署

### 前端部署到 Vercel

1. 更新 `frontend/.env.production` 中的 API 地址
2. 在 Vercel 导入项目，选择 frontend 目录
3. 构建命令：`npm run build`
4. 输出目录：`dist`
5. 配置环境变量：`VITE_API_URL`

## 数据模型

### Product（商品）
- name - 商品名称
- productSn - 商品编号
- price - 价格
- originalPrice - 原价
- stock - 库存
- sales - 销量
- categoryId - 分类ID
- publishStatus - 上架状态（0-下架，1-上架）
- recommendStatus - 推荐状态（0-不推荐，1-推荐）
- newStatus - 新品状态（0-非新品，1-新品）

### Order（订单）
- orderSn - 订单编号
- totalAmount - 总金额
- status - 订单状态（0-待付款，1-待发货，2-已发货，3-已完成，4-已关闭）
- receiverName - 收货人
- receiverPhone - 收货电话
- receiverAddress - 收货地址

### Category（分类）
- name - 分类名称
- icon - 分类图标
- sort - 排序
- showStatus - 显示状态（0-不显示，1-显示）

## 测试数据

运行 `npm run init-db` 会创建：
- 6 个商品分类（手机数码、电脑办公、家用电器、服饰鞋包、美妆护肤、运动户外）
- 10 个测试商品（iPhone、MacBook、AirPods 等）
- 3 个测试订单

## 开发

```bash
# 后端开发
cd backend
npm run dev

# 前端开发
cd frontend
npm run dev

# 后台管理开发
cd admin
npm run dev

# 初始化数据库
cd backend
npm run init-db
```

## 待开发功能

查看 `TODO.md` 了解详细的待开发功能清单。

### 核心缺失功能（优先级 P0）
- [ ] 用户认证系统（注册、登录、JWT）
- [ ] 购物车完整功能（持久化、同步）
- [ ] 订单完整流程（支付、取消、确认收货）
- [ ] 收货地址管理（CRUD、默认地址）

### 重要功能（优先级 P1）
- [ ] 支付功能集成（微信、支付宝）
- [ ] 商品搜索优化（全文搜索、搜索建议）
- [ ] 商品评价系统（评价、回复、审核）
- [ ] 优惠券系统（创建、领取、使用）

**详细功能清单和开发路线图请查看：** `TODO.md`

## 项目文档

- `README.md` - 项目说明（当前文件）
- `QUICKSTART.md` - 快速开始指南
- `DEPLOYMENT-GUIDE.md` - 详细部署指南
- `TODO.md` - 待开发功能清单
- `PROJECT-CLEANUP.md` - 项目清理总结

## 许可证

MIT

## 作者

xutaogit
