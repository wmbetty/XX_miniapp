const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    userInfo: {},
    myPublish: [],
    totalCount: 0,
    totalPage: '',
    currPage: '',
    viewHeight: 0,
    mid: '',
    token: '',
    nomorePublish: false,
    showContent: false
  },
  onLoad: function (options) {
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        let localUserInfo = wx.getStorageSync('userInfo');
        let localuser_id = localUserInfo.id;
        that.setData({localuser_id:localuser_id});
        let infoApi = backApi.othersInfo+token;
        let otherPublishQues = backApi.otherPublishQues+token;
        let mid = options.mid;
        that.setData({mid:mid,token:token});
        Api.wxRequest(infoApi,'GET',{mid:mid},(res)=> {
          let datas = res.data.data;
          if (datas.id) {
            that.setData({
              userInfo: datas
            });
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            Api.wxRequest(otherPublishQues,'GET',{mid:mid,page:1},(res)=> {
              if (res.data.status*1===200 && res.data.data.length) {
                wx.hideLoading();
                let myPublish = res.data.data;
                let totalPage = res.header['X-Pagination-Page-Count'];
                let currPage = res.header['X-Pagination-Current-Page'];
                let totalCount = res.header['X-Pagination-Total-Count'];
                that.setData({
                  totalPage: totalPage,
                  currPage: currPage,
                  totalCount: totalCount,
                  myPublish: myPublish,
                  showContent: true
                })
              }
            })
          } else {
            wx.hideLoading();
            Api.wxShowToast('获取信息失败', 'none', 2000);
          }
        })
      } else {
        Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
      }
    })
  },
  // 详情
  gotoDetail (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let localuser_id = that.data.localuser_id;
    let myid= e.currentTarget.dataset.mid;
    let other = 'other';
    let my = '';
    if (localuser_id==myid) {
      my = 1;
    }
    wx.navigateTo({
      url: `/pages/otherDetails/otherDetails?id=${id}&my=${my}&other=${other}`
    })
  },
  onPageScroll (e) {
    if (e.scrollTop*1>=this.data.viewHeight/3) {
      wx.setNavigationBarColor({
        frontColor:'#ffffff',
        backgroundColor:'#E64340'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor:'#ffffff',
        backgroundColor:'#E2DCCE'
      })
    }

  },
  onReady: function () {
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        this.setData({viewHeight: res.windowHeight});
      }
    })
  },
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let currPage = that.data.currPage*1+1;
    let myPublish = that.data.myPublish;
    let token = that.data.token;
    let otherPublishQues = backApi.otherPublishQues+token;
    let totalPage = that.data.totalPage*1;
    let mid = that.data.mid;
    if (totalPage>1 && currPage <= totalPage) {
      Api.wxRequest(otherPublishQues, 'GET', {page:currPage,mid:mid}, (res)=> {
        if (res.data.status*1 === 200) {
          let pubs = res.data.data;
          that.setData({
            myPublish: myPublish.concat(pubs),
            currPage: currPage
          })
        }
      })
    } else {
      that.setData({nomorePublish:true})
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
})
