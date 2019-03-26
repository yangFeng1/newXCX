const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
      IP: app.IPaddress,
      schoolName:"",
      className:"",
      recordTime:'00:00:00',
      liveTime:'00:00:00',
      recordStatus:'',
      liveStatus:'',
      cover:false,
      recordOver:true,
      liveOver:true,
      prohibition:true,
      screenFlag:false,
      screen:'screenProhibition.png',
      liveImage:"screenProhibition.png",//直播默认图片
      recordImage:"recordProhibition.png",//录播默认图片
      interactionFlag:false,//互动功能是否可用
      fistFlag:true//第一次返回直播录播消息的时候请求学校信息
    },
    onLoad(option){
      console.log(option);
      app.once  = false;
      wx.setNavigationBarTitle({
        title: app.userInfo.name 
      });
    },
    onShow(){ 
        //  var msg = {
        //     "cmd": "NETCMD_WECHAT_INTERACTION_ANSWER_baseInfo",
        //     "RecorderId": '32321'
        // };
        //   for(var i = 0; i < 6; i++){
        //     wx.sendSocketMessage({
        //       data:JSON.stringify(msg),
        //       success:function(){
        //         console.log('success');
        //       }
        //     })
        //   }
      app.flag = true;
      app.interactionIsOver = false;
      var _this = this;
      
     this.data.timer && clearInterval(this.data.timer);//防止启动多个定时器
      var timer1 = setInterval(function(){//等待初始化完成
          if(!app.socketLinste){//
            console.log('监听开始');
          clearInterval(_this.data.timer);
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
          // getRecordStatus = JSON.stringify(getRecordStatus);
          // _this.setData({
          //   getRecordStatus: getRecordStatus,
          //   getLiveStatus: getLiveStatus
          // })
          getLiveStatus = JSON.stringify(getLiveStatus);
          // console.log(getRecordStatus);
          // console.log(getLiveStatus);
          util.sendSocketMessage({data:getLiveStatus,that:_this});



          // wx.sendSocketMessage({//获取录播状态
          //   data: getLiveStatus ,
          //   success:function(){
          //     console.log('success');
          //   },
          //   fail:function(e){
          //     console.log(e);
          //     wx.closeSocket();e
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
    if(!this.data.prohibition){
      wx.showToast({
        icon:'none',
        title:'录播机未连接'
      });
      return;
    };
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
  },
  live(e){//开关直播
    if(!this.data.prohibition){
      wx.showToast({
        icon:'none',
        title:'录播机未连接'
      });
      return;
    };
    var opa = e.currentTarget.dataset.name == 'record' ? 'recordStatus' :'liveStatus';
    if (this.data[opa] === '')return;//为空代表没有请求到状态,不给与操作
    var type = this.data[opa];//false 为停止直播 true 为正在直播
    var cmd = type? 'stopFilmLive':'startFilmLive';
    //开启直播需要发送2个命令  有一个回复成功即代表直播开启成功
    var msg =  {
      "cmd": "NETCMD_WECHAT_LIVE",
      "RecorderId": app.RecorderId,
      "data":cmd+['[chn[1]]']
  };
    var msg1 =  {
      "cmd": "NETCMD_WECHAT_LIVE",
      "RecorderId": app.RecorderId,
      "data":cmd+['[chn[2]]']
  };
  msg = JSON.stringify(msg);
  msg1 = JSON.stringify(msg1);
  util.sendSocketMessage({data:msg,that:this,success: function() {
    // console.log('success');
      wx.showToast({
        title:'操作成功',
        icon:'none',
        duration:1000
      })
  }});
  util.sendSocketMessage({data:msg1,that:this,success: function() {
    // console.log('success');
      wx.showToast({
        title:'操作成功',
        icon:'none',
        duration:1000
      })
  }});
  },
  socket(){
      var _this = this;
      wx.onSocketMessage(function(res){
        // console.log(res);
        try{
          res = JSON.parse(res.data);
        }catch(e){
          console.log('JSON解析失败');
          return;
        }
        console.log(res);
        if(res.code == 404){//连接录播机失败
          wx.showToast({
            icon:'none',
            title:'连接录播机失败'
          });
      _this.setData({
        recordImage: 'recordProhibition.png',
        liveImage:'screenProhibition.png',
        prohibition:false
       })
          return;
        }
        switch(res.cmd){
          case 'NETCMD_WECHAT_INTERACTION_ANSWER_baseInfo'://获取学校信息
          console.log(res.data)
            _this.showBaseInfo(res.data);
          break;
          case 'NETCMD_WECHAT_INTERACTION_getLocalUserInfo'://获取互动状态
            // console.log('获取互动状态');
            _this.verifyInteractionRes(res.data);
          break;
          case "NETCMD_WECHAT_unLockLocalScreen"://开关锁屏回复
            _this.verifyScreen(res.data);
          break;
          case 'NETCMD_WECHAT_LIVE':
            _this.liveCallBack(res.data);
          break;
        }
        if(res.cmd =="NETCMD_WECHAT_BROADCAST_MESSAGE" || res.cmd =="NETCMD_WECHAT_GET_LIVE_STATE" || res.cmd =="NETCMD_WECHAT_GET_RECORD_STATE"){//录播机主动推送的消息
          _this.setData({
            prohibition:true
          });
          if(_this.data.fistFlag){
              _this.verifyInteraction();//发送查询互动状态命令判断该设备是否有互动功能
              _this.getBaseInfo();//获取学校信息
              // for(var i = 0; i < 6;i++){//测试
              //   _this.getBaseInfo();
              // }
        //         var msg = {
        //     "cmd": "NETCMD_WECHAT_INTERACTION_ANSWER_baseInfo",
        //     "RecorderId": '32321'
        // };
        //   for(var i = 0; i < 60; i++){
        //     wx.sendSocketMessage({
        //       data:JSON.stringify(msg),
        //       success:function(){
        //         console.log('success');
        //       }
        //     })
        //   }
            setTimeout(function(){
              _this.getScreen();//获取锁屏状态
            },100)
            _this.setData({
              fistFlag:false
            })  
          }
          if (res.data.indexOf('<recordTime[') != -1) {//录播消息
            var time = res.data.split('<recordTime[')[1].split(']')[0];
            // console.log(time);
            if (time == '00:00:00') {//停止录播
              // console.log('录播关闭');
              _this.setData({
                recordImage: 'home_video_default.png',
                recordStatus: false,
                recordTime:'00:00:00'
              })
            } else {//正在录播
              // console.log('录制开启');
              _this.setData({
                recordImage: 'home_stop_default.png',
                recordStatus: true,
                recordTime: time
              })
            }
          }
          if (res.data.indexOf('<liveTime[') != -1){//直播状态
            var time = res.data.split('<liveTime[')[1].split(']')[0];
            // console.log(time);
            if (time == '00:00:00') {//直播关闭
              // console.log('直播关闭');
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
              // console.log('直播开启');
            }
          }
          if(res.data.indexOf('lockScreenState')!=-1){//锁屏状态
            var state = res.data.split('lockScreenState[')[1].split(']')[0];
            console.log(state);
            if(state == 0){
              _this.setData({
                screen:'home_live_off.png',
                screenFlag:false
              })
            }else{
              _this.setData({
                screen:'home_live_on.png',
                screenFlag:true
              })
            }
          }
        }
      })
    },
    liveCallBack(res){//处理直播返回
      if(res.split('Success') == -1){
        wx.showToast({
          title:'开启直播失败',
          icon:"none"
        }) 
      }
    },
    verifyScreen(data){//处理锁屏状态回复
      if(data.indexOf('<Success>') != -1){
        wx.showToast({
          title:"操作成功",
          icon:'none'
        })
      }else{
        wx.showToast({
          title:"操作失败",
          icon:'none'
        })
      }
    },
    showBaseInfo(data){//显示学校信息
      try{
        var data = JSON.parse('{' + data.split('{')[1].split('}')[0] + '}');
      }catch(e){
        console.log('没有设置学校信息');
        return;
      }
      console.log(data);
      this.setData({
        "schoolName":data.schoolName,
        "className":data.roomName
      })
    },
    getScreen(){//获取锁屏状态
    //   var msg = {
    //     "cmd": "NETCMD_WECHAT_INTERACTION_lockScreenState",
    //     "RecorderId": app.RecorderId,
    //     "data":"PUT regActiveSynTopic\r\nMsgType:activeSynMsg\r\nMsgId:100\r\nContentLen:15\r\n\r\n<UIManageTopic>"
    // }

    var msg =  {
        "cmd": "NETCMD_WECHAT_INTERACTION_lockScreenState",
          "RecorderId": app.RecorderId
      }
    msg = JSON.stringify(msg);
    util.sendSocketMessage({data:msg,that:this});
    },
    verify(){//验证改设备是否有互动设备

    },
    getBaseInfo(){//获取学校信息
      var msg = {
        "cmd": "NETCMD_WECHAT_INTERACTION_ANSWER_baseInfo",
        "RecorderId": app.RecorderId
    };
    msg = JSON.stringify(msg);
    console.log(msg);
    
    util.sendSocketMessage({data:msg,that:this});
    },
    verifyInteraction(){//发送查询互动状态命令判断该设备是否有互动功能++
      var msg = {"cmd":"NETCMD_WECHAT_INTERACTION_getLocalUserInfo","RecorderId":app.RecorderId,"data":{"cmd":"getLocalUserInfo"}};
      msg = JSON.stringify(msg);
      util.sendSocketMessage({data:msg,that:this});
    },
    verifyInteractionRes(res){//检查该设备是否有互动功能
    console.log(res);
      var data = res.split('"code":')[1].split(',')[0];
      console.log(res.indexOf("Not Authority") != -1);  
      if(res.indexOf("Not Authority") != -1){//没有录播功能
        this.setData({
          interactionFlag:false
        })
      }else{
        this.setData({
          interactionFlag:true
        })
      }
    },
    screen(){
      if(this.data.screen == "screenProhibition.png")return;//录播机为连接或者没有锁屏状态
      if(this.data.screenFlag){//关
        var msg = {
          "cmd": "NETCMD_WECHAT_lockLocalScreen",
          "RecorderId": app.RecorderId
      }
      }else{//开
        var msg = {
          "cmd": "NETCMD_WECHAT_unLockLocalScreen",
          "RecorderId": app.RecorderId
      }
      }
      msg = JSON.stringify(msg);
      util.sendSocketMessage({data:msg,that:this});
    }
});