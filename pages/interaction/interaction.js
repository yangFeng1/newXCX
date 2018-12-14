const app = getApp();

Page({
    data:{
      IP: app.IPaddress,
      tabarList:[true,false,false],
      startClassList:[false,false]
    },
    switch(e){
      var index = parseInt(e.currentTarget.dataset.index);
      if(this.data.tabarList[index]) return;
      var tabarList = [false,false,false];
      tabarList[index] = true;
      this.setData({
        tabarList:tabarList
      })
    },
    chooseClass(e){
      var index = parseInt(e.currentTarget.dataset.index);
      var array = this.data.startClassList;
      array[index] = array[index]?false: true;
      this.setData({
        startClassList:array
      })
    }
});