# 猫商城后端 API - MongoDB 版本

Node.js + Express + MongoDB 构建的电商后端服务

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **MongoDB Atlas** - 云数据库
- **Mongoose** - ODM

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 MongoDB 连接信息。

### 3. 测试连接

```bash
node test-connection.js
```

### 4. 初始化数据库

```bash
npm run init-db
```

这会创建：
- 6 个商品分类
- 10 个测试商品
- 3 个测试订单

### 5. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将运行在 http://localhost:3000

## API 端点

### 商品接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PATCH /api/products/:id/publish` - 更新上架状态
- `PATCH /api/products/:id/recommend` - 更新推荐状态

### 订单接口
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PATCH /api/orders/:id/status` - 更新订单状态
- `POST /api/orders/:id/delivery` - 订单发货

### 分类接口
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情

### 健康检查
- `GET /health` - 健康检查

## 数据模型

### Product（商品）
- name - 商品名称
- productSn - 商品编号
- price - 价格
- stock - 库存
- categoryId - 分类ID
- publishStatus - 上架状态
- recommendStatus - 推荐状态

### Order（订单）
- orderSn - 订单编号
- totalAmount - 总金额
- status - 订单状态
- receiverName - 收货人
- receiverPhone - 收货电话

### Category（分类）
- name - 分类名称
- sort - 排序
- showStatus - 显示状态

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `PORT`
4. 部署

## 环境变量

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=mao-mall
PORT=3000
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（自动重启）
npm run dev

# 测试连接
node test-connection.js

# 初始化数据
npm run init-db
```

## 许可证

MIT
