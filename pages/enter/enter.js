const app = getApp();

Page({
    data:{
        cover:false,
        IP:app.IPaddress,
    },
    onLoad(option){
        console.log(option);
        if(option.q){
            wx.redirectTo({
                url: '../index/index?q='+option.q
            })
        }else{
            wx.redirectTo({
                url: '../index/index'
            })
        }
    }
})

