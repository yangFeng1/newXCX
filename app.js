//app.js
var util = require('./utils/util.js');
App({
    IPaddress:'https://weixin.hd123.net.cn/',
  MatterServerId:"",
  RecorderId:false,
  wechatIdUrl:'',
  wechatId:false,
  userInfo:false,
  cover:true,             
  isOut:false,
  flag:true,
  socketLinste:true,
  date:new Date().getTime(),
  onLaunch: function (options) {
    this.linkSocket();
  },
  onShow(){
    var _this = this;
    console.log('小程序从后台进入');
    // wx.connectSocket({
    //   url: "wss://weixin.hd123.net.cn/ws",})
  },
  onHide(){
    // this.cover = true;
    console.log('小程序进入后台');
    // wx.closeSocket();//退出后台是断开连接
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
      url: "wss://weixin.hd123.net.cn/ws",
      //  url: "ws://192.168.3.156:9000/ajaxchattest", 
      //  url: "ws://123.207.167.163:9010/ajaxchattest", 
      fail(err){
        console.error('socket链接失败,重新链接')
        _this.linkSocket();
      },
      success(){
        wx.onSocketOpen(function (res) {
          util.monitorSocketClose(_this);
          console.log('WebSocket连接已打开！');
        //  var msg = {
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
        _this.getWeChatId();
        
        wx.onSocketMessage(function(data) {
          // data 
          console.log(data);
          try{
            data = JSON.parse(data.data);
          }catch(e){
            console.log('返回数据不是一个json格式');
            return;
          }
          switch(data.MysqlCmd){
            case 'NETCMD_WECHAT_USERS_QUERY'://返回用户信息
              _this.userInfo = data.data;
              _this.cover = false;//关闭遮罩层
              _this.socketLinste = false;//结束onSocketMessage监听，交由下一页面监听
              console.log('监听结束');
              console.log(_this);
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