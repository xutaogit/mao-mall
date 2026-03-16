Page({
  data: {
    // 替换为你的H5地址
    webUrl: 'https://m.maomall.top/'
  },
  
  onLoad(options) {
    console.log('页面加载，参数:', options)
    
    // 如果需要传递参数到H5
    if (options.path) {
      this.setData({
        webUrl: `https://m.maomall.top/${options.path}`
      })
    }
  },
  
  onShow() {
    console.log('页面显示')
  },
  
  onHide() {
    console.log('页面隐藏')
  },
  
  // 接收H5发送的消息
  onMessage(e) {
    console.log('收到H5消息:', e.detail.data)
    
    // 处理H5发送的消息
    const message = e.detail.data[0]
    if (message.type === 'login') {
      this.handleLogin()
    } else if (message.type === 'pay') {
      this.handlePay(message.data)
    }
  },
  
  // 处理登录
  handleLogin() {
    wx.login({
      success: (res) => {
        console.log('登录成功，code:', res.code)
        // 将code发送到H5
        this.sendMessageToWebView({
          type: 'loginSuccess',
          code: res.code
        })
      }
    })
  },
  
  // 处理支付
  handlePay(payData) {
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: 'RSA',
      paySign: payData.paySign,
      success: (res) => {
        console.log('支付成功')
        this.sendMessageToWebView({
          type: 'paySuccess'
        })
      },
      fail: (err) => {
        console.log('支付失败:', err)
        this.sendMessageToWebView({
          type: 'payFail',
          error: err.errMsg
        })
      }
    })
  },
  
  // 向H5发送消息
  sendMessageToWebView(message) {
    const webView = this.selectComponent('web-view')
    if (webView) {
      webView.postMessage({
        data: message
      })
    }
  }
})

