const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
      IP: app.IPaddress,
      tabarList:[true,false,false],
      startClassList:[false,false],
      tabar:'startClass',
      model:false,
      choose:false,
      hideFlag:false,
      addresList:[],
      selectedAddress:'',
      pattern:'0',
      cover:true,
      memberName:false,
      namea:'启动会议',
      joinAcc:false,
      joinPwd:false
    },
    onUnload(){
      if(this.data.flag){
        app.flag = true;
        this.setData({
          flag:false
        })
      }else{
        app.flag = false;
      }
    },
    onHide(){
      this.setData({
        flag:true
      })
    },
    onShow(){
      this.setData({
        cover:true
      })
      app.flag = true;
      var _this = this;
      this.setData({
        startClassList:[]
      })
      var data = {//获取是否在开启互动
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
        },200)
      this.socket();
      util.monitorSocketClose(this,function(){
        wx.onSocketOpen(function() {
          // callback
          _this.socket();
        })
      });
      var addressList = {
        "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_QUERY",
        "data":{
          "usersId":app.userInfo.users_id+''
        }
    }
    addressList = JSON.stringify(addressList);
      wx.sendSocketMessage({
        data: addressList,
        success:function(){
          console.log('获取通讯录');
        },
        fail: function(e) {
          console.log(e);
          wx.showToast({
            title: '通讯录获取失败',
            icon: 'none',
            duration: 1000
        });
        console.log(e);
              wx.closeSocket();
              console.log('发送失败，重新链接')
              wx.connectSocket({
                url: "wss://weixin.hd123.net.cn/ws",
                // url: "ws://172.16.1.90:9000/ajaxchattest",
                success:function(){
                  _this.socket();
                  wx.onSocketOpen(function() {
                    console.log('重新打开')
                    wx.sendSocketMessage({
                      data: addressList
                    })
                  })
                }
              })
        }
      })
      wx.setNavigationBarTitle({
        title: '互动'
      })
    },
    memberName(e){
      this.setData({
        memberName:e.detail.value
      })
    },
    socket(){
      var _this = this;
      wx.onSocketMessage(function(data) {
         console.log(data);
        try{
          JSON.parse(data.data)
        }catch(e){
          console.log(data);
          console.log('JSON解析错误');
          return;
        }
        var TopicType = JSON.parse(data.data).data.indexOf('interactRespondEventTopic') == -1?true:false;//判断录播机主动推送是否是互动消息
        if(JSON.parse(data.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && !TopicType){
          console.log(JSON.parse(data.data).data)
           _this.setData({
            cover:false
          });
          var res = JSON.parse(JSON.parse(data.data).data.split('<')[1].split('>')[0]);
          
           if(res.code == 200 && res.name == 'createMeeting'){//开启成功
            var member = [];
            var flag = false;
            _this.data.addresList.forEach(function(i,v){
              if(i.flag){
                member.push('W@'+i.accountNumber);
                flag =true;
              } 
            });
            if(_this.data.memberName){
              flag = true;
              member.push('W@'+_this.data.memberName);
            }
            if(flag){
              member = JSON.stringify(member);
              wx.navigateTo({
                url: '../interactionMain/interactionMain?member='+member　　// 页面 A
              })
            }else{
              wx.navigateTo({
                url: '../interactionMain/interactionMain'　　// 页面 A
              })
            }
            
           }else{//开启失败
            wx.showToast({
              title:'互动开启失败',
              icon: 'none',
               duration: 1000
            })
           }
        }
        if(JSON.parse(data.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
        console.log(JSON.parse(data.data));
          data = JSON.parse(data.data);
          switch (data.MysqlCmd) {
            case 'NETCMD_WECHAT_ADDRESS_BOOK_QUERY'://获取通讯录
              _this.setData({
                addresList: data.data
              })
              _this.setData({
                cover:false
              })
              break;
          }
          switch(data.cmd){
           case 'NETCMD_WECHAT_INTERACTION_OPEN'://开启互动回复
           _this.setData({
            cover:false
          });
          var res
          try{
             res = data.data.split('"code": "')[1].split('"')[0];
          }catch(e){
            // wx.showToast({
            //   title:'互动开启失败',
            //   icon: 'none',
            //    duration: 1000
            // })
            return;
          }
           if(res == 200){//开启成功
            var member = [];
            var flag = false;
            _this.data.addresList.forEach(function(i,v){
              if(i.flag){
                member.push('W@'+i.accountNumber);
                flag =true;
              } 
            });
            if(_this.data.memberName){
              flag = true;
              member.push('W@'+_this.data.memberName);
            }
            // if(flag){
            //   member = JSON.stringify(member);
            //   wx.navigateTo({
            //     url: '../interactionMain/interactionMain?member='+member　　// 页面 A
            //   })
            // }else{
            //   wx.navigateTo({
            //     url: '../interactionMain/interactionMain'　　// 页面 A
            //   })
            // }
            
           }else{//开启失败
            // wx.showToast({
            //   title:'互动开启失败',
            //   icon: 'none',
            //    duration: 1000
            // })
           }
           break;
           case 'NETCMD_WECHAT_INTERACTION_STOP'://关闭互动回复
           break;
           case "NETCMD_WECHAT_INTERACTION_STAFF":
            console.log(data);
            console.log(app.interactionIsOver);
            if(data.data.split('"code": "')[1].split('"')[0] == 200 && app.interactionIsOver){
              wx.navigateBack({
                delta: 1　
              })
            }else if(data.data.split('"code": "')[1].split('"')[0] == 200){
              wx.navigateTo({
                url: '../interactionMain/interactionMain'　　// 页面 A
              })
            }
           break;
           case 'NETCMD_WECHAT_INTERACTION_JOIN'://加入互动回复
              // if(data.data)
           break;
          }
      })
    },
    joinClass(e){
      var name = e.currentTarget.dataset.name;
      var value = e.detail.value;
      if(name == 'account'){
        this.setData({
            joinAcc:value
        })
      }else{
        this.setData({
            joinPwd:value
        })
      }
    },
    enterClass(){//加入课堂
        var data = {
                        "cmd": "NETCMD_WECHAT_INTERACTION_JOIN",
                        "RecorderId": app.RecorderId,
                        "data":   {
                        "cmd": "JoinClass",
                        "param": {
                          "classId": this.data.joinAcc,
                          "password": this.data.joinPwd
                        }
                      }
                    }
        data = JSON.stringify(data);
        wx.sendSocketMessage({
          data:data,
          success:function(){
            console.log('success');
          },
          fail:function(){
            console.log('fail')
          }
        })
    },
    allClick(e){
      // console.log(!this.data.hideFlag);
      
    if (!this.data.hideFlag){
      this.setData({
        hideFlag: true 
      })
      return;
    };
      this.setData({
        choose:false,
        hideFlag: true
      })
    }, 
    switch(e){
      var index = parseInt(e.currentTarget.dataset.index);
      if(index == 0){
        this.setData({
          choose:!this.data.choose,
          hideFlag:this.data.choose
        })
      }
      if(this.data.tabarList[index]) return;
      var tabarList = [false,false,false];
      tabarList[index] = true;
      this.setData({
        tabarList:tabarList,
        tabar:e.currentTarget.dataset.name
      })
    
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
    },
    modal(e){
      switch(e.currentTarget.dataset.name == 'false'){
        case false:
          this.setData({
            model:true
          })
        break;
        case true:
          this.setData({
            model:false
          })
        break;
      }
    },
    call(){//开启互动
      var _this = this;
      var pattern = this.data.pattern;
      var call = {
        "cmd": "NETCMD_WECHAT_INTERACTION_OPEN",
        "RecorderId": app.RecorderId,
        "data":{
            "cmd":"createMeeting",
            "param":{
                "conferees":[
                           ],
                "classMode":pattern+"",
                "className":"meeting",
                    }
            }
    }
    this.setData({
      cover:true
    })
    call = JSON.stringify(call);
    console.log(call);
    wx.sendSocketMessage({
      data: call,
      success:function(){
        console.log(1);
      },
      fail: function() {
        _this.setData({
          cover:false
        });
        wx.showToast({
          title: '开启失败',
          icon: 'none',
          duration: 1000
        })
       
      }
    })
    },
    chooseModel(e){
      this.setData({
        pattern: e.currentTarget.dataset.name,
        namea:e.currentTarget.dataset.namea
      })
    }
});