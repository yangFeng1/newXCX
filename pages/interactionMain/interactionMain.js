
const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
      IP: app.IPaddress,
      location:0,
      startLocation:0,
      secondPage:false,//true 添加成员界面  false 成员列表界面
      member:false,
      cover:false,
      addMemberName:true,
      interactionMemberList:[],
      meetingId:'',
      password:'',
      interactionIsOvera:false
    },
    onLoad(option){
        if(option.member){
            this.setData({//获取添加成员
                member:JSON.parse(option.member)
            });
        }
    },
    onHide(){
        this.setData({
            flag:true
          });
          if(_this.interactionIsOvera){
              app.interactionIsOver = false;
          }
      },
  onUnload() {
    console.error('清除定时器-----' + this.data.timer);
    clearInterval(this.data.timer);//在退出页面时销毁定时器
    clearInterval(this.data.getInfoTimer);//在退出页面时销毁定时器
    if(this.data.flag){
        app.flag = true;
        this.setData({
          flag:false
        })
      }else{
        app.flag = false;
      }
        console.log(app.flag);
        console.log('onUnload');
  },
    onShow(option){
        this.setData({
            flag:false,
            interactionIsOvera:false
          });
          app.interactionIsOver = true;
          var data = {
            "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
            "RecorderId": app.RecorderId,
            "data":  {
              "cmd":"getIsInClass"
          }
        }
        data = JSON.stringify(data);
        console.log(data);
        var getInfoTimer = setTimeout(function(){
            wx.sendSocketMessage({
                data: data,
                success: function(res){
                    console.log(123);   // success
                }
            })
        },5000)
        this.setData({
            getInfoTimer:getInfoTimer
        })
        var _this = this;
        this.socket();
        util.monitorSocketClose(this,function(){
          wx.onSocketOpen(function() {
            // callback
            _this.socket();
          })
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
    socket(){
        var _this = this;
        wx.onSocketMessage(function(res) {
            try{JSON.parse(res.data).cmd}catch(e){
                return;
            }
            
            if(JSON.parse(res.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE"){
                console.log(JSON.parse(res.data).data)
            }
            if(JSON.parse(res.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
            console.log(res.data);
            res = JSON.parse(res.data);
            switch(res.cmd){
                case "NETCMD_WECHAT_INTERACTION_STOP"://互动结束
                _this.setData({
                    cover:false
                })
                var result;
                   try{
                     result = res.data.split('"code": "')[1].split('"')[0];
                   }catch(e){
                       console.log('返回json格式错误');
                   }
                    if(result == 200){//关闭成功
                        app.interactionIsOver = true;//手动退出当前页面直接退出到controlMain页面
                        _this.interactionIsOvera = true;//判断 是否是手动退出的 true为关闭互动退出
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
                            _this.setData({
                                cover:false
                            })
                            wx.showToast({
                                title:'踢出用户成功',
                                icon: 'none',
                                 duration: 1000
                              })
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
                console.log(res.data.split('"shortId": "')[1].split('",')[0]);
                console.log(res.data.split('"password": "')[1].split('",')[0]);
                _this.setData({
                    meetingId:res.data.split('"shortId": "')[1].split('",')[0],
                    password:res.data.split('"password": "')[1].split('",')[0]
                })
              
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
    },
    getMemberState(memberList){//获取互动成员状态
        memberList.forEach(function(v){
           var stateCode = parseInt(v.state) & 0x001000;//0为在线  1为被踢出成员
           console.log(stateCode);
           v.online = stateCode == 0?true:false;
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
            this.setData({
                addMemberName:''
            })
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
        this.setData({
            cover:true
        })
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
        this.setData({
            cover:true
        })
      console.log('{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": '+app.RecorderId+',"data":{"cmd":"quitClass"}}' );
        wx.sendSocketMessage({data:'{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": "'+app.RecorderId+'","data":{"cmd":"quitClass"}}',success:function(){console.log(123)}}
        );
    }
})