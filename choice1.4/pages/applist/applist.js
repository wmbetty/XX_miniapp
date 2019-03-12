// pages/applist/applist.js
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const app = getApp();

Page({
  data: {
    winHeight: 0,
    list: [],
    dialogShow: false,
    appid: '',
    path: '',
    appname: ''
  },
  onLoad: function (options) {
    let that = this
    let miniprogramApi = backApi.miniprogramApi
    Api.wxRequest(miniprogramApi,'GET',{},(res)=>{
      if (res.data.status*1===200) {
        let data = res.data.data
        that.setData({list: data})
      } else {
        Api.wxShowToast('数据获取失败~', 'none', 2300);
      }
    })
  },
  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  // onShareAppMessage: function () {
  //
  // },
  openApp (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      appid: item.appid,
      path: item.path,
      dialogShow: true,
      appname: item.name
    })

  },
  cancelDialog () {
    let that = this
    that.setData({dialogShow: false})
  },
  playApp () {
    this.setData({dialogShow: false})
  }
})
