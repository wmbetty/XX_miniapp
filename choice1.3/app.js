//app.js
const Api = require('wxapi/wxApi');
const backApi = require('utils/util');
var aldstat = require("utils/ald-stat.js");

App({
  globalData: {
    userInfo: null,
    access_token: '',
    getUserInfo: null,
    userbase: 1
  },
  onLaunch: function () {
    
  },
  onShow (options) {
    wx.login({
      success: function(res) {
        let reqData = {};
        let code = res.code;
        if (code) {
          reqData.code = code;
          Api.wxRequest(backApi.loginApi,'POST',reqData,(res)=>{
            let acc_token = res.data.data.access_token;
            if (acc_token) {
              let userInfo = wx.getStorageSync('userInfo', userInfo);
              let userInfoApi = backApi.userInfo+acc_token;
              if (userInfo) {
                let userData = {
                  avatarUrl: userInfo.avatarUrl,
                  nickName: userInfo.nickName,
                  country: userInfo.country,
                  city: userInfo.city,
                  language: userInfo.language,
                  province: userInfo.province,
                  gender: userInfo.gender
                };
                Api.wxRequest(userInfoApi,'PUT',userData,(res)=>{
                  console.log(res.data.status, 'app.js update-user')
                })
              }
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
    wx.getSetting({
      success: (res) => {
        // console.log(res, 'minemine')
        let authSetting = res.authSetting;
        let userInfoSet = authSetting["scope.userInfo"] || '';

        if (userInfoSet) {

        } else {
          wx.setStorageSync('userInfo', '');
        }
      }
    })
  },
  onHide () {
  }
 })