
const app = getApp();
Page({
    data:{
      IP: app.IPaddress,
      location:0,
      startLocation:0,
      secondPage:false,//true 添加成员界面  false 成员列表界面
      member:false,
      cover:false,
      addMemberName:true,
      interactionMemberList:[]
    },
    onLoad(option){
        if(option.member){
            this.setData({//获取添加成员
                member:JSON.parse(option.member)
            });
        }
        
    },
  onUnload() {
    console.error('清除定时器-----' + this.data.timer);
    clearInterval(this.data.timer);//在退出页面时销毁定时器
  },
    onShow(option){
        var _this = this;
        wx.onSocketMessage(function(res) {
            try{JSON.parse(res.data).cmd}catch(e){
                return;
            }
            if(JSON.parse(res.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
            console.log(res);
            res = JSON.parse(res.data)
            switch(res.cmd){
                case "NETCMD_WECHAT_INTERACTION_STOP":
                var result;
                   try{
                     result = res.data.split('"code": "')[1].split('"')[0];
                   }catch(e){
                       console.log('返回json格式错误');
                   }
                    if(result == 200){//关闭成功
                        wx.navigateBack({
                            delta: 1　
                          })
                    }else{//关闭失败
                        wx.showToast({
                            title:'关闭互动失败',
                            icon: 'none',
                             duration: 1000
                          })
                    }
                break;
                case "NETCMD_WECHAT_INTERACTION_DELETE"://互动踢人
                     var result = res.data.split('"code": "')[1].split('"')[0];
                     if(result == 200){//踢人成功
                        wx.showToast({
                            title:'踢出用户成功',
                            icon: 'none',
                             duration: 1000
                          })
                        var data = {
                            "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                            "RecorderId": app.RecorderId,
                            "data":  {
                              "cmd":"getIsInClass"
                          }
                        }
                        data = JSON.stringify(data);
                        console.log(data);
                        setTimeout(function(){
                            wx.sendSocketMessage({
                                data: data,
                                success: function(res){
                                    console.log(123);   // success
                                }
                            })
                        },1500)
                    }else{//踢人失败
                        wx.showToast({
                            title:'踢出用户失败',
                            icon: 'none',
                             duration: 1000
                          })
                    }
                break;
                case 'NETCMD_WECHAT_INTERACTION_STAFF'://当前互动状态
                //    try{
                    var interactionMemberList ='['+res.data.split('"conferees": [')[1].split(']')[0]+']';
                //    }catch(e){}
                    interactionMemberList = JSON.parse(interactionMemberList).splice(1);
                    interactionMemberList = _this.getMemberState(interactionMemberList) //获取当前成员状态
                    console.log(interactionMemberList);
                    _this.setData({
                        interactionMemberList:interactionMemberList
                    })
                break;
                case 'NETCMD_WECHAT_INTERACTION_ADD'://拉人成功
                var result = res.data.split('"code": "')[1].split('"')[0];
                if(result == 200){//拉人成功
                    var data = {
                        "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                        "RecorderId": app.RecorderId,
                        "data":  {
                          "cmd":"getIsInClass"
                      }
                    }
                    wx.showToast({
                        title:'添加人员成功',
                        icon:'none',
                        duration:1000
                    })
                    _this.setData({
                        secondPage:false
                    })
                    data = JSON.stringify(data);
                    console.log(data);
                    setTimeout(function(){
                        wx.sendSocketMessage({
                            data: data,
                            success: function(res){
                                console.log(123);   // success
                            }
                        })
                    },2000)
                }else{//拉人失败
                    wx.showToast({
                        title:'邀请用户失败',
                        icon: 'none',
                         duration: 1000
                      })
                }
                break;
            }
        });
        this.data.timer || clearTimeout(this.data.timer);
        var a =  setTimeout(function(){
            if(_this.data.member){
                var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":_this.data.member}};
                // var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":["W@10000126"]}};
                data = JSON.stringify(data);
                console.log(data);
                wx.sendSocketMessage({data:data,
                success:function(){console.log(123)}})
            }
        },5000);
        this.setData({
            timer:a
        })
    },
    getMemberState(memberList){//获取互动成员状态
        memberList.forEach(function(v){
           var stateCode = parseInt(v.state).toString('2')[11];//0为在线  1为被踢出成员
           console.log(parseInt(v.state).toString('2')[11]);
           console.log(parseInt(v.state));
           v.online = stateCode == 1?false:true;
        });
        return memberList;
    },
    addMemberBtn(){//切换添加成员和成员列表界面
        this.setData({
            secondPage:!this.data.secondPage
        })
    },
    addMember(){//开启互动添加陌生人
        if(this.data.addMemberName){
            var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":['W@'+this.data.addMemberName]}};
            data = JSON.stringify(data);
            console.log(data);
            wx.sendSocketMessage({data:data,
                success:function(){console.log(123)}})
        }else{
            wx.showToast({
                title:'请输入成员账号',
                icon: 'none',
                 duration: 1000
              })
        }
    },
    addMemberName(e){
        this.setData({
            addMemberName:e.detail.value
        })
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
    kickStrangers(e){//互动踢人
        var memberAccount = e.currentTarget.dataset.name;
        if(!memberAccount) return;
        memberAccount = 'W@'+memberAccount.replace(/\s*/g,"");
        var data = {
            "cmd": "NETCMD_WECHAT_INTERACTION_DELETE",
            "RecorderId": app.RecorderId,
            "data":    {
            "cmd":"kickStrangers",
            "param":[
                memberAccount
            ]
          }
        }
        data = JSON.stringify(data);
        console.log(data);
        wx.sendSocketMessage({data:data,
        success:function(){console.log(123)}})
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
        //  console.log(move)
        this.slide(move);
    },
    close(){//结束互动
      console.log('{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": "01012311af05390fccee","data":{"cmd":"quitClass"}}' );
        wx.sendSocketMessage({data:'{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": "01012311af05390fccee","data":{"cmd":"quitClass"}}'}
        );
    }
})