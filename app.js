//app.js
App({
    IPaddress:'https://weixin.hd123.net.cn/',
  MatterServerId:"",
  RecorderId:"",
  wechatIdUrl:'',
  wechatId:false,
  userInfo:'',
  cover:true,
  socketLinste:true,
  onLaunch: function () {
    var _this = this;
    wx.connectSocket({
      url: "wss://weixin.hd123.net.cn/ws",
    })
    
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！');
      wx.login({
        success: function(res){
          console.log(res.code);
          var getId = {
            "MysqlCmd": "NETCMD_WECHAT_GET_WECHATID",
            "data":{
            "wechatIdUrl":res.code
            }
        }
        getId = JSON.stringify(getId);
          wx.sendSocketMessage({
            data: getId,
            success: function(res){
              console.log(res);
            }
          })
        }
      })

    wx.onSocketMessage(function(data) {
      // data
      console.log(data);
      data = JSON.parse(data.data);
      switch(data.MysqlCmd){
        case 'NETCMD_WECHAT_USERS_QUERY'://返回用户信息
          _this.userInfo = data.data;
          _this.socketLinste = false;
          _this.cover = false;
          console.log(_this)
        break;
        case 'NETCMD_WECHAT_GET_WECHATID'://返回微信ID
          _this.wechatId = data.data.wechatId;
          var getUser = {
            "MysqlCmd": "NETCMD_WECHAT_USERS_QUERY",
            "data":{
            "wechatId":_this.wechatId
            }
          }
          wx.sendSocketMessage({
            data:JSON.stringify(getUser)
          })
        break;
      }
      if(data.MysqlCmd == 'NETCMD_WECHAT_USERS_QUERY'){

      }
      
      console.log(_this);
      console.log(data);
    })      
    })
  }
})