
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const ImgLoader = require('../../components/img-loader/img-loader.js');

//缩略图 80x50 3KB
const imgUrlThumbnail = 'https://fabu.choosen.79643.com/images/share_img/2018/08/01/6aae0da5d57e3a335be3a3e8faecf21d.jpg';

Page({

  /**
   * 页面的初始数据
   */
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showToast({
      title: '海报生成中...',
      icon: 'loading',
      duration: 1200
    });
    let that = this;
    that.imgLoader = new ImgLoader(that);

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
          // that.loadImage();
        } else {
          Api.wxShowToast("海报出错了，请稍后再试~",'none',2200)
        }
      });
    },1200)

  },
  // loadImage() {
  //   //加载缩略图
  //   this.setData({
  //     msg: '大图正在拼命加载..',
  //     imgUrl: imgUrlThumbnail
  //   });
  //
  //   //同时对原图进行预加载，加载成功后再替换
  //   this.imgLoader.load(this.data.imagePath, (err, data) => {
  //     console.log('图片加载完成', err, data.src)
  //     this.setData({ msg: '大图加载完成~' })
  //
  //     if (!err)
  //       this.setData({ imgUrl: data.src })
  //   })
  // },
  savePhoto () {
    let that = this;
    let isSave = that.data.isSave*1;
    isSave++;
    let token = that.data.token;
    let IMG_URL = that.data.imagePath;
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
                    Api.wxShowToast('图片已保存到相册，赶紧晒一下吧~,可加3积分哦', 'none', 2500);
                    setTimeout(()=> {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 4500)
                  } else {
                    Api.wxShowToast('图片已保存到相册，赶紧晒一下吧~', 'none', 2000);
                    setTimeout(()=> {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 4500)
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    let token = that.data.token;
    let shareFriends = backApi.shareFriends+'?access-token='+token;
    if (res.from === 'menu') {
      return {
        title: '选象 让选择简单点',
        path: `/pages/main/main`,
        imageUrl:'/images/posterBg2.png',
        success() {
          Api.wxRequest(shareFriends,'POST',{},(res)=>{
            console.log(res, 'friends')
          })
        },
        fail() {},
        complete() {

        }
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})