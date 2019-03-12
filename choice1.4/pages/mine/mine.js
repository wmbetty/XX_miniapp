const tabBar = require('../../components/tabBar/tabBar.js');
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    isMine: true,
    isBoy: true,
    showBlue: true,
    mineEmptyInfo: '你还没有发起选象哦',
    othersEmptyInfo: '你还没有参与哦',
    othersBlueText: '点击底部“选象”参与',
    myPublish: [],
    myJoin: [],
    userInfo: {},
    showDialog: false,
    joinApi: '',
    myQuestionApi: '',
    points: 0,
    msgCount: 0,
    voteUnreadCount: 0,
    commentTotal: 0,
    joinCurrPage: 0,
    myCurrPage: 0,
    myTotalPage: 0,
    joinTotalPage: 0,
    myTotalCount: 0,
    joinTotalCount: 0,
    viewHeight: 0,
    isIphone: false,
    token: '',
    myvotecount: 0,
    baseRedDot: 0,
    nomoreJoin: false,
    nomorePublish: false
  },
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },
  confirmDialog (e) {
    let that = this;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code
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
                  if (res.data.status * 1 === 200) {
                    wx.setStorageSync('userInfo', res.data.data);
                    if (res.data.data.user_base_lock*1===2) {
                      that.setData({baseRedDot: 1})
                    }
                    that.setData({
                      points: res.data.data.points || 0
                    });
                    that.setData({
                      userInfo: res.data.data
                    });
                    Api.wxShowToast('授权成功，可进行操作了', 'none', 2000);

                    let questionApi = backApi.my_question+token;
                    let joinApi = backApi.my_join+token;
                    wx.showLoading({
                      title: '加载中',
                    });
                    // 获取发起和参与数据
                    Api.wxRequest(questionApi, 'GET', {}, (res)=> {
                      if (res.data.status*1 === 200) {
                        wx.hideLoading();
                        let myPublish = res.data.data;
                        let myTotalPage = res.header['X-Pagination-Page-Count'];
                        let myCurrPage = res.header['X-Pagination-Current-Page'];
                        let myCount = res.header['X-Pagination-Total-Count'];
                        that.setData({
                          myPublish: myPublish,
                          myTotalPage: myTotalPage,
                          myCurrPage: myCurrPage,
                          myTotalCount: myCount
                        })
                      } else {
                        wx.hideLoading();
                        Api.wxShowToast('数据获取失败', 'none', 2000);
                      }
                    })
                    Api.wxRequest(joinApi, 'GET', {}, (res)=> {
                      if (res.data.status*1 === 200) {
                        let myJoin = res.data.data;
                        let joinTotalPage = res.header['X-Pagination-Page-Count'];
                        let joinCurrPage = res.header['X-Pagination-Current-Page'];
                        let joinCount = res.header['X-Pagination-Total-Count'];
                        if (myJoin.length > 0) {
                          that.setData({
                            myJoin: myJoin,
                            joinCurrPage: joinCurrPage,
                            joinTotalPage: joinTotalPage,
                            joinTotalCount: joinCount
                          })
                        }
                      }
                    });
                    let voteUnreadApi = backApi.voteUnreadApi+token;
                    let msgTotalApi = backApi.msgUnreadTotal+token;
                    let commTotalApi = backApi.commentUnreadApi+token;
                    Api.wxRequest(voteUnreadApi,'GET',{},(res)=>{
                      if (res.data.status*1===200) {
                        if (res.data.data.vote) {
                          that.setData({voteUnreadCount: res.data.data.vote});
                        }
                      }
                    });
                    Api.wxRequest(msgTotalApi,'GET',{},(res)=>{
                      if (res.data.status*1===200) {
                        let msgTotal = res.data.data.total;
                        if (msgTotal) {
                          that.setData({msgCount: msgTotal});
                        }
                      }
                    });
                    Api.wxRequest(commTotalApi,'GET',{},(res)=>{
                      if (res.data.status*1===200) {
                        let commentCount = res.data.data.total;
                        if (commentCount) {
                          that.setData({commentTotal: commentCount});
                        }
                      }
                    });
                  } else {
                    Api.wxShowToast('更新用户信息失败', 'none', 2000);
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  onLoad: function (options) {
    let that = this;
    tabBar.tabbar("tabBar", 4, that);
    let isIphone = wx.getStorageSync('isIphone');
    if (isIphone) {
      that.setData({isIphone: true})
    }
  },
  onReady: function () {
    let that = this;
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        that.setData({viewHeight: res.windowHeight});
      }
    })
  },
  onShow: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      that.setData({
        userInfo: userInfo
      });
      backApi.getToken().then(function(response) {
        if (response.data.status*1===200) {
          let token = response.data.data.access_token;
          that.setData({token: token});
          let infoApi = backApi.myInfo+token;
          Api.wxRequest(infoApi,'GET',{},(res)=> {
            let datas = res.data.data;
            that.setData({
              points: datas.points || 0
            });
            if (datas.user_base_lock*1===2) {
              that.setData({baseRedDot: 1})
            } else {
              that.setData({baseRedDot: 0})
            }
          });
          let questionApi = backApi.my_question+token;
          let joinApi = backApi.my_join+token;
          that.setData({
            myQuestionApi: questionApi,
            joinApi: joinApi
          });
          wx.showLoading({
            title: '加载中',
          });
          Api.wxRequest(questionApi, 'GET', {}, (res)=> {
            if (res.data.status*1 === 200) {
              wx.hideLoading();
              let myPublish = res.data.data;
              let myTotalPage = res.header['X-Pagination-Page-Count'];
              let myCurrPage = res.header['X-Pagination-Current-Page'];
              let myCount = res.header['X-Pagination-Total-Count'];
              that.setData({
                myPublish: myPublish,
                myTotalPage: myTotalPage,
                myCurrPage: myCurrPage,
                myTotalCount: myCount
              })
            } else {
              wx.hideLoading();
              Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
            }
          });
          Api.wxRequest(joinApi, 'GET', {}, (res)=> {
            if (res.data.status*1 === 200) {
              let myJoin = res.data.data;
              let joinTotalPage = res.header['X-Pagination-Page-Count'];
              let joinCurrPage = res.header['X-Pagination-Current-Page'];
              let joinCount = res.header['X-Pagination-Total-Count'];
              if (myJoin.length > 0) {
                that.setData({
                  myJoin: myJoin,
                  joinCurrPage: joinCurrPage,
                  joinTotalPage: joinTotalPage,
                  joinTotalCount: joinCount
                })
              }
            }
          });
          let voteUnreadApi = backApi.voteUnreadApi+token;
          let msgTotalApi = backApi.msgUnreadTotal+token;
          let commTotalApi = backApi.commentUnreadApi+token;

          Api.wxRequest(voteUnreadApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              if (res.data.data.vote) {
                that.setData({voteUnreadCount: res.data.data.vote});
              }
            }
          });
          Api.wxRequest(msgTotalApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              let msgTotal = res.data.data.total;
              if (msgTotal) {
                that.setData({msgCount: msgTotal});
              }
            }
          });
          Api.wxRequest(commTotalApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              let commTotal = res.data.data.total;
              if (commTotal) {
                that.setData({commentTotal: commTotal});
              }
            }
          });
        } else {
          Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
        }
      });
    } else {
      backApi.getToken().then(function(response) {
        if (response.data.status*1===200) {
          let token = response.data.data.access_token;
          that.setData({token: token,showDialog: true});
        } else {
          Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
        }
      });
    }
  },
  onHide: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    that.setData({
      userInfo: userInfo
    })
  },
  onReachBottom: function () {
    let that = this;
    let isMine = that.data.isMine;
    let myCurrPage = that.data.myCurrPage*1+1;
    let joinCurrPage = that.data.joinCurrPage*1+1;
    let token = that.data.token;
    let questionApi = backApi.my_question+token;
    let joinApi = backApi.my_join+token;
    let myJoin = that.data.myJoin;
    let myPublish = that.data.myPublish;
    let myTotalPage = that.data.myTotalPage*1;
    let joinTotalPage = that.data.joinTotalPage*1;
    if (!isMine) {
      if (joinTotalPage>1 && joinCurrPage <= joinTotalPage) {
        Api.wxRequest(joinApi, 'GET', {page:joinCurrPage}, (res)=> {
          if (res.data.status*1 === 200) {
            let myJoins = res.data.data;
            that.setData({
              myJoin: myJoin.concat(myJoins),
              joinCurrPage: joinCurrPage
            })
          }
        })
      } else {
        that.setData({nomoreJoin:true});
      }
    } else {
      if (myTotalPage > 1 && myCurrPage <= myTotalPage) {
        Api.wxRequest(questionApi, 'GET', {page:myCurrPage}, (res)=> {
          if (res.data.status*1 === 200) {
            let myPublishs = res.data.data;
            that.setData({
              myPublish: myPublish.concat(myPublishs),
              myCurrPage: myCurrPage
            })
          }
        })
      } else {
        that.setData({nomorePublish:true})
      }
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
  onPageScroll (e) {
    let that = this;
    if (e.scrollTop*1>=that.data.viewHeight*1/3) {
      wx.setNavigationBarColor({
        frontColor:'#ffffff',
        backgroundColor:'#E64340'
      });
      wx.setNavigationBarTitle({
        title: "我"
      });
      that.setData({showSrollView:true});
    } else {
      wx.setNavigationBarColor({
        frontColor:'#ffffff',
        backgroundColor:'#E2DCCE'
      });
      wx.setNavigationBarTitle({
        title: ""
      });
      that.setData({showSrollView:false});
    }
  },
  // tab切换
  voteOthers (e) {
    let that = this;
    let type = e.currentTarget.dataset.type;
    if (type === 'mine') {
      that.setData({
        isMine: true
      })
    } else {
      that.setData({
        isMine: false
      })
    }
  },
  // 详情
  gotoDetail (e) {
    let id = e.currentTarget.dataset.id;
    let stat = e.currentTarget.dataset.stat;
    let my = e.currentTarget.dataset.my;
    if (stat*1===4) {
      Api.wxShowToast('该话题已被发起人删除', 'none', 2000);
    } else {
      wx.navigateTo({
        url: `/pages/details/details?id=${id}&my=${my}`
      })
    }
  },
  gotoMsg () {
    let that = this;
    that.setData({
      msgCount: 0,
      voteUnreadCount: 0
    })
    wx.navigateTo({
      url: `/pages/messages/messages`
    })
  }
})
