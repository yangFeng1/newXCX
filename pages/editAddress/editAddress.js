const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      state:true,
      left:'',
      right:'',
      name:'',
      account:'',
      titleName:'',
<<<<<<< HEAD
      Address_book_id:'',
      cover:false
=======
      Address_book_id:''
>>>>>>> 887be145af2dbc7e4e1176f3877bb94bd838813e
    },
    onLoad(option){
      var _this =this;
      console.log(option);
      this.setData({
        state:option.data
      })
      if(option.name){//编辑时填写原始账号密码
        this.setData({
          name:option.name,
        account:option.account,
        Address_book_id:option.Address_book_id
        })
      }
      var titleName ;
      this.setData({
        titleName:option.data
      })
      switch(option.data=='edit'){
        case false:
           titleName = '添加通讯录';
          this.setData({
            left:'取消',
            right:'保存'
          })
        break;
        case true:
           titleName = '编辑通讯录';
          this.setData({
            left:'删除',
            right:'编辑'
          })
        break;
      }
      wx.setNavigationBarTitle({
        title: titleName
      });
      wx.onSocketMessage(function(data) {
        // data
<<<<<<< HEAD
        _this.setData({
          cover:false
        })
=======
>>>>>>> 887be145af2dbc7e4e1176f3877bb94bd838813e
        console.log(JSON.parse(data.data).data.result);
        if(JSON.parse(data.data).data.result == '200 OK'){
          wx.showToast({
            title: '操作成功',
            icon: 'succes',
            duration: 1000
        })
        setTimeout(function(){
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
            success: function(res){
              // success
            },
            fail: function() {
              // fail
            },
            complete: function() {
              // complete
            }
          })
        },1000)
<<<<<<< HEAD
        }else{
          wx.showToast({
            title: '操作失败',
            icon: 'none',
            duration: 1000
        })
        }
      })
    },
    save(){//增加通讯录
      this.setData({
        cover:true
      })
=======
        }
      })
    },
    
    save(){//增加通讯录
>>>>>>> 887be145af2dbc7e4e1176f3877bb94bd838813e
      var user;
      console.log(this.data.titleName);
      if(this.data.titleName == 'add'){//添加
        user = {
          "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_INSERT",
          "data":{
          "usersId":app.userInfo.users_id,
          "remarksName":this.data.name,
          "accountNumber":this.data.account
          }
        }
      }else{//编辑
        user = {
          "MysqlCmd": "NETCMD_WECHAT_ADDRESS_BOOK_UPDATE",
          "data": {
          "Address_book_id":parseInt(this.data.Address_book_id),
          "remarksName":this.data.name,
          "accountNumber":this.data.account
          }
      }
      }
    user = JSON.stringify(user);
    console.log(user);
    wx.sendSocketMessage({
      data: user
    })
    },
    userNameInput(e){
      // console.log(e.detail.value);
      this.setData({
        name:e.detail.value
      })
    },
    userAccoutInput(e){
      // console.log(e)
      this.setData({
        account:e.detail.value
      })
    },
    back(){
      wx.navigateBack({
        delta: 1, // 回退前 delta(默认为1) 页面
        success: function(res){
          // success
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }
});