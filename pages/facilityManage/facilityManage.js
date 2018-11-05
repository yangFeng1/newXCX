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
   },
  collectTouch(){
    this.setData({
      collectUrl: app.IPaddress + 'collect-touch.png'
    })
  },
  collectTouchEnd(){
    this.setData({
      collectUrl: app.IPaddress + 'collect-default.png'
    })
  }
}) 