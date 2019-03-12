const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const app = getApp();

Page({
  data: {
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    token: '',
    isSave: 1,
    qid: '',
    imgUrl: '',
    imagePath: ''
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
    wx.showToast({
      title: '海报生成中...',
      icon: 'loading',
      duration: 1200
    });
    let that = this;
    let shareApi = backApi.shareApi+options.token;
    let qid = options.qid;
    that.setData({token: options.token});
    let postData = {
      type: 'circle',
      qid: qid
    };
    setTimeout(()=>{
      Api.wxRequest(shareApi,'POST',postData,(res)=>{
        if (res.data.status*1===201) {
          that.setData({
            imagePath:res.data.data.url
          });
        } else {
          Api.wxShowToast("海报出错了，请稍后再试~",'none',2200)
        }
      });
    },1200)
  },
  savePhoto () {
    let that = this;
    let isSave = that.data.isSave*1;
    isSave++;
    let token = that.data.token;
    let IMG_URL = that.data.imagePath;
    let prevPage=that.data.prevPage;
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 3300
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
                let shareMoment = backApi.shareMoment+token;
                Api.wxRequest(shareMoment,'POST',{},(res)=>{
                  let points = res.data.data.points || 0;
                  if (points) {
                    app.tdsdk.event({
                      id: 'poster',
                      label: `保存海报成功`
                    });
                    Api.wxShowToast('图片已保存到相册，赶紧晒一下吧~,可加3积分哦', 'none', 2500);
                    setTimeout(()=> {
                      if (prevPage==='pages/index/index') {
                        wx.reLaunch({url:`/pages/mine/mine`})
                      } else {
                        wx.navigateBack({delta:1})
                      }
                    }, 2400)
                  } else {
                    app.tdsdk.event({
                      id: 'poster',
                      label: `保存海报成功`
                    });
                    Api.wxShowToast('图片已保存到相册，赶紧晒一下吧~', 'none', 2000);
                    setTimeout(()=> {
                      if (prevPage==='pages/index/index') {
                        wx.reLaunch({url:`/pages/mine/mine`})
                      } else {
                        wx.navigateBack({delta:1})
                      }
                    }, 2400)
                  }
                });
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
      },3300)
    }
  },
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      return {
        title: '选象 让选择简单点',
        path: `/pages/gcindex/gcindex`
      }
    }
  },
  onShow () {
    let that=this;
    let pages=getCurrentPages();
    let prevPage=pages[pages.length-2]['__route__'];
    that.setData({prevPage:prevPage});
  }
})
