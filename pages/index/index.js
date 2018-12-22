const app = getApp()

Page({
  data:{
    scanSrc: app.IPaddress+"scan-default.png",
    IP:app.IPaddress,
    cover:app.cover
  },
  onLoad(options){
    var _this = this;
    wx.setNavigationBarTitle({
      title: '个人ID：15616' 
    });
    var timer = setInterval(function(){//等待app.js的 onSocketMessage 数据处理完之后再由当前页面接手
      console.log(1);
      if(!app.socketLinste){
        console.log(2);
        clearInterval(timer);
        _this.setData({
          cover:app.cover
        })
        wx.onSocketMessage(function(data) {
          // data
          console.log(data);
          data = JSON.parse(data.data);
          console.log(_this);
          console.log(data);
        })  
      }
    },20)
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