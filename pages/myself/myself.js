const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      inputState:true,
      editText:"编辑",
      userInfo:'',
      wechatId:''
    },
    onLoad(){
        var _this = this;
        this.setData({
            wechatId:app.wechatId
        })
        // console.log(app.userInfo);
        this.setData({
            userInfo:app.userInfo
        });
    },
    onShow(){ 
        var _this = this;
        console.log('show');
        var getUser = {
            "MysqlCmd": "NETCMD_WECHAT_USERS_QUERY",
            "data":{
            "wechatId":this.data.wechatId
            }
          }

          wx.sendSocketMessage({
            data:JSON.stringify(getUser)
          });
            wx.onSocketMessage(function(data) {
                console.log(data);
                data = JSON.parse(data.data);
                console.log(data.data)
                // if(data.MysqlCmd == 'NETCMD_WECHAT_USERS_QUERY'){
                //     _this.setData({
                //         userInfo:data.data
                //     })
                // }
                switch(data.MysqlCmd){
                    case 'NETCMD_WECHAT_USERS_QUERY':
                        _this.setData({
                            userInfo:data.data
                        });
                    break;
                    case 'NETCMD_WECHAT_USERS_UPDATE':
                    console.log(data);
                        if(data.data.result == '200 OK'){
                            wx.showToast({
                                title: '更改成功',
                                icon: 'succes',
                                duration: 1000
                            });
                            _this.setData({
                                inputState:true,
                                editText:'编辑'
                            });
                        }else{
                            wx.showToast({
                                title: '更改失败',
                                icon: 'fail',
                                duration: 1000
                            });
                        }
                    break;
                }
            })
    },
    edit(e){
        // var state = this.data.editText=="编辑"?false:true;
        // var text = state?'编辑':"保存";
        // this.setData({
        //     inputState:state,
        //     editText:text
        // })
        switch(this.data.editText){
            case '编辑':
                this.setData({
                    inputState:false,
                    editText:'保存'
                });
            break;
            case '保存':
            var sendMsg = {
                "MysqlCmd": "NETCMD_WECHAT_USERS_UPDATE",
                "data": {
                    "wechatId": app.wechatId,
                    "name":this.data.name,
                    "gender": this.data.gender,
                    "school": this.data.school
                }
            }
            sendMsg = JSON.stringify(sendMsg);
                wx.sendSocketMessage({
                    data: sendMsg
                })
                
            break;
        }
    },
  bindInput(e){
    console.log(e.currentTarget.dataset.name);
    console.log(e.detail.value);
    var obj = {};
    switch(e.currentTarget.dataset.name){
        case 'name':
            obj['name'] = e.detail.value;
        break;
        case 'gender':
          obj['gender'] = e.detail.value;
        break;
        case 'school':
          obj['school'] = e.detail.value;
        break;
        case 'remark':
          obj['remark'] = e.detail.value;
        break;
    };
    this.setData(obj);
    console.log(obj);   
  }
});