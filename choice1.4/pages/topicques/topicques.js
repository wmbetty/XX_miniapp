const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
let tid = '';
const app = getApp();

Page({
  data: {
    pageTitle: '',
    type:1,
    topicId: '',
    page1: 1,
    page2: 1,
    topicDetail: {},
    totalPage1: 1,
    totalPage2: 2,
    showContent: false,
    list1: [],
    list2: [],
    showBotomText1: false,
    showBotomText2: false,
    showThumb: false,
    fixedTabHead: false,
    localUser:{},
    showDialog: false,
    myNewTopicId: ''
  },
  onLoad: function (options) {
    let that = this;
    let title = options.title;
    let topicId = options.id*1;
    tid = topicId;
    let topicDetailsApi = backApi.topicDetail+topicId;
    that.setData({topicId: topicId,pageTitle:title});
    wx.setNavigationBarTitle({
      title: title
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let page1 = that.data.page1;
    let page2 = that.data.page2;
    let getQuesData1 = {
      topic_id: tid,
      type: 1,
      page: page1
    };
    let getQuesData2 = {
      topic_id: tid,
      type: 2,
      page: page2
    };
    backApi.getToken().then(function(response) {
      if (response.data.status * 1 === 200) {
        let token = response.data.data.access_token;
        that.setData({token: token});
        Api.wxRequest(topicDetailsApi, 'GET', {}, (res) => {
          if (res.data.status * 1 === 200) {
            that.setData({topicDetail: res.data.data})
          } else {
            Api.wxShowToast('话题详情获取失败~', 'none', 2000)
          }
        });
        let topicQuesApi = backApi.topicQues+token;
        Api.wxRequest(topicQuesApi,'GET',getQuesData1,(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            let totalPage1 = res.header['X-Pagination-Page-Count'];
            that.setData({list1: res.data.data, showContent:true,totalPage1:totalPage1})

          } else {
            wx.hideLoading();
            Api.wxShowToast('问题数据获取失败~', 'none', 2000)
          }
        })
        Api.wxRequest(topicQuesApi,'GET',getQuesData2,(res)=>{
          if (res.data.status*1===200) {
            let totalPage2 = res.header['X-Pagination-Page-Count'];
            that.setData({list2: res.data.data,totalPage2:totalPage2,showContent:true})
          } else {
            Api.wxShowToast('问题数据获取失败~', 'none', 2000)
          }
        })
      } else {
        Api.wxShowToast('token获取失败~', 'none', 2000)
      }
    })
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let list2 = that.data.list2;
    let userInfo = wx.getStorageSync('userInfo');
    that.setData({localUser: userInfo});
    let type = '';
    let myNewTopicId = wx.getStorageSync('myNewTopicId');
    if (myNewTopicId) {
      type = 2;
      that.setData({type: type, myNewTopicId: myNewTopicId})
    }
    if (list2.length>0 && myNewTopicId) {
      let detailUrl = backApi.quesDetail+myNewTopicId;
      Api.wxRequest(detailUrl,'GET',{},(res)=>{
        if (res.data.data.id) {
          if (res.data.data.status*1===4) {
            Api.wxShowToast('该话题已被删', 'none', 3000);
          } else {
            that.setData({item: res.data.data});
            setTimeout(()=>{
              wx.setStorageSync('myNewTopicId','');
            },3000)
          }
        } else {
          Api.wxShowToast('网络错误，请重试', 'none', 2000);
        }
      });
    }
  },
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let type = that.data.type;
    let list1 = that.data.list1;
    let list2 = that.data.list2;
    let page1 = that.data.page1*1+1;
    let page2 = that.data.page2*1+1;
    let totalPage1 = that.data.totalPage1*1;
    let totalPage2 = that.data.totalPage2*1;
    let token = that.data.token;
    let topicId = that.data.topicId;
    let topicQuesApi = backApi.topicQues+token;
    if (type*1===1) {
      if (page1>totalPage1) {
        that.setData({showBotomText1:true})
      } else {
        Api.wxRequest(topicQuesApi,'GET',{topic_id:topicId,type:1,page:page1},(res)=>{
          if (res.data.status*1===200) {
            list1 = list1.concat(res.data.data)
            that.setData({list1: list1,page1:page1})
          } else {
            Api.wxShowToast('问题数据获取失败~', 'none', 2000)
          }
        })
      }
    } else {
      if (page2>totalPage2) {
        that.setData({showBotomText2:true})
      } else {
        Api.wxRequest(topicQuesApi,'GET',{topic_id:topicId,type:2,page:page2},(res)=>{
          if (res.data.status*1===200) {
            list2 = list2.concat(res.data.data)
            that.setData({list2: list2,page2:page2})
          } else {
            Api.wxShowToast('问题数据获取失败~', 'none', 2000)
          }
        })
      }
    }
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.pageTitle,
      path: `/pages/gcindex/gcindex?topicId=${that.data.topicId}&tptitle=${that.data.pageTitle}`
    }
  },
  changeTab (e) {
    let that = this;
    let type = e.currentTarget.dataset.type;
    that.setData({type: type})
  },
  gotoVote (e) {
    let that = this;
    let token = that.data.token;
    let answerData = {
      qid: 0,
      choose: ''
    };
    let list1 = that.data.list1;
    let list2 = that.data.list2;
    let type = that.data.type;
    let direct = e.currentTarget.dataset.direct;
    let idx = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let qid = item.id;
    let isVote = item.is_vote;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      if (isVote*1===1 && type*1===1) {
        Api.wxShowToast('投过票了', 'none', 300);
      }
      if (isVote*1===1 && type*1===2) {
        Api.wxShowToast('投过票了', 'none', 300);
      }
      let answerApi = backApi.u_answer;
      answerData.qid = qid;
      if (direct === 'left' && type*1===1 && isVote*1===0) {
        answerData.choose = 1;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          if (status === 201) {
            that.setData({showThumb: true})
            setTimeout(()=>{
              that.setData({showThumb: false})
            },1200)
            let afterChoose = res.data.data;
            for (let i=0;i<list1.length;i++) {
              if (idx===i) {
                list1[i].choose_left = true;
                list1[i].showMask = true;
                list1[i].hots = afterChoose.hots;
                list1[i].choose1_per = afterChoose.choose1_per;
                list1[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    list1: list1
                  })
                },600)
              }
            }
            app.tdsdk.event({
              id: 'vote',
              label: '投票'
            });
          } else {
            that.setData({showThumb: false})
            Api.wxShowToast('投过票了', 'none', 300);
          }
        })
      }
      if (direct === 'right' && type*1===1 && isVote*1===0) {
        answerData.choose = 2;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          if (status === 201) {
            that.setData({showThumb: true})
            setTimeout(()=>{
              that.setData({showThumb: false})
            },1200)
            let afterChoose = res.data.data;
            for (let i=0;i<list1.length;i++) {
              if (idx === i) {
                list1[i].choose_right = true;
                list1[i].showMask = true;
                list1[i].hots = afterChoose.hots;
                list1[i].choose1_per = afterChoose.choose1_per;
                list1[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    list1: list1
                  })
                },600)
              }
            }
            app.tdsdk.event({
              id: 'vote',
              label: '投票'
            });
          } else {
            that.setData({showThumb: false,noShowThumb: true})
            Api.wxShowToast('投过票了', 'none', 2000);
          }
        })
      }
      if (direct === 'left' && type*1===2 && isVote*1===0) {
        answerData.choose = 1;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          if (status === 201) {
            that.setData({showThumb: true})
            setTimeout(()=>{
              that.setData({showThumb: false})
            },1200)
            let afterChoose = res.data.data;
            for (let i=0;i<list2.length;i++) {
              if (idx===i) {
                list2[i].choose_left = true;
                list2[i].showMask = true;
                list2[i].hots = afterChoose.hots;
                list2[i].choose1_per = afterChoose.choose1_per;
                list2[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    list2: list2
                  })
                },600)
              }
            }
            app.tdsdk.event({
              id: 'vote',
              label: '投票'
            });
          } else {
            that.setData({showThumb: false})
            Api.wxShowToast('投过票了', 'none', 300);
          }
        })
      }
      if (direct === 'right' && type*1===2 && isVote*1===0) {
        answerData.choose = 2;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          if (status === 201) {
            that.setData({showThumb: true})
            setTimeout(()=>{
              that.setData({showThumb: false})
            },1200)
            let afterChoose = res.data.data;
            for (let i=0;i<list2.length;i++) {
              if (idx === i) {
                list2[i].choose_right = true;
                list2[i].showMask = true;
                list2[i].hots = afterChoose.hots;
                list2[i].choose1_per = afterChoose.choose1_per;
                list2[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    list2: list2
                  })
                },600)
              }
            }
            app.tdsdk.event({
              id: 'vote',
              label: '投票'
            });
          } else {
            that.setData({showThumb: false})
            Api.wxShowToast('投过票了', 'none', 2000);
          }
        })
      }
    } else {
      that.setData({showDialog: true});
    }
  },
  gotoOther (e) {
    let that = this;
    let mid = e.currentTarget.dataset.mid;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      if (mid*1===userInfo.id*1) {
        wx.reLaunch({url:`/pages/mine/mine`})
      } else {
        wx.navigateTo({
          url: `/pages/others/others?mid=${mid}`
        })
      }
    } else {
      that.setData({showDialog: true});
    }
  },
  gotoDetail (e) {
    let that = this;
    let id = e.currentTarget.dataset.qid;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      if (id) {
        app.tdsdk.event({
          id: 'qdetail',
          label: `查看问题`
        });
        wx.navigateTo({
          url: `/pages/details/details?id=${id}`
        })
      } else {
        Api.wxShowToast('该问题为空~', 'none', 2000)
      }
    } else {
      that.setData({showDialog: true});
    }
  },
  gotoSendTopic (e) {
    let that = this;
    let tid = e.currentTarget.dataset.tid;
    let title = e.currentTarget.dataset.title;
    let cid = e.currentTarget.dataset.cid;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      wx.navigateTo({
        url: `/pages/index/index?topicId=${tid}&topicTitle=${title}&categoryId=${cid}`
      })
    } else {
      that.setData({showDialog: true});
    }
  },
  onPageScroll (e) {
    let that = this;
    if (e.scrollTop*1>=200) {
      that.setData({fixedTabHead:true});
    }
    if (e.scrollTop*1<=116) {
      that.setData({fixedTabHead:false});
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
            }
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
  }
})
