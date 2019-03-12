const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    userBaseInfo: {},
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    token: '',
    isSave: 1
  },
  cancelDialog () {
    this.setData({showDialog:false})
  },
  confirmDialog () {
    wx.openSetting({
      success(settingdata) {
        if (settingdata.authSetting["scope.writePhotosAlbum"]) {
          Api.wxShowToast("获取权限成功，再次点击保存到相册",'none',2200)
         } else {
          Api.wxShowToast("获取权限失败",'none',2200)
         }
      }
    })
  },
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor:'#000000',
       backgroundColor:'#F5F6F8'
    });
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        that.setData({token: token});
        let userBaseApi = backApi.userBaseApi+token;

        Api.wxRequest(userBaseApi,'GET',{},(res)=>{
          that.setData({userBaseInfo: res.data.data})
        })
      } else {
        Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
      }
    })
  },
  savePhoto () {
    let that = this;
    let isSave = that.data.isSave*1;
    isSave++;
    let IMG_URL = that.data.userBaseInfo.template_url;
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 2800
    });
    if (isSave===2) {
      that.setData({isSave:isSave});
      setTimeout(()=>{
        wx.downloadFile({
          url: IMG_URL,
          success:function(res){
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                Api.wxShowToast("保存成功~",'none',2200)
              },
              fail: function (err) {
                if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                  that.setData({showDialog:true})
                }
                if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                  that.setData({showDialog:true})
                }
              }
            })
          },
          fail:function(){
            console.log('fail')
          }
        })
      },2900)
    }
  },
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      return {
        title: '选象 让选择简单点',
        path: `/pages/gcindex/gcindex?isUser=1`
      }
    }
  }
})
