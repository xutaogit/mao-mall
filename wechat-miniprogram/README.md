# 微信小程序部署指南

## 项目概述
本文档说明如何将H5商城页面部署到微信小程序中。

## 部署方案

### 方案一：Web-view 嵌入（推荐快速方案）
直接在小程序中使用 `web-view` 组件加载H5页面。

**优点：**
- 部署快速，改动最小
- H5页面无需修改
- 易于维护和更新

**缺点：**
- 无法使用小程序原生功能
- 性能相对较差
- 用户体验不如原生小程序

### 方案二：Taro/uni-app 转换（推荐完整方案）
使用Taro或uni-app框架将Vue代码转换为小程序代码。

**优点：**
- 可使用小程序原生功能
- 性能更好
- 用户体验更佳

**缺点：**
- 需要重新开发和测试
- 工作量较大

## 快速部署（Web-view 方案）

### 1. 构建H5项目
```bash
cd frontend
npm run build
```

### 2. 部署H5到服务器
将 `frontend/dist` 文件夹上传到你的服务器，获得访问URL。
例如：`https://yourdomain.com/mall`

### 3. 创建小程序项目
在微信开发者工具中创建新项目，选择"小程序"类型。

### 4. 配置小程序
编辑 `app.json`：
```json
{
  "pages": [
    "pages/index/index"
  ],
  "window": {
    "navigationStyle": "custom"
  }
}
```

### 5. 创建Web-view页面
创建 `pages/index/index.wxml`：
```xml
<web-view src="https://yourdomain.com/mall"></web-view>
```

创建 `pages/index/index.js`：
```javascript
Page({
  data: {},
  onLoad() {}
})
```

创建 `pages/index/index.wxss`：
```css
page {
  width: 100%;
  height: 100%;
}
```

### 6. 配置业务域名
在微信公众平台后台配置业务域名：
- 登录 https://mp.weixin.qq.com
- 进入"设置" → "基本设置"
- 配置"业务域名"，添加你的H5服务器域名

### 7. 测试和发布
- 在开发者工具中预览测试
- 提交审核
- 发布上线

## 完整部署（Taro 方案）

### 1. 安装Taro CLI
```bash
npm install -g @tarojs/cli
```

### 2. 创建Taro项目
```bash
taro init mao-mall-miniprogram
cd mao-mall-miniprogram
```

### 3. 复制源代码
将 `frontend/src` 中的代码复制到Taro项目中，进行适配。

### 4. 安装依赖
```bash
npm install
```

### 5. 开发和测试
```bash
npm run dev:weapp
```

### 6. 构建
```bash
npm run build:weapp
```

### 7. 在开发者工具中打开
打开微信开发者工具，选择构建后的 `dist/weapp` 文件夹。

## 关键配置

### 后端API配置
确保后端API支持CORS，并在小程序中正确配置API地址。

在 `frontend/src/utils/request.js` 中：
```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.yourdomain.com'
```

### 小程序权限配置
在 `app.json` 中添加必要的权限：
```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "获取你的位置信息用于收货地址"
    }
  }
}
```

## 常见问题

### Q: 如何处理小程序中的登录？
A: 使用微信登录接口 `wx.login()` 获取code，发送到后端进行验证。

### Q: 如何在小程序中调用支付？
A: 使用微信支付接口 `wx.requestPayment()`。

### Q: 如何处理小程序中的图片上传？
A: 使用 `wx.chooseImage()` 和 `wx.uploadFile()`。

### Q: Web-view 中如何与小程序通信？
A: 使用 `wx.miniProgram.postMessage()` 和 `wx.miniProgram.navigateTo()`。

## 文件结构

```
wechat-miniprogram/
├── README.md                 # 本文档
├── DEPLOYMENT.md            # 详细部署步骤
├── CONFIGURATION.md         # 配置说明
├── miniprogram-example/     # 小程序示例代码
│   ├── app.json
│   ├── app.js
│   ├── app.wxss
│   └── pages/
│       └── index/
│           ├── index.wxml
│           ├── index.js
│           └── index.wxss
└── taro-example/            # Taro项目示例
    ├── package.json
    ├── src/
    └── project.config.json
```

## 下一步

1. 选择合适的部署方案
2. 按照相应的步骤进行部署
3. 在微信开发者工具中测试
4. 提交审核并发布

## 支持

如有问题，请参考：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro官方文档](https://taro.jd.com/)
- [uni-app官方文档](https://uniapp.dcloud.io/)

