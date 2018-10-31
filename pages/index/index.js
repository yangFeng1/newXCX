const app = getApp()

Page({
  data:{
    scanSrc:"../../images/scan-default.png"
  },
  onLoad(){
    wx.setNavigationBarTitle({
      title: '个人ID：15616' 
    });
    // wx.connectSocket({
    //   url: "wss://47.92.205.121:9000",
    // })
    // wx.onSocketOpen(function (res) {
    //   console.log('WebSocket连接已打开！')
    // })
    
  },
  scanTouch(){
    this.setData({
      scanSrc:"../../images/scan-touch.png"
    })
  },
  scanTouchEnd(){
    this.setData({
      scanSrc:"../../images/scan-default.png"
    })
  },
  scanCode(){
    wx.scanCode({
      success: function(res) {
        console.log('success');
        wx.navigateTo({
          url: '../login/login'　　// 页面 A
        })
      },
      fail: function(res) {
        console.log('fail')
        wx.navigateTo({
          url: '../login/login'　　// 页面 A
        })
      }
    })
  }
})