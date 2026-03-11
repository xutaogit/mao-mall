# 🚀 猫商城部署指南

完整的本地测试和生产部署步骤

---

## 📋 前提条件

- Node.js 16+ 已安装
- npm 已安装
- 有稳定的网络连接
- MongoDB 数据库（MongoDB Atlas 或本地）

---

## 🔧 第一步：本地测试

### 1. 配置 MongoDB 数据库

#### 方案 A：使用 MongoDB Atlas（推荐）

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册/登录账号
3. 创建免费集群（M0 Sandbox）
4. 创建数据库用户：
   - 用户名：`admin`
   - 密码：设置一个强密码
5. 配置网络访问：
   - 点击 "Network Access"
   - 添加 IP 地址：`0.0.0.0/0`（允许所有 IP）
6. 获取连接字符串：
   - 点击 "Connect" → "Connect your application"
   - 复制连接字符串，格式如：
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/
     ```

#### 方案 B：使用本地 MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# 连接字符串
mongodb://localhost:27017/
```

### 2. 配置后端环境变量

```bash
cd backend

# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件
nano .env
```

填入以下内容（替换为你的实际值）：

```env
MONGODB_URI=mongodb+srv://admin:your_password@cluster0.xxxxx.mongodb.net/
MONGODB_DB_NAME=mao-mall
PORT=3000
```

### 3. 安装后端依赖并测试

```bash
# 安装依赖
npm install

# 测试数据库连接
node test-connection.js
```

**成功输出：**
```
✅ MongoDB 连接成功！
数据库: mao-mall
```

**如果失败：**
- 检查网络连接
- 确认 MongoDB Atlas 的 IP 白名单包含 `0.0.0.0/0`
- 确认用户名和密码正确

### 4. 初始化数据库

```bash
npm run init-db
```

这会创建：
- 6 个商品分类
- 10 个测试商品
- 3 个测试订单

### 5. 启动后端服务

```bash
npm run dev
```

**成功输出：**
```
🚀 服务器运行在 http://localhost:3000
✅ MongoDB 连接成功
```

### 6. 测试后端 API

打开新终端：

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试商品列表
curl http://localhost:3000/api/products

# 测试分类列表
curl http://localhost:3000/api/categories
```

### 7. 配置并启动前端

打开新终端：

```bash
cd frontend

# 安装依赖
npm install

# 确认 .env 文件存在
cat .env
```

应该看到：
```
VITE_API_URL=http://localhost:3000/api
```

```bash
# 启动前端
npm run dev
```

**成功输出：**
```
  VITE v5.0.0  ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

### 8. 在浏览器中测试

访问：http://localhost:5173

**测试清单：**
- [ ] 首页加载正常
- [ ] 轮播图显示
- [ ] 分类导航显示（6 个分类）
- [ ] 商品列表显示（10 个商品）
- [ ] 点击商品进入详情页
- [ ] 商品详情页显示完整信息
- [ ] 分类页面正常
- [ ] 购物车页面正常
- [ ] 个人中心页面正常

---

## 🌐 第二步：部署到生产环境

### 1. 推送代码到 GitHub

```bash
cd /Users/sam/project/mao-mall

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 猫商城 MongoDB 版本

- Node.js + Express + MongoDB 后端
- Vue3 + Vant UI 前端
- 完整的商品、订单、分类管理功能"

# 设置主分支
git branch -M main

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/mao-mall.git

# 推送
git push -u origin main
```

### 2. 部署后端到 Vercel

#### 2.1 登录 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录

#### 2.2 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 选择你的 GitHub 仓库 `mao-mall`
3. 点击 **"Import"**

#### 2.3 配置后端

**Project Settings:**
- **Project Name:** `mao-mall-backend`
- **Framework Preset:** `Other`
- **Root Directory:** 点击 **"Edit"**，选择 `backend`
- **Build Command:** 留空
- **Output Directory:** 留空
- **Install Command:** `npm install`

#### 2.4 配置环境变量

点击 **"Environment Variables"**，添加：

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:your_password@cluster0.xxxxx.mongodb.net/` |
| `MONGODB_DB_NAME` | `mao-mall` |
| `PORT` | `3000` |

⚠️ **重要：** 使用你实际的 MongoDB 连接字符串！

#### 2.5 部署

1. 点击 **"Deploy"**
2. 等待部署完成（约 1-2 分钟）

✅ **成功标志：**
- 获得部署 URL，例如：`https://mao-mall-backend.vercel.app`

