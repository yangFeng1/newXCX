const app = getApp()

Page({
  data:{
    scanSrc: app.IPaddress+"scan-default.png"
  },
  onLoad(){
    wx.setNavigationBarTitle({
      title: '个人ID：15616' 
    });
    
    
  },
  scanTouch(){
    this.setData({
      scanSrc: app.IPaddress + "scan-touch.png"
    })
  },
  scanTouchEnd(){
    this.setData({
      scanSrc: app.IPaddress + "scan-default.png"
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