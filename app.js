//app.js
App({
    IPaddress:'https://weixin.hd123.net.cn/',
  MatterServerId:"",
  RecorderId:"",
  onLaunch: function () {
    console.log(123);
    wx.connectSocket({
      url: "wss://weixin.hd123.net.cn/ws",
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！');
    })
    console.log(wx.getStorageSync('schoolList'))
  }
})