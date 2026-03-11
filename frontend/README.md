# 猫商城前端

Vue 3 + Vant UI 构建的移动端电商应用

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 环境变量

开发环境 (`.env`):
```
VITE_API_URL=http://localhost:3000/api
```

生产环境 (`.env.production`):
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

## 部署到 Vercel

1. 更新 `.env.production` 中的 API 地址
2. 推送代码到 GitHub
3. 在 Vercel 导入项目
4. 构建命令：`npm run build`
5. 输出目录：`dist`
6. 部署

## 功能特性

- 商品浏览和搜索
- 商品详情展示
- 分类导航
- 购物车管理
- 个人中心
- 订单管理
