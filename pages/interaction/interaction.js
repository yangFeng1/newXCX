const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      tabarList:[true,false,false],
      startClassList:[false,false],
      tabar:'startClass',
      model:false
    },
    switch(e){
      var index = parseInt(e.currentTarget.dataset.index);
      if(this.data.tabarList[index]) return;
      var tabarList = [false,false,false];
      tabarList[index] = true;
      this.setData({
        tabarList:tabarList,
        tabar:e.currentTarget.dataset.name
      })
    },
    chooseClass(e){
      var index = parseInt(e.currentTarget.dataset.index);
      var array = this.data.startClassList;
      array[index] = array[index]?false: true;
      this.setData({
        startClassList:array
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
    }
});