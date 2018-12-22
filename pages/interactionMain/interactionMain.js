
const app = getApp();
Page({
    data:{
      IP: app.IPaddress,
      location:0,
      startLocation:0,
      secondPage:true
    },
    slide(move){
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
            delay: 0
          });
          this.setData({
            location:move
          })
        animation.translate(move, 0).step()
          this.setData({
            ani:  animation.export()
          })
    },
    touchStart(e){
        // console.log(e);
        this.setData({
            startLocation:e.changedTouches[0].pageX
        })
    },
    touchEnd(e){
        // console.log(e);
        console.log(this.data.location)
        var end = e.changedTouches[0].pageX;
        var res = end - this.data.startLocation;
        var location = this.data.location;
        if(Math.abs(res) < 60) return; //移动小于20不翻页
        var move = res>0?location+900:location + -900;
        move>900 && (move = 900);
        move<-900 && (move = -900);
        if(move == this.data.location) return;
         console.log(move)
        this.slide(move);
    }
})