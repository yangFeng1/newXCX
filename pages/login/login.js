const app = getApp();
Page({
    data:{
        data:'1111'
    },
    onLoad(){
        wx.setNavigationBarTitle({
            title: '绑定账号' 
        });
    }
})