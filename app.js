//app.js
var util = require('./utils/util.js');
App({
    IPaddress:'https://weixin.hd123.net.cn/',
  MatterServerId:"",
  RecorderId:"",
  wechatIdUrl:'',
  wechatId:false,
  userInfo:'',
  cover:false,
  socketLinste:true,
  onLaunch: function () {
    var _this = this;
    console.log(this);
    this.linkSocket();
    
  },
  getWeChatId(){
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
  },
  linkSocket(){
    var _this = this;
    wx.connectSocket({
      url: "ws://172.16.1.90:9000/ajaxchattest",
      fail(err){
        console.log('socket链接失败,重新链接')
        _this.linkSocket();
      },
      success(){
        wx.onSocketOpen(function (res) {
          util.monitorSocketClose(_this);
          console.log('WebSocket连接已打开！');
        _this.getWeChatId();
        wx.onSocketMessage(function(data) {
          // data
          console.log(data);
          try{
            data = JSON.parse(data.data);
          }catch(e){
            return;
          }
          switch(data.MysqlCmd){
            case 'NETCMD_WECHAT_USERS_QUERY'://返回用户信息
              _this.userInfo = data.data;
              _this.socketLinste = false;//结束onSocketMessage监听，交由下一页面监听
              _this.cover = false;//关闭遮罩层
              // console.log(_this)
            break;
            case 'NETCMD_WECHAT_GET_WECHATID'://返回微信ID
              _this.wechatId = data.data.wechatId;
              if (_this.result == '200 OK'){//为空代表请求失败重新请求微信id
                _this.getWeChatId();
                break;
              }
              var getUser = {//获取用户信息
                "MysqlCmd": "NETCMD_WECHAT_USERS_QUERY",
                "data":{
                "wechatId":_this.wechatId 
                }
              }
              wx.sendSocketMessage({
                data:JSON.stringify(getUser),
                success:function(){
                  console.log('success');
                }
              })
            break;
          }
          // console.log(_this);
          // console.log(data);
        })      
        })
      }
    })
  }
})