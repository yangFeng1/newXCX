const app = getApp();
var util = require('../../utils/util.js');
Page({
    data:{
        IP: app.IPaddress,
        touchStartX:'0',
        show:false,//false(隐藏)true(显示)
        step:false,//false(滑入)true(滑出)
        addresList:'',
        arr:[],//储存通讯录每一个用户的动画对象
        index:''
    },
    onShow(){
        wx.setNavigationBarTitle({
            title: '通讯录' 
          });
      var _this = this;
      util.monitorSocketClose(this,function () {
        wx.onSocketOpen(function () {
          // callback
          _this.socket();   
        })
      });
      this.socket();
        // console.log('show');
        var data = {
            "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_QUERY",
            "data":{
            "usersId":app.userInfo.users_id+''
            }
        }
        data = JSON.stringify(data);
        console.log('show')
        console.log(data);
          wx.sendSocketMessage({
            data: data,
            success:function(){
                console.log(123);
            }
          })
          
      },
      socket(){
        var _this = this;
        wx.onSocketMessage(function (data) {
          // data
          if(JSON.parse(data.data).cmd == "NETCMD_WECHAT_BROADCAST_MESSAGE") return;//不处理录播直播消息
          console.log(data);
          data = JSON.parse(data.data);
          switch (data.MysqlCmd) {
            case 'NETCMD_WECHAT_ADDRESS_BOOK_QUERY'://获取通讯录
              _this.setData({
                addresList: data.data
              })
              break;
            case 'NETCMD_WECHAT_ADDRESS_BOOK_DELETE'://删除返回
              wx.showToast({
                title: '删除成功',
                icon: 'succes',
                duration: 1000
              })
              setTimeout(function () {
                var data = {
                  "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_QUERY",
                  "data": { 
                    "usersId": app.userInfo.users_id+""
                  }
                }
                data = JSON.stringify(data);
                console.log(data);
                wx.sendSocketMessage({
                  data: data,
                  success:function(){console.log(11)
                }
               })
              }, 10)
              break;
          }
          // console.log(data);
        })
      },
    touchStart(e){
        this.setData({
            touchStartX:e.changedTouches[0].pageX
        });
    },
    TouchMove(e){
        var X = this.data.touchStartX - e.changedTouches[0].pageX;
        // console.log(this.data.show);
        switch(X>50){//确定是滑入还是滑出
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
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
            delay: 0
          });
        var newIndex = e.currentTarget.dataset.test;
        if(newIndex != this.data.index){//当移动另一个item时，将上一个item复原
            var systemInfo = wx.getSystemInfoSync();
            animation.translate(0, 0).step();
            var newArr = this.data.arr;
            newArr[this.data.index] = animation.export();
              this.setData({
                  arr:newArr,
                  show:false,
              });
        }
        if(this.data.show == this.data.step) return;//滑入方向和现在的位置一致时不做处理
        var distance = this.data.step?-320:0;
        var systemInfo = wx.getSystemInfoSync();//获取当前设备信息
        animation.translate(distance / 750 * systemInfo.windowWidth, 0).step();//将移动距离换算成当前的设备的距离
        var newArr = this.data.arr;
        newArr[newIndex] = animation.export();
          this.setData({
              arr:newArr,
              index:newIndex,
              show:this.data.step
          });   
    },
    delect(e){//删除通讯录用户
        var newIndex = e.currentTarget.dataset.test;
        var animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'ease',
            delay: 0
          });
          animation.translate(0, 0).step();
          var newArr = this.data.arr;
         newArr[newIndex] = animation.export();
          this.setData({
              arr:newArr
          });
        var delUser = {
            "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_DELETE",
            "data":{
            "Address_book_id":e.currentTarget.dataset.address_book_id
            }
        }
        delUser = JSON.stringify(delUser);
        console.log(delUser);
        wx.sendSocketMessage({
            data: delUser
        })

    }
})