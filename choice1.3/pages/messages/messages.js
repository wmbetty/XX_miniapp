// pages/messages/messages.js
const tabBar = require('../../components/tabBar/tabBar.js');
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgNum: 9,
    voteUnreadCount: 0,
    noticeUnreadCount: 0,
    commentUnreadCount: 0,
    showDialog: false,
    msgCount: 0,
    viewHeight: 0,
    token: '',
    showRedDot: false

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
    wx.getUserInfo({
      success: (res)=>{
        let userInfo = res.userInfo;
        if (userInfo.nickName) {
          wx.setStorageSync('userInfo', userInfo);
          Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
            if (res.data.data.user_base_lock*1===2) {
              that.setData({showRedDot: true})
            }
          })
        }
      }
    })
  },
  onLoad: function (options) {
    let that = this;
    tabBar.tabbar("tabBar", 1, that);

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

    if (!userInfo.language) {
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
        // wx.setStorageSync('msgTotal', 0);
        // wx.setStorageSync('voteUnreadCount', 0);
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
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
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
  onPageScroll () {
    // if (e.scrollTop*1>=this.data.viewHeight/3) {
    //   wx.setNavigationBarColor({
    //     frontColor:'#ffffff',
    //     backgroundColor:'#E64340'
    //   })
    //   wx.setNavigationBarTitle({
    //     title: "消息"
    //   })
    // } else {
    //   wx.setNavigationBarColor({
    //     frontColor:'#ffffff',
    //     backgroundColor:'#F5F6F8'
    //   })
    //   wx.setNavigationBarTitle({
    //     title: ""
    //   })
    // }
  },
  gotoVotemsg () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');

    if (!userInfo.nickName) {
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

    if (!userInfo.nickName) {
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

    if (!userInfo.nickName) {
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