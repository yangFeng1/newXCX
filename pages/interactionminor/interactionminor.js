const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
        IP: app.IPaddress,
        cover:false,
        loactionData:false,
        speakStatus:0,//0为未申请发言 1申请发言 2正在发言
        meetingMode:0//0为会议 1为课堂
    },
    onHide(){
        this.setData({
            flag:true
          });
          if(_this.interactionIsOvera){

              app.interactionIsOver = false;
          }
        console.log('hide');
    },
    onUnload(){
        console.error('清除定时器-----' + this.data.timer);
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
    onShow(){
        this.setData({
            flag:false,
            interactionIsOvera:false 
          });
          this.socket();
          var loactionData = {
            "cmd": "NETCMD_WECHAT_INTERACTION_getLocalUserInfo",
            "RecorderId": app.RecorderId,
            "data":   {
                "cmd":"getLocalUserInfo"
                }
        }
          loactionData = JSON.stringify(loactionData);
          util.sendSocketMessage({data:loactionData,that:this});
          app.interactionIsOver = true;
          util.monitorSocketClose(this,function(){
            wx.onSocketOpen(function() {
              // callback
              _this.socket();
            })
          });
    },
    socket(){
        var _this = this;
        wx.onSocketMessage(function(res) {
            res = JSON.parse(res.data);
            var TopicType = res.data.indexOf('interactRespondEventTopic') == -1?true:false;//判断录播机主动推送是否是互动消息
            if(res.cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && !TopicType){
                var data = JSON.parse(res.data.split('<')[1].split('>')[0]);
                if(data.name ==  'transStatus')return;
                console.log(data);
                console.log(data.name);
                switch(data.name){
                    case 'recvByeAck' ://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteractiona(data);
                    break;
                    case 'quitClass'://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteractiona(data);
                    break;   
                    case 'recvOver'://获取互动退出信息
                        console.log('退出互动消息');
                        _this.outInteractiona(data);
                    break;  
                    case 'raisehandfeedback'://申请发言回复
                        console.log('申请发言回复');
                    break;   
                }
            }
            if(res.cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && TopicType) return;//不处理录播直播消息
            console.log(res.data);
            switch(res.cmd){
                case 'NETCMD_WECHAT_INTERACTION_APPLY_SPEECH'://申请发言回复
                if(res.data.split('"code":')[1].split('}')[0] == 200){
                    wx.showToast({
                        title:'申请成功',
                        icon: 'none',
                         duration: 1000
                      })
                }else{
                    wx.showToast({
                        title:'申请失败',
                        icon: 'none',
                         duration: 1000
                      })
                }
                break;
                case 'NETCMD_WECHAT_INTERACTION_STOP'://退出互动
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
                case 'NETCMD_WECHAT_INTERACTION_getLocalUserInfo'://获取本地互动信息
                    console.log('获取本地互动信息');
                    var id = res.data.split('"id":"')[1].split('",')[0];
                    _this.setData({
                        addressId:id
                    });
                    var data = {
                        "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
                        "RecorderId": app.RecorderId,
                        "data":  {
                          "cmd":"getIsInClass"
                      }
                    }
                    util.sendSocketMessage({data:JSON.stringify(data),that:_this});
                break;
                case 'NETCMD_WECHAT_INTERACTION_STAFF'://获取去互动在会信息
                    console.log('获取去互动在会信息');
                    var id = _this.data.addressId;
                    var state = res.data.split(id)[1].split('"state":')[1].split(',')[0];
                    var meetingMode = parseInt(res.data.split('"meetingMode":')[1].split(',')[0]);
                    console.log(res.data.split('"meetingMode":')[1]);
                    _this.setData({
                        meetingMode:meetingMode
                    })
                    _this.getStatus(state);
                break;
            }
        })
    },
    getStatus(state){//判定发言状态
        if((parseInt(state) & 0x000001) != 0){//0为在发言中
            this.setData({
                speakStatus:2
            })
        }else if((parseInt(state) & 0x000002) != 0){//是否举手   0为未申请发言
            this.setData({
                speakStatus:1
            })
        };
        console.log(this.data.speakStatus);
    },
    speak(){//申请发言
        var data = {
            "cmd": "NETCMD_WECHAT_INTERACTION_APPLY_SPEECH",
            "RecorderId": app.RecorderId,
            "data":     {
            "cmd": "raiseHand",
            "param": "true"
          }
        }
        data = JSON.stringify(data);
        util.sendSocketMessage({data:data,that:this});
    },
    outInteraction(){//退出互动
        this.setData({
            cover:true
        })
      var data  = {"cmd": "NETCMD_WECHAT_INTERACTION_STOP","RecorderId": app.RecorderId,"data":{"cmd":"quitClass"}}
      data = JSON.stringify(data);
        // wx.sendSocketMessage({data:data,success:function(){console.log(123)}}
        // );
        util.sendSocketMessage({data:data,that:this});
    },
    outInteractiona(result){//处理互动退出信息回复
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
                    }
    },

})