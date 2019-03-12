const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const app = getApp();

Page({
  data: {
    token: '',
    actId: '',
    activity: {},
    showDialog: false
  },
  onLoad: function (options) {
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status * 1 === 200) {
        let token = response.data.data.access_token;
        that.setData({token: token,actId: options.id});
        let activityApi = backApi.activityApi+options.id;
        Api.wxRequest(activityApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            that.setData({activity: res.data.data})
            // wx.setNavigationBarTitle({
            //   title: res.data.data.title
            // });
          } else {
            Api.wxShowToast('活动获取失败~', 'none', 2000)
          }
        })
      } else {
        Api.wxShowToast('token获取失败~', 'none', 2000)
      }
    })
  },
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let img = that.data.activity.share_url || '';
    let title = that.data.activity.title || '活动专题';

    app.tdsdk.share({
      title: `分享活动-${title}`,
      path: `/pages/gcindex/gcindex?actId=${that.data.actId}`
    });

    return {
      title: title,
      path: `/pages/gcindex/gcindex?actId=${that.data.actId}`,
      imageUrl: `${img}`
    }
  },
  gotoJoin () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      wx.navigateTo({
        url: '/pages/index/index'
      })
    } else {
      that.setData({showDialog: true});
    }
  },
  cancelDialog () {
    let that = this;
    that.setData({showDialog: false});
  },
  confirmDialog () {
    let that = this;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code;
        wx.getUserInfo({
          success: (res) => {
            let userData = {
              encryptedData: res.encryptedData,
              iv: res.iv,
              code: code
            }
            backApi.getToken().then(function (response) {
              if (response.data.status * 1 === 200) {
                let token = response.data.data.access_token;
                let userInfoApi = backApi.userInfo + token;
                Api.wxRequest(userInfoApi,'POST',userData,(res)=> {
                  if (res.data.status*1===200) {
                    wx.setStorageSync('userInfo', res.data.data);
                    Api.wxShowToast('授权成功，可进行操作了', 'none', 2000);
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})
