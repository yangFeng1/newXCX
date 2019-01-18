const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
      IP: app.IPaddress,
      schoolName:"深圳南山前海第一中学",
      className:"三年级一班",
      recordTime:'00:00:00',
      liveTime:'00:00:00',
      recordImage:'',
      recordStatus:'',
      liveImage:'',
      liveStatus:'',
      cover:false,
      recordOver:true,
      liveOver:true
    },
    onLoad(option){
      console.log(option);
      app.once  = false;
    },
    onShow(){
      app.flag = true;
      app.interactionIsOver = false;
      var _this = this;
    this.data.timer && clearInterval(this.data.timer);//防止启动多个定时器
      var timer1 = setInterval(function(){//等待初始化完成
          if(!app.socketLinste){//
            console.log('监听开始');
          clearInterval(_this.data.timer);
          wx.setNavigationBarTitle({
            title: app.userInfo.name 
          });   
          util.monitorSocketClose(_this,function () {
            wx.onSocketOpen(function () {
              // callback
              _this.socket();
            })
          });
          _this.socket();
          var getRecordStatus = {//获取录播状态
            "cmd": "NETCMD_WECHAT_GET_RECORD_STATE",
            "RecorderId": app.RecorderId
          }
          var getLiveStatus = {//获取直播状态
            "cmd": "NETCMD_WECHAT_GET_LIVE_STATE",
            "RecorderId": app.RecorderId
          }
          getRecordStatus = JSON.stringify(getRecordStatus);
          _this.setData({
            getRecordStatus: getRecordStatus,
            getLiveStatus: getLiveStatus
          })
          getLiveStatus = JSON.stringify(getLiveStatus);
          console.log(getRecordStatus);
          console.log(getLiveStatus);
          util.sendSocketMessage({data:getLiveStatus,that:_this});
          // wx.sendSocketMessage({//获取录播状态
          //   data: getLiveStatus ,
          //   success:function(){
          //     console.log('success');
          //   },
          //   fail:function(e){
          //     console.log(e);
          //     wx.closeSocket();
          //     console.log('发送失败，重新链接')
          //     wx.connectSocket({
          //       url: "wss://weixin.hd123.net.cn/ws",
          //       // url: "ws://172.16.1.90:9000/ajaxchattest",
          //       success:function(){
          //         _this.socket();
          //         wx.onSocketOpen(function() {
          //           console.log('重新打开')
          //           wx.sendSocketMessage({
          //             data: getLiveStatus
          //           })
          //         })
          //       }
          //     })
          //   }
          // })
        //  setTimeout(function(){
        //    wx.sendSocketMessage({//获取直播状态
        //      data: getRecordStatus,
        //      success: function () {
        //        console.log('success');
        //      },
        //      fail: function () {
        //        console.log('fail');
        //      }
        //    })
        //  },300)
          wx.setNavigationBarTitle({
            title: '个人ID：15616'
          });
        }
      },20)
      this.setData({
        timer : timer1
      })
    },
    onHide(){
    },
    onUnload(){
      if(this.data.flag){
        app.flag = true;
        this.setData({
          flag:false
        })
      }else{
        app.flag = false;
      }
      console.log(app.flag);
      console.error('onUnload');
    },
  operation(e){//录制直播开启和关闭
    var cmd ='NETCMD_WECHAT';
    var op = e.currentTarget.dataset.name == 'record' ? '_RECORD_' : '_LIVE_';
    var opa = e.currentTarget.dataset.name == 'record' ? 'recordStatus' :'liveStatus';
    if (this.data[opa] === '')return;//为空代表没有请求到状态,不给与操作
    var type = this.data[opa] ?'STOP':'START';
    cmd += op += type;
    var obj = {
      "cmd":cmd,
      "RecorderId": app.RecorderId
    };
    obj = JSON.stringify(obj);
    util.sendSocketMessage({data:obj,that:this,success: function() {
      // console.log('success');
        wx.showToast({
          title:'操作成功',
          icon:'none',
          duration:1000
        })
    }});
    // wx.sendSocketMessage({
    //   data: obj,
    //   success:function(){
    //     console.log('success');
    //     wx.showToast({
    //       title:'操作成功',
    //       icon:'none',
    //       duration:1000
    //     })
    //   }
    // })
  },
    socket(){
      var _this = this;
      wx.onSocketMessage(function(res){
        //console.log(res);
        try{
          res = JSON.parse(res.data);
        }catch(e){
          console.log('JSON解析失败');
        }
        console.log(res);
        if(res.cmd =="NETCMD_WECHAT_BROADCAST_MESSAGE" || res.cmd =="NETCMD_WECHAT_GET_LIVE_STATE" || res.cmd =="NETCMD_WECHAT_GET_RECORD_STATE"){//录播机主动推送的消息
          if (res.data.indexOf('<recordTime[') != -1) {//录播消息
            var time = res.data.split('<recordTime[')[1].split(']')[0];
            console.log(time);
            if (time == '00:00:00') {//停止录播
              console.log('录播关闭');
              _this.setData({
                recordImage: 'home_video_default.png',
                recordStatus: false,
                recordTime:'00:00:00'
              })
            } else {//正在录播
              console.log('录制开启');
              _this.setData({
                recordImage: 'home_stop_default.png',
                recordStatus: true,
                recordTime: time
              })
            }
          }
          if (res.data.indexOf('<liveTime[') != -1){//直播状态
            var time = res.data.split('<liveTime[')[1].split(']')[0];
            console.log(time);
            if (time == '00:00:00') {//直播关闭
              console.log('直播关闭');
              _this.setData({
                liveImage: 'home_live_off.png',
                liveStatus: false,
                liveTime:'00:00:00'
              })
            } else {//直播开启
              _this.setData({
                liveImage: 'home_live_on.png',
                liveStatus: true,
                liveTime:time
              })
              console.log('直播开启');
            }
          }
        }
      })
    }
});