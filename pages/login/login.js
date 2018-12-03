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
            title: '绑定账号' 
        });
        wx.onSocketMessage(function(res){
          console.log(res);
          res = JSON.parse(res.data);
          if (res.cmd == 'login') {
            if (res.code == 200) {
              wx.navigateTo({
                url: '../facilityManage/facilityManage'　　// 页面 A
              })
            } else {
              wx.navigateTo({
                url: '../login/login'　　// 页面 A
              })
            }
          }
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
    var account = this.data.account;
    var pwd = this.data.pwd;
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
          // example: 081LXytJ1Xq1Y40sg3uJ1FWntJ1LXyth
          console.log(loginRes.code)
          wx.sendSocketMessage({
            data: '{' +
              '"cmd": "NETCMD_GETWECHATID",' +
              '"WeChatId": "jwipc",' +
              ' "MatterServerId": ' + app.MatterServerId+',' +
              ' "RecorderId": ' + app.RecorderId +',' +
              '"data": [{' +
               +' "wechatId": "' + loginRes.code+'",'+
              +' "account":"' + account + '", ' +
              +' "pwd":"' + pwd+'" '+
              '}'+
              '}'
          })

        }
      }
    });
    
  }
})