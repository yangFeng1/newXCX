const app = getApp();
Page({
    data:{
        IP: app.IPaddress,
        touchStartX:'0',
        show:false,
        step:false//false(滑入)true(滑出)
    },
    onLoad(){
        wx.setNavigationBarTitle({
            title: '通讯录' 
          });
    },
    touchStart(e){
        this.setData({
            touchStartX:e.changedTouches[0].pageX
        });
    },
    TouchMove(e){
        var X = this.data.touchStartX - e.changedTouches[0].pageX;
        console.log(X);
        switch(X>50){
            case true:
                this.setData({
                    step:true
                })
            break;
            case false:
                this.setData({
                    step:false
                })
            break;
            default:
            break;
        }
    },
    touchEnd(e){
        // console.log(this.data.show)
        // console.log(this.data.step)
        if(this.data.show == this.data.step) return;
        this.setData({
            show:this.data.step
        })
        var distance = this.data.step?-177:0;
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
            delay: 0
          });
        //   console.log(distance+'---------');
          animation.translate(distance, 0).step()
          this.setData({
            ani:  animation.export()
          })
    }
})