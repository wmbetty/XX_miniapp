const Api = require('../../wxapi/wxApi');

Page({

  data: {},

  onLoad: function (options) {},
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    return {
      title: '选象简介',
      path: `/pages/gcindex/gcindex?isIntro=1`
    }
  }
})
