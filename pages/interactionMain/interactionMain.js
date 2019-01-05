
const app = getApp();
Page({
    data:{
      IP: app.IPaddress,
      location:0,
      startLocation:0,
      secondPage:true,
      member:false
    },
    onLoad(option){
        if(option.member){
            this.setData({//获取添加成员
                member:JSON.parse(option.member)
            });
        }
        
    },
    onShow(option){
        wx.onSocketMessage(function(res) {
            if(JSON.parse(res.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
            console.log(res);
            res = JSON.parse(res.data)
            switch(res.cmd){
                case "NETCMD_WECHAT_INTERACTION_STOP":
                    var result = res.data.split('"code": "')[1].split('"')[0];
                    if(result == 200){//关闭成功
                        wx.navigateTo({
                            url: '../interaction/interaction'　　// 页面 A
                          })
                    }else{//关闭失败
                        wx.showToast({
                            title:'关闭互动失败',
                            icon: 'none',
                             duration: 1000
                          })
                    }
                break;
            }
        });
        if(this.data.member){
            var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"kickStrangers","param":this.data.member}};
            data = JSON.stringify(data);
            wx.sendSocketMessage({data:data,
            success:function(){console.log(123)}})
        }
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
        // console.log(this.data.location)
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
    },
    close(){//结束互动
        wx.sendSocketMessage({data:'{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": "01012311af05390fccee","data":{"cmd":"quitClass"}}'});
    }
})