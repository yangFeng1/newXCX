const app = getApp();
Page({
  data: {
    IP: app.IPaddress ,
    VIPlevel: 'VIP1',
    serviceTime:'永久',
    interactionStatus:'insert',
    recordStatus:'start',
    liveStatus:"stop"
  },
  showModel(e){
    console.log(e.currentTarget.dataset.msg);
    wx.showModal({
      title: '提示',
      content: '这是一个模态弹窗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '个人ID：156156'
    });
    // console.log(app);
    var _this = this;
    wx.onSocketOpen(function (res) {
       console.log('WebSocket连接已打开1111！');
     _this.getState('NETCMD_WECHAT_GET_RECORD_STATE');
     _this.getState('NETCMD_WECHAT_GET_LIVE_STATE');
    })
    
    wx.onSocketMessage(function(data) {
      data = JSON.parse(data.data);
      console.log(data);
      _this.transfer(data);
    })
   },
  transfer(data){
    switch (data.cmd + data.code){
      case "NETCMD_WECHAT_RECORD_STOP200"://录制停止成功
      this.setData({ recordStatus:'stop'});
      break;
      case "NETCMD_WECHAT_RECORD_STOP403"://录制停止错误
        wx.showModal({
          title: '错误提示',
          content: '操作失败'
        })
      break;
      case "NETCMD_WECHAT_RECORD_START200"://录制开始成功
        this.setData({ recordStatus: 'start' });
        break;
      case "NETCMD_WECHAT_RECORD_START403"://录制开始失败
        wx.showModal({
          title: '错误提示',
          content: '操作失败'
        })
        break;
      case "NETCMD_WECHAT_RECORD_PAUSE200"://录制暂停成功
        this.setData({ recordStatus: 'pause' });
        break;
      case "NETCMD_WECHAT_RECORD_PAUSE403"://录制暂停错误
        wx.showModal({
          title: '错误提示',
          content: '操作失败'
        })
        break;
      case "NETCMD_WECHAT_RECORD_STARTstartRecord"://返回录制状态（正在录制）
       this.setData({ recordStatus:'start'});
      break;
      case "NETCMD_WECHAT_RECORD_STARTstopRecord"://返回录制状态（停止录制）
       this.setData({ recordStatus:'stop'});
      break;
      case "NETCMD_WECHAT_GET_LIVE_STATEstartLive"://返回直播状态（正在直播）
       this.setData({ liveStatus:'start'});
      break;
      case "NETCMD_WECHAT_GET_LIVE_STATEstopLive"://返回直播状态（停止直播）
       this.setData({ liveStatus:'stop'});
      break;
    }
  },
  collect(e){
    var flag = false;
    var obj = { MatterServerId: app.MatterServerId, name: e.target.dataset.name };
    var schoolList = wx.getStorageSync('schoolList');
    if (!schoolList){
      wx.setStorage({ key: 'schoolList', data: [obj]});
    }else{
      for(var i = 0; i < schoolList.length; i++){
        if (schoolList[i]['MatterServerId'] == obj['MatterServerId']){
          schoolList[i]['name'] = obj['name'];
          flag = true;
          break;
        }
      }
    }
    flag || schoolList.push(obj);
    wx.setStorage({ key: 'schoolList', data: schoolList });
    console.log(wx.getStorageSync('schoolList'));
  },
  sendCmd(e){
  //   {
  //     "cmd": "NETCMD_WECHAT_RECORD_START",
  //     "RecorderId": "8049D24D-A85C-4BCA-A239-094ADF990004"
  // }
    // var obj = { cmd:e.currentTarget.dataset.name,MatterServerId: app.MatterServerId};
     var obj = { cmd:e.currentTarget.dataset.name,MatterServerId:"8049D24D-A85C-4BCA-A239-094ADF990004"};
    var msg = JSON.stringify(obj);
    console.log(msg);
    wx.sendSocketMessage({
      data: msg,
      fail: function(err) {
        console.log(err);
        wx.showModal({
          title: '错误提示',
          content: '发送失败',
          success: function (res) {
            
          }
        })
      }
    })
    
  },
  getState(cmd){
    var obj = {
      "cmd": cmd,
      "RecorderId": "8049D24D-A85C-4BCA-A239-094ADF990004"
  }
  obj = JSON.stringify(obj);
  console.log(obj);
  wx.sendSocketMessage({//获取录制状态
    data: obj,
    fail: function() {
      wx.showModal({
        title: '错误提示',
        content: '获取状态失败'
      })
    }
});
  } 
}) 