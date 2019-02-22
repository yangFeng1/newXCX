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
      cover:false,
      memberName:false,
      namea:'启动会议',
      joinAcc:false,
      joinPwd:false,
      creatMeetingFlag:true,
      dateTime:[],//预约课堂时间
      user_id:false,
      vsp_id:false,
      startTime:'',
      endTime:'',
      timeFlag:true,//判断当前选择的是开始预约时间还是结束时间 true为开始时间 false为结束时间
      MonthFlag : false,//判断选择的时间否是比现在的时间大,
      DayFlag : false,//判断选择的时间否是比现在的时间大,
      HourFlag : false,//判断选择的时间否是比现在的时间大,
      MinuteFlag : false,//判断选择的时间否是比现在的时间大;
      startTimeValue:[0,0,0,0,0,0],
      user_id:'',
      vsp_id:'',
      meeting_name:'',//创建预约会议的会议主题
      meetingList:[]//预约课堂列表
    },
    onUnload(){
      
    },
    onHide(){
    },
    onShow(){
      var _this = this;
      this.setData({
        cover:true
      })
      console.log(app.interactionIsOver);
      if(app.interactionIsOver){//从互动页面返回到该页面（互动没有退出）直接返回到录播机控制页面
        wx.navigateBack({
            delta: 1　
        })
        return;
      }
      app.flag = true;//处理退出扫码
      this.setData({
        startClassList:[]
      })
      this.socket();
      util.monitorSocketClose(this,function(){
        wx.onSocketOpen(function() {
          // callback
          _this.socket();
        })
      });
      this.getinteraction();//获取互动状态;
      this.getAddress();//获取通讯录
      wx.setNavigationBarTitle({
        title: '互动'
      });
      this.setData({
        dateTime:this.dateTime()
      });
    },
    getappointment(){//获取课堂预约信息
      var data = {};
    },
    getinteraction(){//获取互动状态
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
    },
    getAddress(){//获取通讯录消息
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
            title: '通讯录发送失败重新连接',
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
    },
    memberName(e){
      this.setData({
        memberName:e.detail.value
      })
    },
    socket(){//处理socket返回消息
      var _this = this;
      wx.onSocketMessage(function(data) {
         // console.log(data);
        try{
          JSON.parse(data.data)
        }catch(e){
          // console.log(data);
          console.log('JSON解析错误');
          return;
        }
        var TopicType = JSON.parse(data.data).data.indexOf('interactRespondEventTopic') == -1?true:false;//判断录播机主动推送是否是互动消息
        if(JSON.parse(data.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE" && !TopicType){
          console.log(JSON.parse(data.data).data);
          var res = JSON.parse(JSON.parse(data.data).data.split('<')[1].split('>')[0]);
            switch(res.name){
              case 'recvSendEnter'://通过id加入课堂返回
                 _this.joinClassResult(res);
              break;
              case 'createMeeting'://开启互动回复
                _this.creatMeetingResult(res);
              break;
              case 'getIsInClass'://开启互动回复
                _this.creatMeetingResult(res);
              break;
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
                app.addresList = data.data;
                _this.data.creatMeetingFlag && _this.setData({
                  cover:false
                })
              break;
          }
          switch(data.cmd){
           case 'NETCMD_WECHAT_INTERACTION_OPEN'://开启互动回复
           _this.data.creatMeetingFlag && _this.setData({
            cover:false
          });
          var res
          try{
             res = data.data.split('"code":')[1].split('}')[0];
          }catch(e){
            console.log('解析互动回复消息错误')
            wx.showToast({
              title:'互动开启失败',
              icon: 'none',
               duration: 1000
            });
            _this.setData({
              cover:false
            })
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
            console.log('回复消息开启互动失败');
            wx.showToast({
              title:'互动开启失败',
              icon: 'none',
               duration: 1000
            })
           }
           break;
           case 'NETCMD_WECHAT_INTERACTION_STOP'://关闭互动回复
           break;
           case "NETCMD_WECHAT_INTERACTION_STAFF"://查看互动状态
            console.log(data);
            console.log(app.interactionIsOver);
            var result = data.data.split('"code":')[1].split(',')[0];
            console.log(result);
            if(result == 200 && app.interactionIsOver){//从互动界面返回
              wx.navigateBack({
                delta: 1　
              })
            }else if(result == 200){//该设备正在开启互动
              console.log(data.data);
              var shortid = data.data.split('"shortId":"')[1].split('",')[0];
              // var meetingMode= data.data.split('"meetingMode":')[1].split(',')[0];
              // console.log(shortid)
              // console.log(meetingMode  == 1)
              // console.log(shortid == "" && meetingMode == 1 );
              if(!shortid){//通过是否有shortid判断是否为听讲
                wx.navigateTo({
                  url: '../interactionminor/interactionminor'　　// 页面 A
                })
              }else{
                wx.navigateTo({
                  url: '../interactionMain/interactionMain'　　// 页面 A
                })
              }
            }
           break;
           case 'NETCMD_WECHAT_INTERACTION_JOIN'://加入互动回复
              // if(data.data)
           break;
           case 'NETCMD_WECHAT_INTERACTION_getLocalUserInfo'://获取本地用户信息
                    if(data.data.split('"code":')[1].split(',')[0] == 200){
                        var id = data.data.split('"id":"')[1].split('",')[0];
                        var vsp_id = data.data.split('"vspId":"')[1].split('",')[0];
                        _this.setData({
                            user_id:id,
                            vsp_id:vsp_id
                        })
                        _this.getBookingClass()
                    }else{
                        console.log('获取本地用户信息失败');
                    }
                break;
            case "NETCMD_WECHAT_INTERACTION_meetingCreate"://创建预约会议
                _this.creatMeetingReport(data.data);
            break;
            case "NETCMD_WECHAT_INTERACTION_meetingList"://获取预约课堂列表
                _this.meetingListReport(data.data);
            break;
          }
      })
    },
    meetingListReport(data){//获取预约课堂列表
      var data = JSON.parse(data.split('"data":')[1].split(']')[0]+']');
      console.log(data);
      this.setData({
        meetingList:data
      })
    },
    creatMeetingReport(result){//创建预约会议回复
      if(result.split('"code":')[1].split(',')[0] == 200){
        wx.showToast({
          title:'创建预约成功'
        });
        this.setData({
          model:false
        })
      }else{
        wx.showToast({
          title:'创建预约失败',
          icon:"none"
        })
      }
    },
    creatMeetingResult(res){//广播回复互动开启结果
      var _this = this;
      _this.setData({
        cover:false,
        creatMeetingFlag:true
      })
      if(res.code == 200 ){//开启成功
        var shortid = res.meeting.shortId;//判断是否为加入互动
        console.log(shortid);
        if(!shortid){//没有shortid为加入课堂
          wx.navigateTo({
            url: '../interactionminor/interactionminor'　　// 页面 A
          })
          return;
        };
      var member = [];
      var flag = false;
      console.log(_this.data.addresList);
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
      console.log(flag)
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
      console.log('广播回复互动开启失败')
      wx.showToast({
        title:'互动开启失败',
        icon: 'none',
         duration: 1000
      })
     }
    },
    joinClassResult(res){//加入课堂返回结果
      var _this = this;
      if(res.reason == 'success'){//加入成功
        var msg = {//获取是否在开启互动
          "cmd": "NETCMD_WECHAT_INTERACTION_STAFF",
          "RecorderId": app.RecorderId,
          "data":  {
            "cmd":"getIsInClass"
        }
      }
      msg = JSON.stringify(msg);
      console.log(msg);
       setTimeout(function(){
        _this.setData({
          cover:false
        });
        util.sendSocketMessage({data:msg,that:_this})
       },3000)
      }else{
        wx.showToast({
          title:"加入课堂失败",
          icon:'none',
          duration:1000
        })
      }
    },
    joinClass(e){//获取加入课堂账号密码
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
      this.setData({
        cover:true
      })
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
        // wx.sendSocketMessage({
        //   data:data,
        //   success:function(){
        //     console.log('success');
        //   },
        //   fail:function(){
        //     console.log('fail')
        //   }
        // })
        util.sendSocketMessage({data:data,that:this});
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
      if(index == 2){//进入课堂预约界面
          this.getloactionStatis();//获取本地账号状态
      }
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
      cover:true,
      creatMeetingFlag:false
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
    chooseModel(e){//选择模式
      this.setData({
        pattern: e.currentTarget.dataset.name,
        namea:e.currentTarget.dataset.namea
      })
    },
    appointment(e){//添加课堂
      
      this.setData({
        meeting_name:e.currentTarget.dataset.name
      })
    },
    dateTime(){//初始化选择时间框
      var date = new Date().toLocaleString();
      var year = parseInt(date.split('/')[0]);
      var month = parseInt(date.split('/')[1].split('/')[0]);
      var day = parseInt(date.split('/')[2].split(' ')[0]);
      var text = date.indexOf('上午') == '-1'?'下午':'上午';
      var H = parseInt(date.split(text)[1].split(':')[0]);
      H = H == 12?H:text == '上午'?H:H + 12;
      var M = parseInt(date.split(text)[1].split(':')[1]);
      var S = parseInt(date.split(text)[1].split(':')[2]);
      var arr = [[year+'年',year+1+'年',year+2+'年']];
      var monthArr = this.nyuern(year);
      arr[1] = this.circulation(month,13,'月');
      arr[2] = this.circulation(day,monthArr[month]+1,'日');
      arr[3] = this.circulation(H,24,'时');
      arr[4] = this.circulation(M,60,'分');
      arr[5] = this.circulation(S,60,'秒');
      return arr;
    },
    circulation(mun,mun2,text){
      var arr = [];
      for(var i = mun;i<mun2;i++){
        arr.push(i+text);
      };
      return arr;
    },
    nyuern(y){//判断是否为闰年
      var rn=((y%4==0&&y%100!=0)||y%400==0)?29:28;
      return [31,rn,31,30,31,30,31,31,30,31,30,31];
    },
    bindchange(e){
      console.log(e);
      var flag = this.data.timeFlag;
      var arr = '';
      for(var i = 0; i < e.detail.value.length;i++){
        let text = this.data.dateTime[i][e.detail.value[i]];
        text = text.substr(0,text.length-1);
        switch(i){
          case 0:
            arr = text;
          break;
          case 1:
            arr += '-'+text;
          break;
          case 2:
            arr += '-'+text;
          break; 
          case 3:
            arr += ' '+text;
          break;
          case 4:
            arr += ':'+text;
          break;
          case 5:
            arr += ':'+text;
          break;
        }
      }
      console.log(arr);
      if(this.data.timeFlag){
        this.setData({
          startTime:arr
        })
      }else{
        this.setData({
          endTime:arr
        })
       
      };
      this.setData({
        dateTime:this.dateTime()
      });
    },
    columnchange(e){//改变时间选择器
      // console.log(e);
      var _this = this;
      // var flag = false;
      var monthArr = this.nyuern();
      var oldArr = this.dateTime();
      var column = parseInt(e.detail.column);//移动的第几行
      var value = parseInt(e.detail.value);//移动到的值所在改数组的索引
      var newArr = this.data.dateTime;
      var month = 1;
      var newTimeArr = this.data.startTimeValue;
      newTimeArr[e.detail.column] = e.detail.value;
      newTimeArr[e.detail.column + 1] =0;
      for(var i = column;i< 6;i++){
        switch(i){
          case 0://月
            var res = parseInt(oldArr[0][value]) > parseInt(newArr[0][0]);  
            var K = res?1:oldArr[1][0];//开始时间
            if(res){
              _this.setData({
                MonthFlag:true
              });
              // flag = true;
            }else{
              month = 1;
              _this.setData({
                MonthFlag:false
              });
            }
            newTimeArr[1] == 0;
            newArr[1]  = this.circulation(parseInt(K),13,'月');
          break;
          case 1://日
          var K;
          if(column == 1){
            var res = parseInt(oldArr[1][value]) > parseInt(newArr[1][0]);  
            // K = res?1:oldArr[2][0];
            if(res || _this.data.MonthFlag){
              K = 1;
              _this.setData({
                DayFlag:true
              });
            }else{
              K = oldArr[2][0];
              _this.setData({
                DayFlag:false
              });
            }
            month = newArr[1][value];
          }else{
            _this.setData({
              DayFlag:false
            });
            K = _this.data.MonthFlag?1:oldArr[2][0];
            newTimeArr[2] = 0;
          }
          newArr[2]  = this.circulation(parseInt(K),monthArr[parseInt(month)-1]+1,'日');
          // console.log(monthArr[parseInt(month)-1]+1)
          break;
          case 2://时
            var K;
            if(column == 2){
              var res = parseInt(oldArr[2][value]) > parseInt(newArr[2][0]);  
              // K = res?0:oldArr[3][0];
              if(res || _this.data.MonthFlag || _this.data.DayFlag){
                K=0;
                _this.setData({
                  HourFlag:true
                })
              }else{
                K=oldArr[3][0];
                _this.setData({
                  HourFlag:false
                })
              }
            }else{
              _this.setData({
                HourFlag:false
              })
              K = _this.data.MonthFlag || _this.data.DayFlag?0:oldArr[3][0];
              newTimeArr[3] = 0;
            }
            newArr[3]  = this.circulation(parseInt(K),24,'时');
          break;
          case 3://分
            var K;
            if(column == 3){
              var res = parseInt(oldArr[3][value]) > parseInt(newArr[3][0]);  
              // K = res?0:oldArr[4][0];
              if(res || _this.data.MonthFlag || _this.data.DayFlag || _this.data.HourFlag){
                K = 0;
                _this.setData({
                  MinuteFlag : true
                })
              }else{
                _this.setData({
                  MinuteFlag : false
                })
                K = oldArr[4][0]
              }
            }else{
              _this.setData({
                MinuteFlag : false
              })
              K = _this.data.MonthFlag || _this.data.DayFlag || _this.data.HourFlag?0:oldArr[4][0];
              newTimeArr[4] = 0;
            }
            newArr[4]  = this.circulation(parseInt(K),60,'分');
          break;
          case 4://秒
            var K;
            if(column == 4){
              var res = parseInt(oldArr[4][value]) > parseInt(newArr[4][0]);  
              // K = res?0:oldArr[5][0];
              if(res || _this.data.MonthFlag || _this.data.DayFlag || _this.data.HourFlag || _this.data.MinuteFlag){
                K = 0;
              } else{
                K = oldArr[5][0];
              }
            }else{ 
              K = _this.data.MonthFlag || _this.data.DayFlag || _this.data.HourFlag || _this.data.MinuteFlag?0:oldArr[5][0];
              newTimeArr[5] = 0;
            }
            newArr[5]  = this.circulation(parseInt(K),60,'秒');
            this.setData({
              startTimeValue:newTimeArr
            })
          break;
        }
      };
      this.setData({
        dateTime:newArr
      })
      // console.log(newArr);
    },
    getloactionStatis(){//获取本地账号状态
      var loactionData = {
          "cmd": "NETCMD_WECHAT_INTERACTION_getLocalUserInfo",
          "RecorderId": app.RecorderId,
          "data":   {
              "cmd":"getLocalUserInfo"
              }
      }
        loactionData = JSON.stringify(loactionData);
        util.sendSocketMessage({data:loactionData,that:this});
    },
    choseDate(e){//选择时间
      console.log(e.currentTarget.dataset.name);
      var flag = e.currentTarget.dataset.name == 'start'?true:false;//判断选择的是开始时间还是结束时间 true 为开始时间 false 为结束时间
      this.setData({
        timeFlag:flag
      })
    },
    getBookingClass(){//获取预约课堂
      
      var msg =  {
      "cmd": "NETCMD_WECHAT_INTERACTION_meetingList",
      "RecorderId": app.RecorderId,
      "data":{
      "cmd": "getOrderClassList"
    }
  }
    msg = JSON.stringify(msg);
    util.sendSocketMessage({data:msg,that:this});
    },
    creatBookingClass(){//创建预约课堂

      var msg = {
    "cmd": "NETCMD_WECHAT_INTERACTION_meetingCreate",
    "RecorderId": app.RecorderId,
    "data":     {
      "cmd":"addOrderClass",
      "param":{
          "classMode":"2",
          "className":this.data.meeting_name,
          "start":this.data.startTime,
          // "start":'2019-3-20 19:6:00',
          // "end":'2019-3-20 20:6:00',
          "end":this.data.endTime,
          "conferree":[]
      }
  }
}
console.log(this.data.startTime);
console.log(this.data.endTime);
    msg = JSON.stringify(msg);
    util.sendSocketMessage({data:msg,that:this});
    }
});