const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      state:true,
      left:'',
      right:''
    },
    onLoad(option){
      this.setData({
        state:option.data
      })
      var titleName ;
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
    }
});