
//添加一个公共的发送websocket信息的函数
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
      addMemberName:'',
      interactionMemberList:[],
      meetingId:'',
      password:'',
      startClassList:[],
      addresList:app.addresList,//通讯录
      interactionMode:'',
      speak:false,//会议模式下不显示发言按钮
      interactionIsOvera:false////手动退出当前页面直接退出到controlMain页面
    },
    onLoad(option){
        wx.setNavigationBarTitle({
            title: '互动'
          });
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
        var _this = this;
        this.setData({
            flag:false,
            interactionIsOvera:false,
            addresList:app.addresList
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
        // var getInfoTimer = setTimeout(function(){
            // wx.sendSocketMessage({
            //     data: data,
            //     success: function(res){
            //         console.log(123);   // success
            //     }
            // })
            util.sendSocketMessage({data:data,that:_this});
        // },2000)
        // this.setData({
        //     getInfoTimer:getInfoTimer
        // })
        
        this.socket();
        util.monitorSocketClose(this,function(){
          wx.onSocketOpen(function() {
            // callback
            _this.socket();
          })
        });
        this.data.timer || clearTimeout(this.data.timer);
        // var a =  setTimeout(function(){
            console.log(_this.data.member);
            if(_this.data.member){
                var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":_this.data.member}};
                // var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":["W@10000126"]}};
                data = JSON.stringify(data);
                console.log(data);
                // wx.sendSocketMessage({data:data,
                // success:function(){console.log(123)}})
            //    setTimeout(function(){
                util.sendSocketMessage({data:data,that:_this});
            //    })
            }
        // }, 5000);
        // this.setData({
        //     timer:a
        // })
    },
    socket(){
        var _this = this;
        wx.onSocketMessage(function(res) {
            try{JSON.parse(res.data).cmd}catch(e){
                return;
            }
            var res = JSON.parse(res.data);
            // console.log(res);   
            var TopicType = res.data.indexOf('interactRespondEventTopic') == -1?true:false;//判断录播机主动推送是否是互动消息
            if(res.cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && !TopicType){
                // console.log(res.data)
                var data = JSON.parse(res.data.split('<')[1].split('>')[0]);
                if(data.name ==  'transStatus')return;
                console.log(data);
                console.log(data.name);
                switch(data.name){
                    case 'kickStrangers'://踢人回复
                        console.log('踢人回复');
                        _this.kickStrangersInfo(data);
                    break;
                    case 'addStrangers'://拉人回复
                        console.log('拉人回复');
                        _this.setData({
                            cover:false
                        })
                        _this.addStrangers(data);
                    break;
                    case 'sameAddTypeMsg'://拉人回复  
                        console.log('拉人回复');
                        _this.setData({
                            cover:false
                        })
                        _this.addStrangers(data);
                    break;
                    case 'sameCreateTypeMsg'://获取互动信息 
                        console.log('获取互动信息');
                        _this.getIsInClass(data);
                    break;
                    case 'recvSendEnter'://有人通过账号加入
                        console.log('有人通过账号加入');
                        var data = {
                            "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                            "RecorderId": app.RecorderId,
                            "data":  {
                              "cmd":"getIsInClass"
                          }
                        }
                        data = JSON.stringify(data);
                        util.sendSocketMessage({data:data})
                    break;
                    case 'getInClassUsersState'://互动消息发生变化
                        console.log('获取互动信息');
                        var data = {
                            "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                            "RecorderId": app.RecorderId,
                            "data":  {
                              "cmd":"getIsInClass"
                          }
                        }
                        data = JSON.stringify(data);
                        util.sendSocketMessage({data:data})
                    break;       
                    case 'recvByeAck' ://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteraction(data);
                    break;
                    case 'quitClass'://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteraction(data);
                    break;   
                    case 'recvOver'://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteraction(data);
                    break;           
                    case 'recvSelected'://指定发言返回
                        _this.onSpeak(data)
                    break;
                    case 'recvRaiseHand'://有人申请发言
                        // wx.showToast({
                        //     title:'有成员申请发言',
                        //     icon:'none',
                        //     duration:1000
                        // });
                        var data = {
                            "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                            "RecorderId": app.RecorderId,
                            "data":  {
                              "cmd":"getIsInClass"
                          }
                        }
                        data = JSON.stringify(data);
                        console.log(data);
                        util.sendSocketMessage({data:data})
                    break;
                    case 'sameRejectTypeMsg'://有人退出互动
                    console.log('有人退出互动');
                    // wx.showToast({
                    //     title:'有人退出互动',
                    //     icon:'none',
                    //     duration:1000
                    // })
                    var data = {
                        "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                        "RecorderId": app.RecorderId,
                        "data":  {
                          "cmd":"getIsInClass"
                      }
                    }
                    data = JSON.stringify(data);
                    util.sendSocketMessage({data:data})
                    break;
                }
            }
            
            if(res.cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && TopicType) return;//不处理录播直播消息
              console.log(res);
              _this.setData({
                  cover:false
              })
            switch(res.cmd){
                case "NETCMD_WECHAT_INTERACTION_STOP"://互动结束
                _this.setData({
                    cover:false
                })
                var result;
                   try{
                     result = res.data.split('"code":')[1].split(',')[0];
                   }catch(e){
                       console.log('返回json格式错误');
                   }
                    if(result == 200){//关闭成功
                        // app.interactionIsOver = true;//手动退出当前页面直接退出到controlMain页面
                        // _this.interactionIsOvera = true;//判断 是否是手动退出的 true为关闭互动退出
                        // wx.navigateBack({
                        //     delta: 1　
                        //   })
                    }else{//关闭失败
                        wx.showToast({
                            title:'关闭互动失败',
                            icon: 'none',
                             duration: 1000
                          })
                    }
                break;
                case "NETCMD_WECHAT_INTERACTION_DELETE"://互动踢人
                     var result = res.data.split('"code":')[1].split(',')[0];
                    
                     if(result == 1){//踢人成功
                        // var data = {
                        //     "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                        //     "RecorderId": app.RecorderId,
                        //     "data":  {
                        //       "cmd":"getIsInClass"
                        //   }
                        // }
                        // data = JSON.stringify(data);
                        // console.log(data);
                        // setTimeout(function(){
                        //     _this.setData({
                        //         cover:false
                        //     })
                        //     wx.showToast({
                        //         title:'踢出用户成功',
                        //         icon: 'none',
                        //          duration: 1000
                        //       })
                        //     wx.sendSocketMessage({
                        //         data: data,
                        //         success: function(res){
                        //             console.log(123);   // success
                        //         }
                        //     })
                        // },1500)
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
                    var interactionMemberList ='['+res.data.split('"conferees":[')[1].split(']')[0]+']';
                //    }catch(e){}
                console.log(res.data.split('"shortId":"')[1].split('",')[0]);
                console.log(res.data.split('"password":"')[1].split('",')[0]);
                _this.setData({
                    meetingId:res.data.split('"shortId":"')[1].split('",')[0],
                    password:res.data.split('"password":"')[1].split('",')[0],
                    // interactionMode:res.meeting.meetingMode == '0'?'会议':'课堂',
                    interactionMode:res.data.split('"meetingMode":')[1].split(',')[0] == 0?'会议':'课堂',
                    speak:res.data.split('"meetingMode":')[1].split(',')[0] == '0'?false:true
                })
              
                    interactionMemberList = JSON.parse(interactionMemberList).splice(1);
                    interactionMemberList = _this.getMemberState(interactionMemberList) //获取当前成员状态

                    console.log(interactionMemberList);
                    _this.setData({
                        interactionMemberList:interactionMemberList
                    })
                break;
                case 'NETCMD_WECHAT_INTERACTION_ADD'://拉人成功
                var result = res.data.split('"code":')[1].split(',')[0];
                if(result == 1){//拉人成功
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
    onSpeak(data){//处理指定发言返回回复
        this.setData({
            cover:false
        })
        if(data.code == 200){//指定发言成功
            var data = {
                "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                "RecorderId": app.RecorderId,
                "data":  {
                  "cmd":"getIsInClass"
              }
            }
            data = JSON.stringify(data);
            util.sendSocketMessage({data:data,that:this});
        }else{
            wx.showToast({
                title:"指定发言失败",
                icon:'none',
                duration:1000
            })
        }
    },
    outInteraction(result){//处理互动退出信息回复
        var _this = this;
            _this.setData({
                    cover:false
                })
                    if(result.code == 200){//关闭成功
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
    },
    getIsInClass(res){//处理获取互动信息回复
        var _this = this;
                    var interactionMemberList =  res.meeting.conferees;
                _this.setData({ 
                    meetingId:res.meeting.shortId,
                    password:res.meeting.password,
                    interactionMode:res.meeting.meetingMode == '0'?'会议':'课堂',
                    speak:res.meeting.meetingMode == '0'?false:true
                })
                    interactionMemberList = _this.getMemberState(interactionMemberList).splice(1) //获取当前成员状态
                    console.log(interactionMemberList);
                    _this.setData({
                        interactionMemberList:interactionMemberList
                    })
    },
    kickStrangersInfo(result){//处理互动踢人回复
       var _this = this;
        if(result.code == 200){//踢人成功
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
                              util.sendSocketMessage({data:data,that:this})
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
    },
    addStrangers(result){//处理互动拉人回复
        var _this = this;
       
        if(result.code == 200){//拉人成功
                    var data = {
                        "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                        "RecorderId": app.RecorderId,
                        "data":  {
                          "cmd":"getIsInClass"
                      }
                    }
                   if(this.data.addToast){//在本界面操作的才弹出提示框
                    wx.showToast({
                        title:'添加人员成功',
                        icon:'none',
                        duration:1000
                    });
                    this.setData({
                        addToast:true
                    });
                   }
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
                    if(this.data.addToast){//在本界面操作的才弹出提示框
                        wx.showToast({
                            title:'添加人员失败',
                            icon: 'none',
                             duration: 1000
                          });
                          this.setData({
                            addToast:true
                        });
                    }
                    
                }
    },
    getMemberState(memberList){//获取互动成员状态
        memberList.forEach(function(v,i){
           var stateCode = parseInt(v.state) & 0x001000;//0为在线  1为被踢出成员
           var speak = parseInt(v.state) & 0x000001;//0为发言中
           var isOnline = parseInt(v.state) & 0x000800 //0为在会
           v.online = !stateCode && !isOnline ?true:false;
           v.speakImg = speak == 0?'speaker_talk_default.png':'speaker_talk_talking.png';
           v.raiseHand = (parseInt(v.state) & 0x000002) == 0?false:true;//0为未申请发言
           v.order = ++i;
        });
        return memberList;
    },
    addMemberBtn(){//切换添加成员和成员列表界面
        this.setData({
            secondPage:!this.data.secondPage,
            startClassList:[]
        })
    },
    addMember(){//互动添加陌生人
        var list = [];
        var flag = false;
         this.data.addresList.forEach(function(i,v){
              if(i.flag){
                list.push('W@'+i.accountNumber);
                flag =true;
              } 
            });
            console.log(this.data.addMemberName)
        if(this.data.addMemberName) list.push('W@' + this.data.addMemberName);
        if(list[0]){
            this.setData({
                addToast:true
            })
            var data = {"cmd": "NETCMD_WECHAT_INTERACTION_ADD","RecorderId": app.RecorderId,"data": {"cmd":"addStrangers","param":list}};
            data = JSON.stringify(data);
            console.log(data);
            this.setData({
                addMemberName:'',
                cover:true
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
        if(move == -900)return;//暂时屏蔽选择视屏画页面  
        this.slide(move);
    },
    close(){//结束互动
        this.setData({
            cover:true
        })
      console.log('{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": '+app.RecorderId+',"data":{"cmd":"quitClass"}}' );
        wx.sendSocketMessage({data:'{"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": "'+app.RecorderId+'","data":{"cmd":"quitClass"}}',success:function(){console.log(123)}}
        );
    },
    speak(e){//指定或取消发言
        var id = e.currentTarget.dataset.id;
        var order = e.currentTarget.dataset.sn;
        var flag = e.currentTarget.dataset.flag;//flag不为空代表的是判断申请发言操作
        var state;
        if(flag){
            state = !!parseInt(flag);
            var hand = {
                "cmd":"NETCMD_WECHAT_INTERACTION_ANSWER_RAISEHAND",
                "RecorderId": app.RecorderId,
                "data":  {
                    "cmd":"answerRaisehand",
                    "param":
                    {
                        "id":id,
                        "flag":state
                    }
                }
            }
            hand = JSON.stringify(hand);
            util.sendSocketMessage({data:hand,that:this});
        }else{
            state = (e.currentTarget.dataset.state & 0x000001) == 0?true:false;//0为未发言
        }
        console.log(e.currentTarget.dataset.state);
        var data = {
            "cmd": "NETCMD_WECHAT_INTERACTION_SPEAK",
            "RecorderId":app.RecorderId,
            "data":   {
            "cmd":"selectSpeaker",
            "param":{
                "id":id,
                "order":order,
                "flag":state
                    }
            }
        };
        this.setData({
            cover:true
        })
        data = JSON.stringify(data);
       util.sendSocketMessage({data:data});
    },
    chooseClass(e){//选择互动成员
        var index = parseInt(e.currentTarget.dataset.index);
        var array = this.data.startClassList;
        var status = array[index]?false: true;
        array[index] = status;
        var newArr = this.data.addresList;//将选中的item的数据更换成选中状态
        newArr[index].flag = status;
        this.setData({
          startClassList:array,
          addresList:newArr
        })
    }
})




          