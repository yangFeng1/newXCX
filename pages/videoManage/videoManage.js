const app = getApp();
Page({
    data:{
        IP: app.IPaddress,
      left:100,
      top:100
    },
  scanTouch(e){
    // console.log(e)
  },
  scanTouchEnd(e){
    // console.log(e);
    
  },
  scanCode(e){
    // console.log(e)
    this.setData({
      left: e.touches[0].clientX-25,
      top: e.touches[0].clientY-25
    })
  }
}) 