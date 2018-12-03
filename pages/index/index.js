const app = getApp()

Page({
  data:{
    scanSrc: app.IPaddress+"scan-default.png"
  },
  onLoad(){
    wx.setNavigationBarTitle({
      title: '个人ID：15616' 
    });
    wx.onSocketMessage(function (res) {
      console.log(res);
      res = JSON.parse(res.data);
      if (res.cmd == 'login'){
        if(res.code == 200){
          wx.navigateTo({
            url: '../facilityManage/facilityManage'　　// 页面 A
          })
        }else{
          wx.navigateTo({
            url: '../login/login'　　// 页面 A
          })
        }
      }
    })
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
        console.log( res.result);
        var data = JSON.parse(res.result);
        app.MatterServerId = data.MatterServerId;
        app.RecorderId = data.RecorderId;
        if (data.MatterServerId && data.RecorderId){
         wx.login({
           success:function(res){
             wx.sendSocketMessage({
               data: '{'+
                 '"cmd": "NETCMD_WECHATLOGIN",'+
                 '"MatterServerId": "'+data.MatterServerId+'" ,'+
                 '"RecorderId": "'+data.RecorderId+'" ,'+
                 '"data": {'+
                   '"WeChatId": "'+res.code+'"'+
                 '}'+
               '}'
             })
           }
         })
        }
        
      }
    })
  },
  collect(){
    wx.navigateTo({
      url: '../schoolList/schoolList'　　// 页面 A
    })
  }
})