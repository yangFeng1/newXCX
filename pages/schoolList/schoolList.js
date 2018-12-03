const app = getApp();
Page({
    data:{
      schoolList:[]
    },
    onLoad(){
      this.setData({
        schoolList: wx.getStorageSync('schoolList')
      })
    },
  chose(e){
    console.log(e.target.dataset.matterserverid);
    app.matterserverid = e.target.dataset.matterserverid;
    wx.navigateTo({
      url: '../choseClass/choseClass'　　// 页面 A
    })
  }
})