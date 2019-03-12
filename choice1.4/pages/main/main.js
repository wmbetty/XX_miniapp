const app = getApp();
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const tabBar = require('../../components/tabBar/tabBar.js');

Page({
  data: {
    token: '',
    voteUnreadCount: 0,
    msgCount: 0,
    commentTotal: 0,
    baseRedDot: 0,
    interval: 2800,
    duration: 800,
    indicatorColor: 'rgba(199, 199, 204, 1)',
    dotActiveColor: '#666666',
    bannerList: [],
    categoryList: [],
    topicList: [],
    showDialog: false,
    showPage: false,
    page: 1,
    totalPage: 1,
    noList: false,
    showContent: false
  },
  onLoad: function (options) {
    let that = this;
    tabBar.tabbar("tabBar", 1, that);
    let questId = wx.getStorageSync('quesid');
    let topicId = options.topicId;
    let tptitle = options.tptitle;
    let cid = options.cid;
    let cname = options.cname;
    let isMain = options.isMain;
    let isRank = options.isRank;
    let isIntro = options.isIntro;
    let actId = options.actId;
    let isUser = options.isUser;
    let isReward = options.isReward;

    if (questId) {
      wx.navigateTo({
        url: `/pages/details/details?id=${questId}`
      });
      setTimeout(()=> {
        wx.setStorageSync('quesid', '');
      }, 300)
    }
    if (topicId) {
      wx.navigateTo({
        url: `/pages/topicques/topicques?id=${topicId}&title=${tptitle}`
      })
    }
    if (cid) {
      wx.navigateTo({
        url: `/pages/categotries/categotries?title=${cname}&id=${cid}`
      })
    }
    if (isMain) {
      wx.navigateTo({
        url: `/pages/main/main`
      })
    }
    if (isRank) {
      wx.navigateTo({
        url: `/pages/rankboard/rankboard`
      })
    }
    if (isIntro) {
      wx.navigateTo({
        url: '/pages/gcintro/gcintro'
      })
    }
    if (actId) {
      wx.navigateTo({
        url: `/pages/activity/activity?id=${actId}`
      })
    }
    if (isUser) {
      wx.navigateTo({
        url: '/pages/usercenter/usercenter'
      })
    }
    if (isReward) {
      wx.navigateTo({
        url: '/pages/getprize/getprize'
      })
    }
    wx.setNavigationBarColor({
      frontColor:'#000000',
      backgroundColor:'#F5F6F8'
    });
    wx.showLoading({
      title: '加载中'
    });
    backApi.getToken().then(function(response) {
      if (response.data.status * 1 === 200) {
        let token = response.data.data.access_token;
        let bannerApi = backApi.bannerApi+token;
        let categoryListApi = backApi.categoryListApi+token;
        let topicListApi = backApi.topicListApi+token;
        that.setData({token: token});

        getBanner(bannerApi).then(function (res) {
          if (res.data.status*1===201) {
            wx.hideLoading();
            that.setData({bannerList: res.data.data,showPage: true})
          } else {
            wx.hideLoading();
            Api.wxShowToast('轮播图获取失败~', 'none', 2000)
          }
        })

        getCategory(categoryListApi).then(function (res) {
          if (res.data.status*1===201) {
            let category = res.data.data;
            let rankItem = [1];
            category = category.concat(rankItem);
            that.setData({categoryList: category})
          } else {
            Api.wxShowToast('分类获取失败~', 'none', 2000)
          }
        })

        getTopicList(topicListApi,that.data.page).then(function (res) {
          let totalPage = res.header['X-Pagination-Page-Count'];
          let topic = res.data.data;
          that.setData({topicList: topic,totalPage: totalPage,showContent:true})
        });
      } else {
        Api.wxShowToast('token获取失败~', 'none', 2000)
      }
    })
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      backApi.getToken().then(function(response) {
        if (response.data.status*1===200) {
          let token = response.data.data.access_token;
          that.setData({token: token});
          let voteUnreadApi = backApi.voteUnreadApi+token;
          let msgTotalApi = backApi.msgUnreadTotal+token;
          let commTotalApi = backApi.commentUnreadApi+token;
          // 获取投票信息
          Api.wxRequest(voteUnreadApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              if (res.data.data.vote) {
                that.setData({voteUnreadCount: res.data.data.vote});
              }
            }
          });
          // 获取通知数量
          Api.wxRequest(msgTotalApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              let msgTotal = res.data.data.total;
              if (msgTotal) {
                that.setData({msgCount: msgTotal});
              }
            }
          });
          // 获取评论数量
          Api.wxRequest(commTotalApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              let commentTotal = res.data.data.total;
              if (commentTotal) {
                that.setData({commentTotal: commentTotal});
              }
            }
          });
          setInterval(()=>{
            // 获取投票信息
            Api.wxRequest(voteUnreadApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                if (res.data.data.vote) {
                  that.setData({voteUnreadCount: res.data.data.vote});
                }
              }
            });
            // 获取通知数量
            Api.wxRequest(msgTotalApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                let msgTotal = res.data.data.total;
                if (msgTotal) {
                  that.setData({msgCount: msgTotal});
                }
              }
            });
            // 获取评论数量
            Api.wxRequest(commTotalApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                let commentTotal = res.data.data.total;
                if (commentTotal) {
                  that.setData({commentTotal: commentTotal});
                }
              }
            });
          },8000)
        } else {
          Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000)
        }
      })
    } else {
      setTimeout(()=>{
        that.setData({showDialog: true})
      }, 1500)
    }
  },
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let totalPage = that.data.totalPage;
    let topicListApi = backApi.topicListApi+that.data.token;
    let topicList = that.data.topicList;
    if (page>totalPage) {
      that.setData({noList: true})
    } else {
      getTopicList(topicListApi,page).then(function (res) {
        if (res.data.status*1===200) {
          topicList = topicList.concat(res.data.data);
          that.setData({topicList: topicList,page: page})
        } else {
          Api.wxShowToast('获取更多话题失败~', 'none', 2000)
        }
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '选象 让选择简单点',
      path: `/pages/gcindex/gcindex?isMain=1`
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
            };
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
  },
  // 去分类详情
  goCateDetail (e) {
    let that = this;

    setTimeout(()=>{
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo.id) {
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;
        let title = item.name;
        let cid = item.id;

        if (index*1===7) {
          app.aldstat.sendEvent(`用户在广场点击了排行榜`,{
            play : ""});
          app.tdsdk.event({
            id: 'rank',
            label: '查看排行'
          });
          wx.navigateTo({
            url: `/pages/rankboard/rankboard`
          })
        } else {
          app.aldstat.sendEvent(`用户在广场点击了-${title}-这个分类`,{
            play : ""
          });
          app.tdsdk.event({
            id: 'detail',
            label: '查看分类'
          });
          wx.navigateTo({
            url: `/pages/categotries/categotries?title=${title}&id=${cid}`
          })
        }
      } else {
        that.setData({showDialog: true});
      }
    },200);
  },
  goRank () {
    let that = this;
    setTimeout(()=>{
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo.id) {
        app.aldstat.sendEvent(`用户在广场点击了排行榜`,{
          play : ""});
        app.tdsdk.event({
          id: 'rank',
          label: '查看排行'
        });
        wx.navigateTo({
          url: `/pages/rankboard/rankboard`
        })
      } else {
        that.setData({showDialog: true});
      }
    },200)
  },
  bannerGo (e) {
    let that = this;
    setTimeout(()=>{
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo.id) {
        let link = e.currentTarget.dataset.link;
        if (link) {
          app.tdsdk.event({
            id: 'banner',
            label: `查看广场banner`
          });
          wx.navigateTo({
            url: link
          })
        }
      } else {
        that.setData({showDialog: true});
      }
    },200)
  },
  gotoTopic (e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    let tid = item.id;
    let title = item.title;
    setTimeout(()=>{
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo.id) {
        app.aldstat.sendEvent(`用户在广场点击了-${title}-这个话题`,{
          play : ""
        });
        app.tdsdk.event({
          id: 'topic',
          label: `查看-${title}-话题`
        });
        wx.navigateTo({
          url: `/pages/topicques/topicques?id=${tid}&title=${title}`
        })
      } else {
        that.setData({showDialog: true});
      }
    },200)
  }
})

function getTopicList(api,page) {
  return new Promise(function(resolve,reject){
    Api.wxRequest(api,'GET',{page: page},(res)=>{
      if (res.data.status*1===200) {
        resolve(res)
      } else {
        Api.wxShowToast('话题获取失败~', 'none', 2000)
        reject(res)
      }
    })
  })
}
function getBanner(api) {
  return new Promise(function(resolve,reject){
    Api.wxRequest(api,'GET',{},(res)=>{
      if (res.data.status*1===201) {
        resolve(res)
      } else {
        Api.wxShowToast('轮播图获取失败~', 'none', 2000)
        reject(res)
      }
    });
  })
}
function getCategory(api) {
  return new Promise(function(resolve,reject){
    Api.wxRequest(api,'GET',{},(res)=>{
      if (res.data.status*1===201) {
        resolve(res)
      } else {
        Api.wxShowToast('分类获取失败~', 'none', 2000)
        reject(res)
      }
    });
  })
}
