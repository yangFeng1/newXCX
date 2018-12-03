const app = getApp();
Page({
  data: {
    IP: app.IPaddress ,
    VIPlevel: 'VIP1',
    serviceTime:'永久',
    interactionStatus:'insert'
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
    console.log(app)
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
  }
}) 