const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      inputState:true,
      editText:"编辑"
    },
    onload(){
        
    },
    edit(e){
        var state = this.data.editText=="编辑"?false:true;
        var text = state?'编辑':"保存";
        this.setData({
            inputState:state,
            editText:text
        })
    }
});