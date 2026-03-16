# 微信小程序配置说明

## 项目配置

### 1. AppID配置

编辑 `miniprogram-webview/project.config.json`，将 `YOUR_APPID_HERE` 替换为你的小程序AppID：

```json
{
  "appid": "wx1234567890abcdef"
}
```

获取AppID的方法：
1. 登录 https://mp.weixin.qq.com
2. 进入"设置" → "基本设置"
3. 复制"AppID"

### 2. H5地址配置

编辑 `miniprogram-webview/pages/index/index.js`，修改webUrl：

```javascript
data: {
  webUrl: 'https://your-h5-domain.com'
}
```

### 3. 业务域名配置

在微信公众平台配置业务域名：

1. 登录 https://mp.weixin.qq.com
2. 进入"设置" → "开发设置"
3. 找到"业务域名"
4. 点击"添加"，输入你的H5域名
5. 下载校验文件
6. 将校验文件上传到H5服务器根目录
7. 点击"保存"

### 4. 服务器域名配置

配置后端API域名：

1. 在微信公众平台"开发设置"中
2. 配置"服务器域名"：
   - request合法域名：`https://api.yourdomain.com`
   - uploadFile合法域名：`https://api.yourdomain.com`
   - downloadFile合法域名：`https://api.yourdomain.com`

## 开发配置

### 本地开发

在微信开发者工具中：

1. 点击右上角"详情"
2. 进入"本地设置"
3. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

这样可以在开发时跳过域名校验。

### 调试

使用微信开发者工具的调试功能：

1. 点击"编译"进行编译
2. 在模拟器中查看效果
3. 打开"调试器"查看Console和Network
4. 使用"预览"生成二维码在真机测试

## 小程序与H5通信

### H5向小程序发送消息

在H5中使用以下代码：

```javascript
// 检查是否在小程序中
if (window.__wxjs_environment === 'miniprogram') {
  // 向小程序发送消息
  wx.miniProgram.postMessage({
    data: {
      type: 'login',
      payload: {}
    }
  })
}
```

### 小程序向H5发送消息

在小程序中使用以下代码：

```javascript
// 在onMessage中接收H5消息
onMessage(e) {
  const message = e.detail.data[0]
  // 处理消息
}

// 向H5发送消息
sendMessageToWebView(message) {
  const webView = this.selectComponent('web-view')
  if (webView) {
    webView.postMessage({
      data: message
    })
  }
}
```

## 常见配置问题

### Q: 如何在小程序中使用localStorage？
A: 小程序使用 `wx.setStorage()` 和 `wx.getStorage()` 替代localStorage。

### Q: 如何处理小程序中的网络请求？
A: 使用 `wx.request()` 替代fetch或axios。

### Q: 如何在小程序中上传文件？
A: 使用 `wx.chooseImage()` 选择图片，然后使用 `wx.uploadFile()` 上传。

### Q: 如何处理小程序中的支付？
A: 使用 `wx.requestPayment()` 调用微信支付。

## 安全配置

### HTTPS要求

小程序要求所有网络请求必须使用HTTPS。确保：

1. H5服务器使用HTTPS
2. 后端API使用HTTPS
3. 所有资源（图片、脚本等）都使用HTTPS

### 域名备案

如果使用国内服务器，域名必须进行ICP备案。

### 内容安全

小程序内容必须符合微信小程序运营规范：
- 不能包含违法违规内容
- 不能进行虚假宣传
- 不能涉及赌博、色情等内容

## 性能优化

### 1. 减少包体积

- 删除不必要的文件
- 压缩图片
- 使用CDN加速

### 2. 优化加载速度

- 使用分包加载
- 预加载关键资源
- 缓存静态资源

### 3. 优化H5性能

- 使用懒加载
- 减少DOM操作
- 使用虚拟滚动

## 发布流程

### 1. 上传版本

在微信开发者工具中：
1. 点击右上角"上传"
2. 填写版本号和备注
3. 点击"上传"

### 2. 提交审核

在微信公众平台：
1. 进入"版本管理"
2. 找到刚上传的版本
3. 点击"提交审核"
4. 填写审核信息
5. 提交审核

### 3. 发布上线

审核通过后：
1. 进入"版本管理"
2. 点击"发布"
3. 确认发布

## 相关资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Web-view组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [小程序API文档](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [小程序运营规范](https://developers.weixin.qq.com/miniprogram/product/renzheng.html)

