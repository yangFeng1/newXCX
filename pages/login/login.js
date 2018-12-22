const app = getApp();
Page({
    data:{
        data:'',
        account:"",
        pwd:"",
      errTips:false
    },
    onLoad(){
        wx.setNavigationBarTitle({
            title: '修改账号' 
        });
        wx.onSocketMessage(function(res){
          console.log(res);
          res = JSON.parse(res.data).data;
          if(res.result == '200 OK'){
            wx.showToast({
              title: '修改成功',
              icon: 'succes',
              duration: 1000
          })
          };
          setTimeout(function(){
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
            })
          },1000)
        })
    },
  getAccount(e){
    // console.log(e);
    var a = e.target.dataset.account;
    var b = e.detail.value;
    if(a == 'account'){
      this.setData({
        "account": b
      })
    }else{
      this.setData({
        "pwd": b
      })
    }
   
  },
  register(){
    var data = {
      "MysqlCmd": "NETCMD_WECHAT_USERS_UPDATE",
      "data": {
          "wechatId": app.wechatId,
          "account":this.data.account,
          "password": this.data.pwd
      }
  };
  data = JSON.stringify(data);
    wx.sendSocketMessage({
      data: data,
    })
  }
})