#### 2.6 测试后端 API

```bash
# 替换为你的实际 URL
curl https://mao-mall-backend.vercel.app/health
curl https://mao-mall-backend.vercel.app/api/products
```

**保存你的后端 URL！** 下一步需要用到。

### 3. 部署前端到 Vercel

#### 3.1 更新前端环境变量

在本地修改 `frontend/.env.production`：

```bash
cd frontend
nano .env.production
```

修改为你的后端 URL：
```
VITE_API_URL=https://mao-mall-backend.vercel.app/api
```

提交更改：
```bash
git add frontend/.env.production
git commit -m "chore: 更新生产环境 API 地址"
git push
```

#### 3.2 在 Vercel 导入前端项目

1. 回到 Vercel Dashboard
2. 点击 **"Add New..."** → **"Project"**
3. 再次选择 `mao-mall` 仓库
4. 点击 **"Import"**

#### 3.3 配置前端

**Project Settings:**
- **Project Name:** `mao-mall-h5`
- **Framework Preset:** `Vite`
- **Root Directory:** 点击 **"Edit"**，选择 `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### 3.4 配置环境变量

点击 **"Environment Variables"**，添加：

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://mao-mall-backend.vercel.app/api` |

⚠️ **重要：** 替换为你实际的后端 URL！

#### 3.5 部署

1. 点击 **"Deploy"**
2. 等待部署完成（约 2-3 分钟）

✅ **成功标志：**
- 获得前端 URL，例如：`https://mao-mall-h5.vercel.app`

---

## ✅ 第三步：验证部署

### 1. 访问前端网站

在浏览器中打开你的前端 URL：`https://mao-mall-h5.vercel.app`

### 2. 功能测试

- [ ] 首页加载正常
- [ ] 商品列表显示
- [ ] 点击商品查看详情
- [ ] 分类页面正常
- [ ] 购物车页面正常
- [ ] 个人中心页面正常

### 3. 移动端测试

在手机浏览器中打开，或使用 Chrome DevTools：
1. 按 F12 打开开发者工具
2. 点击设备模拟按钮
3. 选择 iPhone 或 Android 设备
4. 测试所有功能

---

## 🐛 常见问题

### 问题 1：后端部署失败

**错误：** Vercel 构建失败

**解决方案：**
1. 检查 `backend/vercel.json` 是否存在
2. 确认 Root Directory 设置为 `backend`
3. 查看 Vercel 部署日志

### 问题 2：前端无法连接后端

**错误：** 前端显示 "加载失败"

**解决方案：**
1. 检查 `frontend/.env.production` 中的 API URL
2. 确认后端已成功部署
3. 在浏览器 Console 中查看错误
4. 测试后端 API 是否可访问

### 问题 3：MongoDB 连接失败

**错误：** `ECONNREFUSED` 或 `Authentication failed`

**解决方案：**
1. 确认 MongoDB Atlas 的 IP 白名单包含 `0.0.0.0/0`
2. 确认用户名和密码正确
3. 确认连接字符串格式正确
4. 检查 MongoDB 集群是否正常运行

### 问题 4：商品列表为空

**错误：** 前端显示但没有商品

**解决方案：**
1. 确认已运行 `npm run init-db` 初始化数据
2. 在 MongoDB Atlas 中检查数据是否存在
3. 测试后端 API：`curl https://your-backend.vercel.app/api/products`

### 问题 5：环境变量不生效

**解决方案：**
1. 在 Vercel Dashboard 中修改环境变量
2. 点击项目的 **"Deployments"** 标签
3. 点击最新部署右侧的 **"..."** → **"Redeploy"**
4. 取消勾选 **"Use existing Build Cache"**
5. 点击 **"Redeploy"**

---

## 📝 更新代码后重新部署

```bash
# 修改代码后
git add .
git commit -m "描述你的修改"
git push

# Vercel 会自动检测并重新部署
```

---

## 🎯 项目链接

部署完成后，记录以下链接：

- **GitHub 仓库：** https://github.com/你的用户名/mao-mall
- **后端 API：** https://mao-mall-backend.vercel.app
- **前端网站：** https://mao-mall-h5.vercel.app
- **MongoDB Atlas：** https://cloud.mongodb.com

---

## 🎉 完成！

恭喜！你已经成功部署了猫商城。

**下一步建议：**
- 添加用户登录注册功能
- 集成支付系统
- 添加订单管理功能
- 优化性能和 SEO
- 添加数据统计和监控

---

**祝你使用愉快！** 🚀
