const tabBar = require('../../components/tabBar/tabBar.js');
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    msgNum: 9,
    voteUnreadCount: 0,
    noticeUnreadCount: 0,
    commentUnreadCount: 0,
    showDialog: false,
    msgCount: 0,
    viewHeight: 0,
    token: '',
    showRedDot: false,
    baseRedDot: 0
  },
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },
  confirmDialog (e) {
    let that = this;
    let token = that.data.token;
    let userInfoApi = backApi.userInfo+token;
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
            Api.wxRequest(userInfoApi,'POST',userData,(res)=> {
              if (res.data.status*1===200) {
                wx.setStorageSync('userInfo', res.data.data);
                if (res.data.data.user_base_lock*1===2) {
                  that.setData({showRedDot: true})
                }
                Api.wxShowToast('授权成功，可进行操作了', 'none', 2000);
                backApi.getToken().then(function(response) {
                  let token = response.data.data.access_token;
                  that.setData({token: token});
                  let myInfoApi = backApi.myInfo+token;
                  Api.wxRequest(myInfoApi,'GET',{},(res)=>{
                    if (res.data.data.user_base_lock*1===2) {
                      that.setData({showRedDot: true})
                    } else {
                      that.setData({showRedDot: false})
                    }
                  });
                  let voteUnreadApi = backApi.voteUnreadApi+token;
                  let noticeUnreadApi = backApi.noticeUnreadApi+token;
                  let commentUnreadApi = backApi.commentUnreadApi+token;
                  Api.wxRequest(voteUnreadApi,'GET',{},(res)=> {
                    let vcount = res.data.data.vote;
                    that.setData({
                      voteUnreadCount: vcount
                    })
                  });
                  Api.wxRequest(noticeUnreadApi,'GET',{},(res)=> {
                    let ncount = res.data.data.notice;
                    that.setData({
                      noticeUnreadCount:ncount
                    })
                  });
                  Api.wxRequest(commentUnreadApi,'GET',{},(res)=> {
                    let comcount = res.data.data.total;
                    that.setData({
                      commentUnreadCount:comcount
                    })
                  });
                })
              } else {
                Api.wxShowToast('更新用户信息出错了', 'none', 2000);
              }
            })
          }
        })
      },
      fail: function (res) {
        console.log(res, 'message wx.login')
      }
    })
  },
  onLoad: function (options) {
    let that = this;
    tabBar.tabbar("tabBar", 3, that);
    wx.setNavigationBarColor({
      frontColor:'#000000',
      backgroundColor:'#F5F6F8'
    })
  },
  onReady: function () {
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        this.setData({viewHeight: res.windowHeight});
      }
    })
  },
  onShow: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      backApi.getToken().then(function(response) {
        let token = response.data.data.access_token;
        that.setData({token: token,showDialog: true});
      })
    } else {
      backApi.getToken().then(function(response) {
        let token = response.data.data.access_token;
        that.setData({token: token});
        let myInfoApi = backApi.myInfo+token;
        Api.wxRequest(myInfoApi,'GET',{},(res)=>{
          if (res.data.data.user_base_lock*1===2) {
            that.setData({showRedDot: true})
          } else {
            that.setData({showRedDot: false})
          }
        });
        let voteUnreadApi = backApi.voteUnreadApi+token;
        let noticeUnreadApi = backApi.noticeUnreadApi+token;
        let commentUnreadApi = backApi.commentUnreadApi+token;
        Api.wxRequest(voteUnreadApi,'GET',{},(res)=> {
          let vcount = res.data.data.vote;
          that.setData({
            voteUnreadCount: vcount
          })
        });
        Api.wxRequest(noticeUnreadApi,'GET',{},(res)=> {
          let ncount = res.data.data.notice;
          that.setData({
            noticeUnreadCount:ncount
          })
        });
        Api.wxRequest(commentUnreadApi,'GET',{},(res)=> {
          let comcount = res.data.data.total;
          that.setData({
            commentUnreadCount:comcount
          })
        });
      })
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
  gotoVotemsg () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({
        showDialog: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/votemsg/votemsg'
      })
      that.setData({
        voteUnreadCount: 0
      })
      wx.setStorageSync('msgTotal', 0);
    }
  },
  gotoNotice () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({
        showDialog: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/sysnotice/sysnotice'
      })
      that.setData({
        noticeUnreadCount: 0
      })
    }

  },
  gotoFeed () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.language) {
      that.setData({
        showDialog: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/feedback/feedback'
      })
    }
  },
  gotoUser () {
    let showBaseApi = backApi.showBaseApi+this.data.token;
    Api.wxRequest(showBaseApi,'GET',{},(res)=>{console.log(res,'base')});
    wx.navigateTo({
      url: '/pages/usercenter/usercenter'
    })
  },
  gotoComment () {
    let that = this;
    that.setData({
      commentUnreadCount: 0
    });
    wx.navigateTo({
      url: '/pages/commentmsg/commentmsg'
    })
  }
})
