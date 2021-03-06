const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    voteLeft: true,
    isDelete: false,
    voteLists: [],
    noDatas: false,
    totalPage: '',
    currPage: '',
    token: '',
    nomoreList: false
  },
  onLoad: function (options) {
    let that = this;
    // 获取token
    backApi.getToken().then(function(response) {
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        that.setData({token: token});
        let localUserInfo = wx.getStorageSync('userInfo');
        that.setData({localuser_id:localUserInfo.id});
        let voteMsgApi = backApi.voteMsg+token;
        wx.showLoading({
          title: '加载中',
        });
        Api.wxRequest(voteMsgApi,'GET',{},(res)=> {
          if (res.data.status*1===200) {
            wx.hideLoading();
            let totalPage = res.header['X-Pagination-Page-Count'];
            let currPage = res.header['X-Pagination-Current-Page'];
            let totalCount = res.header['X-Pagination-Total-Count'];
            that.setData({
              totalPage: totalPage,
              currPage: currPage
            })
            let datas = res.data.data || [];
            if (datas.length>0) {
              that.setData({
                voteLists: datas
              })
            } else{
              that.setData({
                noDatas: true
              })
            }
          }
        })
        let readVoteApi = backApi.readVoteApi+token;
        Api.wxRequest(readVoteApi,'PUT',{},(res)=> {
          console.log('read');
        })
      } else {
        Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
      }
    });
    wx.setNavigationBarColor({
      frontColor:'#000000',
      backgroundColor:'#F5F6F8'
    })
  },
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let token = that.data.token;
    let currPage = that.data.currPage*1+1;
    let voteLists = that.data.voteLists;
    let voteMsgApi = backApi.voteMsg+token;
    let totalPage = that.data.totalPage*1;
    if (totalPage>1 && currPage <= totalPage) {
      Api.wxRequest(voteMsgApi, 'GET', {page:currPage}, (res)=> {
        if (res.data.status*1 === 200) {
          let pubs = res.data.data;
          that.setData({
            voteLists: voteLists.concat(pubs),
            currPage: currPage
          })
        }
      })
    } else {
      that.setData({nomoreList:true});
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
  onPageScroll () {},
  // 到他人中心
  gotoOthers (e) {
    let that = this;
    let mid = e.target.dataset.fromid;
    if (that.data.localuser_id*1===mid*1) {
      wx.reLaunch({
        url: `/pages/mine/mine`
      })
    } else {
      wx.navigateTo({
        url: `/pages/others/others?mid=${mid}`
      })
    }
  },
  // 详情
  gotoDetail (e) {
    let id = e.currentTarget.dataset.qid;
    let stat = e.currentTarget.dataset.stat;
    if (stat*1===4) {
      Api.wxShowToast('该话题已被发起人删除', 'none', 2000);
    } else {
      wx.navigateTo({
        url: `/pages/details/details?id=${id}`
      })
    }
    // let my = e.currentTarget.dataset.my;
  }
})
