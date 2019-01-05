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
  // this.cover
 
  wx.onSocketClose(function() {
    // callback
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
    fail(){
      linkSocket();
    }
  })
}
module.exports = {
  formatTime: formatTime,
  monitorSocketClose:monitorSocketClose
}
