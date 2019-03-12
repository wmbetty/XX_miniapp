//app.js
const Api = require('wxapi/wxApi');
const backApi = require('utils/util');
var tdstat = require("utils/tdweapp.js");
var aldstat = require("utils/ald-stat.js");
// const App = require('utils/ald-stat.js').App;

App({
  globalData: {
    userInfo: null,
    access_token: '',
    getUserInfo: null,
    userbase: 1
  },
  onLaunch: function () {},
  onShow (options) {
    let that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          backApi.getToken().then(function(res) {
            if (res.data.status*1===200) {
              that.aldstat.sendOpenid(res.data.data.openid)
            }
          })
        }
      }
    });
    // 是否是通过分享进入
    let scene = options.scene*1;
    if (scene === 1007 || scene === 1008) {
      let quesid = options.query.qid;
      wx.setStorageSync('quesid', quesid);
    } else {
      wx.setStorageSync('quesid', '');
    }

    // 判断是否是iPhone手机
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      let model = res.model;
      if (model.indexOf('iPhone') != -1) {
        wx.setStorageSync('isIphone', true)
      }
    })

    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate);
    })
    updateManager.onUpdateReady(function () {
      // wx.showModal({
      //   title: '更新提示',
      //   content: '新版本已经准备好，是否重启应用？',
      //   success: function (res) {
      //     if (res.confirm) {
      //       // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      //
      //     }
      //   }
      // })
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  }
 })
