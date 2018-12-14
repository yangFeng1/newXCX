const app = getApp();

Page({
    data:{
      IP: app.IPaddress
    },
    onload(){
        console.log(this.data.IP)
    }
});