App({
  onLaunch() {
    console.log('小程序启动')
    
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        console.log('系统信息:', res)
        this.globalData.systemInfo = res
      }
    })
  },
  
  onShow() {
    console.log('小程序显示')
  },
  
  onHide() {
    console.log('小程序隐藏')
  },
  
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})

