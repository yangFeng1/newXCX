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
      pattern:'1',
      cover:false
    },
    onShow(){
      var _this = this;
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
        fail: function() {
          wx.showToast({
            title: '通讯录获取失败',
            icon: 'none',
            duration: 1000
        })
        }
      })
      wx.setNavigationBarTitle({
        title: '互动'
      })
    },
    socket(){
      var _this = this;
      wx.onSocketMessage(function(data) {
        //  console.log(data);
        if(JSON.parse(data.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
        console.log(JSON.parse(data.data));
          data = JSON.parse(data.data);
          switch (data.MysqlCmd) {
            case 'NETCMD_WECHAT_ADDRESS_BOOK_QUERY'://获取通讯录
              _this.setData({
                addresList: data.data
              })
              break;
          }
          switch(data.cmd){
           case 'NETCMD_WECHAT_INTERACTION_OPEN'://开启互动回复
           var res = data.data.split('"code": "')[1].split('"')[0];
           if(res == 200){//开启成功
            var member = [];
            var flag = false;
            _this.data.addresList.forEach(function(i,v){
              if(i.flag){
                member.push(i.accountNumber);
                flag =true;
              } 
            });
            if(flag){
              member = JSON.stringify(member);
              wx.navigateTo({
                url: '../interactionMain/interactionMain?member='+member　　// 页面 A
              })
            }
            wx.navigateTo({
              url: '../interactionMain/interactionMain'　　// 页面 A
            })
           }else{//开启失败
            wx.showToast({
              title:'互动开启失败',
              icon: 'none',
               duration: 1000
            })
           }
           
           break;
           case 'NETCMD_WECHAT_INTERACTION_STOP'://关闭互动回复
           break;
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
    call = JSON.stringify(call);
    wx.sendSocketMessage({
      data: call,
      success:function(){
        console.log(call);
      },
      fail: function() {
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
        pattern: e.currentTarget.dataset.name
      })
    }
});