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
      cover:false
    },
    onShow(){
      wx.setNavigationBarTitle({
        title: app.userInfo.name 
      });
      var _this = this;       
      util.monitorSocketClose(this,function () {
        wx.onSocketOpen(function () {
          // callback
          _this.socket();
        })
      });
      this.socket();
      var getRecordStatus = {//获取录播状态
        "cmd": "NETCMD_WECHAT_GET_RECORD_STATE",
        "RecorderId": app.RecorderId
      }
      var getLiveStatus = {//获取直播状态
        "cmd": "NETCMD_WECHAT_GET_LIVE_STATE",
        "RecorderId": app.RecorderId
      }
      getRecordStatus = JSON.stringify(getRecordStatus);
      this.setData({
        getRecordStatus: getRecordStatus,
        getLiveStatus: getLiveStatus
      })
      getLiveStatus = JSON.stringify(getLiveStatus);
      console.log(getRecordStatus);
      console.log(getLiveStatus);
      wx.sendSocketMessage({//获取录播状态
        data: getLiveStatus ,
        success:function(){
          console.log('success');
          
        },
        fail:function(){
          console.log('fail')
        }
      })
     setTimeout(function(){
       wx.sendSocketMessage({//获取直播状态
         data: getRecordStatus,
         success: function () {
           console.log('success');
         },
         fail: function () {
           console.log('fail');
         }
       })
     },300)
      wx.setNavigationBarTitle({
        title: '个人ID：15616'
      });
    },
    onUnload(){
      app.RecorderId = '';//退出录播控制界面时清除recoreid
    },
  operation(e){
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
    wx.sendSocketMessage({
      data: obj,
      success:function(){
        console.log('success')
      }
    })
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
// switch (res.cmd+res.data) {
//   case 'NETCMD_WECHAT_GET_RECORD_STATErecordTopic[stopRecord]':
//       _this.setData({
//         recordImage: 'home_video_default.png',
//         recordStatus:false
//       })
//   break;
//   case 'NETCMD_WECHAT_GET_RECORD_STATErecordTopic[startRecord]': 
//     _this.setData({
//       recordImage: 'home_stop_default.png',
//       recordStatus: true
//     })
//   break;
//   case 'NETCMD_WECHAT_GET_LIVE_STATEliveTopic[stopLive]':
//     _this.setData({
//       liveImage: 'home_live_off.png',
//       liveStatus:false
//     })
//   break;
//   case 'NETCMD_WECHAT_GET_LIVE_STATEliveTopic[startLive]':
//     _this.setData({
//       liveImage: 'home_live_on.png',
//       liveStatus:true
//     })
//   break;
//   case 'NETCMD_WECHAT_LIVE_START403':
//     wx.sendSocketMessage({//开始直播失败
//       data: _this.data.getLiveStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_LIVE_START200':
//     wx.sendSocketMessage({//开始直播成功
//       data: _this.data.getLiveStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_LIVE_STOP200':
//     wx.sendSocketMessage({//关闭直播成功
//       data: _this.data.getLiveStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_LIVE_STOP403':
//     wx.sendSocketMessage({//关闭直播失败
//       data: _this.data.getLiveStatus
//     })
//     break;    
//   case 'NETCMD_WECHAT_RECORD_STOP200':
//     wx.sendSocketMessage({//停止录播成功
//       data: _this.data.getRecordStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_RECORD_STOP403':
//     wx.sendSocketMessage({//停止录播失败
//       data: _this.data.getRecordStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_RECORD_START200':
//     wx.sendSocketMessage({//开始录播成功
//       data: _this.data.getRecordStatus
//     })
//     break;
//   case 'NETCMD_WECHAT_RECORD_START200':
//     wx.sendSocketMessage({//开始录播失败
//       data: _this.data.getRecordStatus
//     })
//     break;
// }