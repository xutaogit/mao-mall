# 微信小程序快速开始指南

## 5分钟快速部署

### 第1步：构建H5项目（2分钟）

```bash
cd /Users/sam/project/mao-mall/frontend
npm run build
```

### 第2步：部署到Vercel（2分钟）

```bash
npm install -g vercel
vercel login
vercel --prod
```

记下返回的URL，例如：`https://mao-mall.vercel.app`

### 第3步：配置小程序（1分钟）

1. 编辑 `miniprogram-webview/pages/index/index.js`
2. 将 `webUrl` 改为你的Vercel URL
3. 编辑 `miniprogram-webview/project.config.json`
4. 将 `appid` 改为你的小程序AppID

### 第4步：在开发者工具中打开

1. 打开微信开发者工具
2. 创建新项目
3. 选择 `miniprogram-webview` 文件夹
4. 填写AppID
5. 点击"新建"

完成！现在可以在模拟器中看到你的商城了。

## 详细步骤

### 准备工作

1. **注册小程序账号**
   - 访问 https://mp.weixin.qq.com
   - 注册并认证

2. **获取AppID**
   - 登录小程序后台
   - 进入"设置" → "基本设置"
   - 复制AppID

3. **安装开发工具**
   - 下载微信开发者工具
   - https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 部署步骤

#### 步骤1：构建H5

```bash
cd frontend
npm install
npm run build
```

#### 步骤2：部署H5

**使用Vercel（推荐）**
```bash
npm install -g vercel
vercel login
cd frontend
vercel --prod
```

**或使用自己的服务器**
```bash
# 上传dist文件夹到你的服务器
scp -r dist/* user@server.com:/var/www/html/mall/
```

#### 步骤3：配置业务域名

1. 登录 https://mp.weixin.qq.com
2. 进入"设置" → "开发设置"
3. 配置"业务域名"
4. 添加你的H5域名
5. 下载校验文件并上传到H5服务器

#### 步骤4：配置小程序

编辑 `miniprogram-webview/pages/index/index.js`：

```javascript
data: {
  webUrl: 'https://your-h5-url.com'  // 改为你的URL
}
```

编辑 `miniprogram-webview/project.config.json`：

```json
{
  "appid": "wx1234567890abcdef"  // 改为你的AppID
}
```

#### 步骤5：在开发者工具中打开

1. 打开微信开发者工具
2. 点击"+"创建新项目
3. 填写项目信息：
   - 项目名称：猫商城
   - 目录：选择 `miniprogram-webview` 文件夹
   - AppID：填写你的AppID
4. 点击"新建"

#### 步骤6：测试

1. 在开发者工具中点击"编译"
2. 在模拟器中查看效果
3. 点击"预览"生成二维码
4. 用手机微信扫码测试

#### 步骤7：提交审核

1. 在开发者工具中点击"上传"
2. 填写版本号和备注
3. 登录微信公众平台
4. 进入"版本管理"
5. 点击"提交审核"
6. 等待审核结果

#### 步骤8：发布上线

审核通过后，点击"发布"即可上线。

## 文件结构

```
wechat-miniprogram/
├── README.md                    # 项目说明
├── DEPLOYMENT.md               # 详细部署步骤
├── CONFIGURATION.md            # 配置说明
├── QUICKSTART.md              # 本文件
└── miniprogram-webview/       # 小程序项目
    ├── app.json               # 小程序配置
    ├── app.js                 # 小程序入口
    ├── app.wxss               # 全局样式
    ├── project.config.json    # 项目配置
    ├── sitemap.json           # 网站地图
    └── pages/
        └── index/
            ├── index.wxml     # 页面模板
            ├── index.js       # 页面逻辑
            └── index.wxss     # 页面样式
```

## 常见问题

### Q: 如何修改小程序名称？
A: 编辑 `project.config.json` 中的 `projectname` 字段。

### Q: 如何修改小程序图标？
A: 在微信公众平台后台上传小程序头像。

### Q: 如何添加更多页面？
A: 在 `pages` 文件夹中创建新文件夹，然后在 `app.json` 中添加页面路径。

### Q: 如何处理小程序中的登录？
A: 使用 `wx.login()` 获取code，发送到后端进行验证。

### Q: 如何在小程序中调用支付？
A: 使用 `wx.requestPayment()` 调用微信支付。

## 下一步

1. 完成快速部署
2. 在真机上测试
3. 根据需要进行定制开发
4. 提交审核并发布

## 获取帮助

- 查看 `DEPLOYMENT.md` 了解详细部署步骤
- 查看 `CONFIGURATION.md` 了解配置说明
- 访问 [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 支持的功能

✅ 商品浏览
✅ 商品搜索
✅ 购物车
✅ 订单管理
✅ 用户中心
✅ 分销推广
✅ 优惠券
✅ 退款售后

## 注意事项

- 确保H5服务器使用HTTPS
- 确保后端API使用HTTPS
- 在微信公众平台配置业务域名和服务器域名
- 小程序内容必须符合微信运营规范
- 定期更新和维护小程序

祝你部署顺利！🎉

