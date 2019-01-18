const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 
 * 
 */
const monitorSocketClose = (obj,callback)=>{//处理socket意外关闭
  // this.coverl
    wx.onSocketClose(function() {
      console.error('socket意外关闭，正在重连');
      if(obj.data){//非app.js
        obj.setData({
          cover:true
        });
      }else{//app.js
        obj.cover = true;
      }
      linkSocket();
      callback && callback();
    })
    
  }

const linkSocket = ()=>{//链接socket
  wx.connectSocket({
    url: "wss://weixin.hd123.net.cn/ws",
    // url: "ws://172.16.1.90:9000/ajaxchattest",
    fail(){
      linkSocket();
    }
  })
}
const sendSocketMessage = (obj)=>{//通过socket发送数据
  console.log(obj.data);
     wx.sendSocketMessage({
       data: obj.data,
       success: function(res){
         // success
         console.log('success');
         obj.success && obj.success();
       },
       fail: function() {
         // fail
         wx.showToast({
          title: '连接断开，重新连接',
          icon: 'none',
          duration: 1000
         })
         obj.that && obj.that.setData({
           cover:true
         })
         console.log('fail---util');
         wx.closeSocket();
         wx.connectSocket({
          url: "wss://weixin.hd123.net.cn/ws",
          success:function(){
            wx.onSocketOpen(function() {
              // callback
              console.log('重新打开成功');
              obj.that && obj.that.setData({
                cover:false
              })
              console.log('open');
              wx.sendSocketMessage({
                data: obj.data,
                success: function(res){
                  // success

                }
              })
            })
          }
        })
       },
       complete: function() {
         // complete
       }
     })
}
module.exports = {
  formatTime: formatTime,
  monitorSocketClose:monitorSocketClose,
  sendSocketMessage:sendSocketMessage
}
