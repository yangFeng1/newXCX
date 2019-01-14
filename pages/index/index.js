const app = getApp()
var util = require('../../utils/util.js');
Page({
  data:{
    scanSrc: app.IPaddress+"scan-default.png",
    IP:app.IPaddress,
    cover:true,
    timer:false
  },
  onShow(options){
    this.setData({
      flag:false
    })
    var _this = this;
    util.monitorSocketClose(this,function(){
      wx.onSocketOpen(function() {
        // callback
        _this.socket();
      })
    });
    this.socket();
  },
  socket(){
    var _this = this;
    this.data.timer && clearInterval(this.data.timer);//防止启动多个定时器
    var timer = setInterval(function(){//等待app.js的 onSocketMessage 数据处理完之后再由当前页面接手
        // console.log(1);
      if(!app.socketLinste){
        console.log(app.RecorderId);
        console.log(app.isOut);
        console.log(app.RecorderId && app.flag)
        if(app.flag && app.RecorderId){
            console.log('进入1');
          app.isOut = true;
          wx.navigateTo({
            url:'../controlMain/controlMain',
            success:function(e){console.log(e)},
            fail:function(e){console.log(e)}
          })
          clearInterval(_this.data.timer);
          return;
        } 
        // console.log(2);
        clearInterval(_this.data.timer);
        _this.setData({
          cover:app.cover
        })
        wx.setNavigationBarTitle({
          title: app.userInfo.name 
        });
        wx.onSocketMessage(function(data) {
          console.log(data);
        })  
      }
    },20);
    this.setData({
      timer:timer
    });
  },
  onHide(){
    clearInterval(this.data.timer);//在退出页面时销毁定时器
    console.error('hide');
    this.setData({
      flag:true
    })
  },
  onUnload(){
    if(this.data.flag){
      app.flag = true;
      this.setData({
        flag:false
      })
    }else{
      this.setData({
        flag:false
      })
      app.flag = false;
    }
    console.log(app.flag);
    console.error('onUnload');
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
  scanCode(){//扫码
    // wx.navigateTo({
    //   url: '../controlMain/controlMain'
    // })
    // wx.scanCode({
    //   success: function(res) {
    //     console.log( res.result);
    //     var data = JSON.parse(res.result);
    //     app.MatterServerId = data.MatterServerId;
    //     app.RecorderId = data.RecorderId;
    //     if (data.MatterServerId && data.RecorderId){
    //      wx.login({
    //        success:function(res){
    //          wx.sendSocketMessage({
    //            data: '{'+
    //              '"cmd": "NETCMD_WECHATLOGIN",'+
    //              '"MatterServerId": "'+data.MatterServerId+'" ,'+
    //              '"RecorderId": "'+data.RecorderId+'" ,'+
    //              '"data": {'+
    //                '"WeChatId": "'+res.code+'"'+
    //              '}'+
    //            '}'
    //          })
    //        }
    //      })
    //     }
    //   }
    // })
    wx.scanCode({
      success: function(res){
        // success
        console.log(res);
        try{
         app.RecorderId = res.result.split('RecorderId=')[1].split('&')[0];
          wx.navigateTo({
            url: '../controlMain/controlMain'
          })
        }catch(e){
          wx.showToast({
            title: '二维码错误',
            icon: 'none',
            duration: 1000
        })
        }
      }
    })
  }
})