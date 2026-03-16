# 微信小程序详细部署步骤

## 前置准备

### 1. 注册微信小程序账号
1. 访问 https://mp.weixin.qq.com
2. 点击"立即注册"
3. 选择"小程序"类型
4. 填写账号信息并完成注册
5. 完成主体信息认证（个人或企业）

### 2. 获取小程序信息
登录小程序后台，获取以下信息：
- AppID（小程序ID）
- AppSecret（小程序密钥）

### 3. 安装开发工具
下载并安装微信开发者工具：
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

## 方案一：Web-view 快速部署

### 步骤1：构建H5项目

```bash
# 进入前端项目目录
cd /Users/sam/project/mao-mall/frontend

# 安装依赖（如果还没安装）
npm install

# 构建生产版本
npm run build
```

构建完成后，`dist` 文件夹包含所有静态文件。

### 步骤2：部署H5到服务器

#### 选项A：使用Vercel（推荐）
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
cd frontend
vercel --prod
```

部署完成后会得到一个URL，例如：`https://mao-mall.vercel.app`

#### 选项B：使用自己的服务器
```bash
# 使用SCP上传到服务器
scp -r dist/* user@yourserver.com:/var/www/html/mall/

# 或使用FTP工具上传
```

确保服务器配置了HTTPS（微信小程序要求）。

### 步骤3：配置业务域名

1. 登录微信公众平台 https://mp.weixin.qq.com
2. 进入"设置" → "开发设置"
3. 找到"业务域名"配置
4. 点击"添加"，输入你的H5域名（不含http://或https://）
   例如：`mao-mall.vercel.app`
5. 下载校验文件
6. 将校验文件上传到你的H5服务器根目录
7. 点击"保存"完成验证

### 步骤4：创建小程序项目

1. 打开微信开发者工具
2. 点击"+"创建新项目
3. 填写项目信息：
   - 项目名称：猫商城
   - 目录：选择 `/Users/sam/project/mao-mall/wechat-miniprogram/miniprogram-webview`
   - AppID：填写你的小程序AppID
   - 开发模式：小程序
   - 后端服务：不使用云服务
4. 点击"新建"

### 步骤5：编写小程序代码

项目会自动创建基础文件，我们需要修改它们。

**app.json**
```json
{
  "pages": [
    "pages/index/index"
  ],
  "window": {
    "navigationStyle": "custom",
    "navigationBarTextStyle": "black"
  },
  "sitemapLocation": "sitemap.json"
}
```

**pages/index/index.wxml**
```xml
<web-view src="{{webUrl}}"></web-view>
```

**pages/index/index.js**
```javascript
Page({
  data: {
    webUrl: 'https://mao-mall.vercel.app' // 替换为你的H5地址
  },
  
  onLoad(options) {
    // 如果需要传递参数到H5
    if (options.path) {
      this.setData({
        webUrl: `https://mao-mall.vercel.app${options.path}`
      })
    }
  },
  
  // 接收H5发送的消息
  onMessage(e) {
    console.log('收到H5消息:', e.detail.data)
  }
})
```

**pages/index/index.wxss**
```css
page {
  width: 100%;
  height: 100%;
}
```

**app.js**
```javascript
App({
  onLaunch() {
    console.log('小程序启动')
  },
  
  globalData: {
    userInfo: null
  }
})
```

**app.wxss**
```css
page {
  height: 100%;
  width: 100%;
}
```

### 步骤6：配置服务器域名

1. 在微信开发者工具中，点击右上角"详情"
2. 进入"本地设置"
3. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"（仅开发时）

4. 在微信公众平台配置正式域名：
   - 登录 https://mp.weixin.qq.com
   - 进入"设置" → "开发设置"
   - 配置"服务器域名"：
     - request合法域名：`https://api.yourdomain.com`（后端API域名）
     - uploadFile合法域名：`https://api.yourdomain.com`
     - downloadFile合法域名：`https://api.yourdomain.com`

### 步骤7：测试

1. 在开发者工具中点击"编译"
2. 查看模拟器中的效果
3. 点击"预览"生成二维码
4. 使用手机微信扫码测试

### 步骤8：提交审核

1. 点击右上角"上传"
2. 填写版本号和项目备注
3. 上传成功后，登录微信公众平台
4. 进入"版本管理"
5. 找到刚上传的版本，点击"提交审核"
6. 填写审核信息：
   - 功能页面：首页
   - 标题：商城首页
   - 内容描述：在线购物商城
7. 提交审核，等待审核结果（通常1-7天）

### 步骤9：发布上线

审核通过后：
1. 进入"版本管理"
2. 点击"发布"
3. 确认发布

## 方案二：Taro 原生小程序部署

### 步骤1：安装Taro CLI

```bash
npm install -g @tarojs/cli
```

### 步骤2：创建Taro项目

```bash
cd /Users/sam/project/mao-mall/wechat-miniprogram
taro init mao-mall-taro

# 选择以下选项：
# 框架：Vue3
# TypeScript：否
# CSS预处理器：Sass
# 模板：默认模板
```

### 步骤3：配置项目

编辑 `mao-mall-taro/config/index.js`：

```javascript
const config = {
  projectName: 'mao-mall-taro',
  date: '2024-3-17',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'vue3',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
```

### 步骤4：迁移代码

将原H5项目的代码迁移到Taro项目：

1. 复制 `frontend/src/api` 到 `mao-mall-taro/src/api`
2. 复制 `frontend/src/utils` 到 `mao-mall-taro/src/utils`
3. 将 `frontend/src/views` 中的Vue组件迁移到 `mao-mall-taro/src/pages`
4. 修改路由配置到 `mao-mall-taro/src/app.config.js`

### 步骤5：适配小程序API

修改 `src/utils/request.js`，使用Taro的request API：

```javascript
import Taro from '@tarojs/taro'

const request = (options) => {
  return Taro.request({
    url: `${API_BASE_URL}${options.url}`,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': Taro.getStorageSync('token') || ''
    }
  }).then(res => {
    if (res.statusCode === 200) {
      return res.data
    }
    throw new Error(res.data.message || '请求失败')
  })
}

export default request
```

### 步骤6：开发和测试

```bash
cd mao-mall-taro

# 安装依赖
npm install

# 启动开发模式
npm run dev:weapp
```

在微信开发者工具中打开 `dist/weapp` 目录。

### 步骤7：构建和发布

```bash
# 构建生产版本
npm run build:weapp
```

然后按照方案一的步骤8和步骤9进行审核和发布。

## 注意事项

1. **HTTPS要求**：小程序要求所有网络请求必须使用HTTPS
2. **域名备案**：如果使用国内服务器，域名需要ICP备案
3. **业务域名**：Web-view加载的域名必须在业务域名中配置
4. **服务器域名**：API请求的域名必须在服务器域名中配置
5. **内容审核**：小程序内容需要符合微信小程序运营规范

## 常见问题

### Q: Web-view 白屏？
A: 检查业务域名是否配置正确，H5页面是否使用HTTPS。

### Q: 网络请求失败？
A: 检查服务器域名是否配置，API是否支持HTTPS。

### Q: 如何调试？
A: 使用微信开发者工具的调试功能，查看Console和Network面板。

### Q: 审核不通过？
A: 查看审核反馈，根据要求修改后重新提交。

## 相关资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Web-view组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [Taro官方文档](https://taro-docs.jd.com/)

