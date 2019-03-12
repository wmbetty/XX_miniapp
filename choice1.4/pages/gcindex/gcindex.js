// pages/test/test.js
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
const app = getApp();
const tabBar = require('../../components/tabBar/tabBar.js');

let mid = '';

Page({
  data: {
    vertical: true,
    questionList: [],
    showShare: false,
    choose_left: false,
    imagePath: '',
    showDialog: false,
    qid: '',
    quesId: 0,
    question: '',
    msgCount: 0,
    avatar: '',
    isEmpty: false,
    voteUnreadCount: 0,
    commentTotal: 0,
    page: 1,
    notopPage: 1,
    nname: '',
    viewHeight: 0,
    viewWidth: 0,
    maskHidden: false,
    showPosterView: false,
    showScore: false,
    isDown: false,
    hadUp: false,
    showUserbase: false,
    openType: 'getUserInfo',
    authInfo: '需要微信授权登录才能更多操作哦',
    down_times: 1,
    showThumb: false,
    token: '',
    noShowThumb: false,
    baseRedDot: 0,
    shareFriImg: '',
    cardIdx: 0
  },
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },

  confirmDialog (e) {
    let that = this;
    let openType = that.data.openType;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code
        if (openType==='getUserInfo') {
          wx.getUserInfo({
            success: (res)=>{
              let userData = {
                encryptedData: res.encryptedData,
                iv: res.iv,
                code: code
              }
              backApi.getToken().then(function(response){
                if (response.data.status*1===200) {
                  let token = response.data.data.access_token;
                  let userInfoApi = backApi.userInfo+token;
                  let watchQuesApi = backApi.watchQuesApi+token;
                  let noTopQuesApi = backApi.noTopQues+token;
                  let page = that.data.page;
                  let notopPage = that.data.notopPage;
                  Api.wxRequest(userInfoApi,'POST',userData,(res)=> {
                    if (res.data.status*1===200) {
                      wx.setStorageSync('userInfo', res.data.data);
                      baseLock = res.data.data.user_base_lock;
                      if (baseLock*1===2) {
                        that.setData({baseRedDot: 1});
                      }
                      Api.wxShowToast('授权成功，可进行操作了', 'none', 2000);
                      wx.showLoading({
                        title: '加载中',
                      });
                      Api.wxRequest(backApi.questions+token, 'GET', {page: page}, (res)=>{
                        let status = res.data.status*1;
                        if (status===200) {
                          wx.hideLoading();
                          let datas = res.data.data || [];
                          if (datas.length===0) {
                            // top=0时
                            Api.wxRequest(noTopQuesApi, 'GET', {page:notopPage}, (res)=>{
                              let status = res.data.status*1;
                              that.setData({notopPage: notopPage+1});
                              if (status===200) {
                                let notopDatas = res.data.data || [];
                                if (notopDatas.length>0) {
                                  that.setData({questionList: notopDatas});
                                  Api.wxRequest(watchQuesApi,'POST',{qid: notopDatas[0].id}, (res)=> {
                                    if (res.data.status*1===201) {
                                      // console.log('watched');
                                    }
                                  })
                                }
                                if (notopDatas.length===0) {
                                  that.setData({
                                    notopPage: 1
                                  })
                                }
                                if (notopDatas.length===0) {
                                  Api.wxShowToast('小纠结被刷光了，看看广场吧', 'none', 2000);
                                  // that.setData({
                                  //   isEmpty: true
                                  // })
                                }
                              } else {
                                Api.wxShowToast('网络出错了', 'none', 2000);
                              }
                            })
                          }
                          if (datas.length>0) {
                            that.setData({questionList: datas});
                            Api.wxRequest(watchQuesApi,'POST',{qid: datas[0].id}, (res)=> {
                              if (res.data.status*1===201) {
                                // console.log('watched')
                              }
                            })
                          }
                        } else {
                          wx.hideLoading();
                          Api.wxShowToast('网络出错了,请稍后再试', 'none', 2000);
                        }
                      })

                    } else {
                      Api.wxShowToast('更新用户信息失败', 'none', 2000);
                    }
                  })
                } else {
                  Api.wxShowToast('登录失败', 'none', 2000);
                }
              }).catch(function (err) {
                console.log(err,'token err')
              })
            },
            fail: (res)=>{
              that.setData({
                showDialog: true,
                openType: 'openSetting',
                authInfo: '授权失败，需要微信权限哦'
              })
            }
          })
        } else {
        }
      },
      fail: function (res) {
        console.log(res, 'wx.login')
      }
    })
  },

  onLoad: function (options) {
    let that = this;
    tabBar.tabbar("tabBar", 0, that);

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
      wx.redirectTo({
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

    wx.showLoading({
      title: '加载中',
    });

    backApi.getToken().then(function(response){
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        that.setData({token: token});

        let watchQuesApi = backApi.watchQuesApi+token;
        let noTopQuesApi = backApi.noTopQues+token;
        let page = that.data.page;
        let notopPage = that.data.notopPage;

        Api.wxRequest(backApi.questions+token, 'GET', {page: page}, (res)=>{
          let status = res.data.status*1;
          if (status===200) {
            wx.hideLoading();
            let datas = res.data.data || [];
            if (datas.length===0) {
              // top=0时
              Api.wxRequest(noTopQuesApi, 'GET', {page:notopPage}, (res)=>{
                let status = res.data.status*1;
                that.setData({notopPage: notopPage+1});
                if (status===200) {
                  let notopDatas = res.data.data || [];
                  if (notopDatas.length>0) {
                    that.setData({questionList: notopDatas});
                    Api.wxRequest(watchQuesApi,'POST',{qid: notopDatas[0].id}, (res)=> {
                      if (res.data.status*1===201) {
                        // console.log('watched');
                      }
                    })
                  }
                  if (notopDatas.length===0) {
                    that.setData({
                      notopPage: 1
                    })
                  }
                  if (notopDatas.length===0) {
                    Api.wxShowToast('小纠结被刷光了，看看广场吧', 'none', 2000);
                    // that.setData({
                    //   isEmpty: true
                    // })
                  }
                } else {
                  Api.wxShowToast('网络出错了', 'none', 2000);
                }
              })
            }
            if (datas.length>0) {
              that.setData({questionList: datas});
              Api.wxRequest(watchQuesApi,'POST',{qid: datas[0].id}, (res)=> {
                if (res.data.status*1===201) {
                  // console.log('watched')
                }
              })
            }
          } else {
            wx.hideLoading();
            Api.wxShowToast('网络出错了,请稍后再试', 'none', 2000);
          }
        })
      } else {
        Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000)
      }
    }).catch(function(err){
      //错误处理
      console.log(err,'token err')
    });
  },
  onReady: function () {
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        this.setData({viewHeight: res.windowHeight,viewWidth:res.windowWidth});
      }
    })
  },
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
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function (res) {
    let that = this;
    let cardIdx = that.data.cardIdx;
    let questId = that.data.questionList[cardIdx].id;
    that.setData({
      showShare: false
    })

    let token = that.data.token;
    let shareFriends = backApi.shareFriends+'?access-token='+token;
    let shareFriImg = that.data.shareFriImg || '';

    if (res.from === 'menu') {
      app.tdsdk.share({
        title: '首页通过微信自带功能分享选象',
        path: `/pages/gcindex/gcindex`
      });

      return {
        title: '选象 让选择简单点',
        path: `/pages/gcindex/gcindex`
      }
    } else {
      app.tdsdk.share({
        title: `首页分享问题-${that.data.question}-`,
        path: `/pages/gcindex/gcindex?qid=${questId}`
      });
      Api.wxRequest(shareFriends,'POST',{},(res)=>{
        // console.log(res, 'friends')
      })
      return {
        title: that.data.question,
        path: `/pages/gcindex/gcindex?qid=${questId}`,
        imageUrl: shareFriImg?shareFriImg:''
      }
    }
  },
  gotoOthers (e) {
    let that = this;
    let local_userId = '';
    let mid = e.target.dataset.mid;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      local_userId = userInfo.id;
      if (local_userId*1===mid*1) {
        wx.reLaunch({
          url: `/pages/mine/mine`
        })
      } else {
        wx.navigateTo({
          url: `/pages/others/others?mid=${mid}`
        })
      }
    } else {
      that.setData({
        showDialog: true
      })
    }
  },
  gotoDetails (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let myid = e.currentTarget.dataset.mid;
    let my = '';
    if (myid==mid) {
      my = 1;
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.tdsdk.event({
        id: 'mdetail',
        label: `查看问题详情`
      });
      wx.navigateTo({
        url: `/pages/details/details?id=${id}&my=${my}`
      })
    } else {
      that.setData({
        showDialog: true
      })
    }
  },
  gotoVote (e) {
    let that = this;
    let idx = e.currentTarget.dataset.index;
    let qlist = that.data.questionList;
    let direct = e.currentTarget.dataset.direct;
    let answerData = {
      qid: 0,
      choose: ''
    };

    let qid = qlist[idx].id;
    answerData.qid = qid;
    let answerApi = backApi.u_answer;
    let showThumb = that.data.showThumb;
    // 投左边
    if (direct === 'left') {
      answerData.choose = 1;
      Api.wxRequest(answerApi+that.data.token,'POST',answerData,(res)=>{
        let status = res.data.status*1;
        if (status === 201) {
          if (!showThumb) {
            that.setData({showThumb: true})
          }
          let afterChoose = res.data.data;
          qlist[idx].choose_left = true;
          qlist[idx].showMask = true;
          qlist[idx].hots = afterChoose.hots;
          qlist[idx].choose1_per = afterChoose.choose1_per;
          qlist[idx].choose2_per = afterChoose.choose2_per;

          setTimeout(()=>{
            that.setData({
              questionList: qlist
            })
          },600)
          app.tdsdk.event({
            id: 'main',
            label: `首页投票-${qlist[idx].question}-左边`
          });
          setTimeout(()=>{
            that.setData({
              cardIdx: idx + 1
            })
          },3200)
        } else {
          that.setData({showThumb: false})
          Api.wxShowToast('投过票了', 'none', 300);
        }
      })
    }
    // 投右边
    if (direct === 'right') {
      answerData.choose = 2;
      Api.wxRequest(answerApi+that.data.token,'POST',answerData,(res)=>{
        let status = res.data.status*1;
        if (status === 201) {
          if (!showThumb) {
            that.setData({showThumb: true})
          }
          let afterChoose = res.data.data;
          qlist[idx].choose_right = true;
          qlist[idx].showMask = true;
          qlist[idx].hots = afterChoose.hots;
          qlist[idx].choose1_per = afterChoose.choose1_per;
          qlist[idx].choose2_per = afterChoose.choose2_per;

          setTimeout(()=>{
            that.setData({
              questionList: qlist
            })
          },600)
          app.tdsdk.event({
            id: 'main',
            label: `首页投票-${qlist[idx].question}-右边`
          });
          setTimeout(()=>{
            that.setData({
              cardIdx: idx + 1
            })
          },2800)
        } else {
          that.setData({showThumb: false})
          Api.wxShowToast('投过票了', 'none', 300);
        }
      })
    }
  },
  goShare (e) {
    let that = this;
    let quesId = e.target.dataset.question.id;
    let question = e.target.dataset.question.question;
    let token = that.data.token;
    let shareApi = backApi.shareApi+token;
    app.tdsdk.event({
      id: 'slide',
      label: `首页分享问题-${question}`
    });
    let postData = {
      type: 'friend',
      qid: quesId
    };
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      Api.wxRequest(shareApi,'POST',postData,(res)=>{
        if (res.data.status*1===201) {
          that.setData({shareFriImg:res.data.data.url})
        }
      });
      that.setData({
        showShare: true,
        quesId: quesId,
        question: question,
        isSlidedown: false
      });
    } else {
      that.setData({
        showDialog: true
      })
    }
  },
  cancelShare () {
    let that = this;
    that.setData({isSlidedown:true});
    setTimeout(()=>{
      that.setData({
        showShare: false
      })
    },280)
  },
  cardChange (e) {
    let that = this;
    let questionList = that.data.questionList;
    let curr = e.detail.current;
    app.tdsdk.event({
      id: 'slide',
      label: `首页刷问题-${questionList[curr-1].question}-`
    });
    that.setData({
      cardIdx: curr
    })
    let page = that.data.page*1 + 1;
    let notopPage = that.data.notopPage*1 + 1;
    let token = that.data.token;
    let watchQuesApi = backApi.watchQuesApi+token;
    let noTopQuesApi = backApi.noTopQues+token;

    if (curr === questionList.length-1) {
      app.tdsdk.event({
        id: 'main',
        label: `首页刷问题超过10条`
      });
      wx.showLoading({
        title: '加载中',
      });
      Api.wxRequest(backApi.questions+token, 'GET', {page:page}, (res)=>{
        if (res.data.status*1 === 200) {
          that.setData({page: page});
          wx.hideLoading();
          let topDatas = res.data.data || [];
          if (topDatas.length===0) {
            wx.showLoading({
              title: '加载中',
            });
            Api.wxRequest(noTopQuesApi, 'GET', {page: notopPage}, (res)=>{
              let datas = res.data.data || [];
              if (datas.length===0) {
                that.setData({notopPage: 1});
              } else {
                that.setData({notopPage: notopPage});
              }
              if (datas.length===0) {
                wx.hideLoading();
                Api.wxShowToast('小纠结被刷光了，看看广场吧', 'none', 2000);
                // that.setData({
                //   isEmpty: true
                // })
              } else {
                if (datas.length > 0) {
                  wx.hideLoading();
                  questionList = questionList.concat(datas);
                  that.setData({questionList: questionList});
                  Api.wxRequest(watchQuesApi,'POST',{qid: datas[0].id}, (res)=> {
                    // console.log('watch')
                  })
                } else {
                }
              }
            })
          } else {
            questionList = questionList.concat(topDatas);
            that.setData({questionList: questionList});
            Api.wxRequest(watchQuesApi,'POST',{qid: topDatas[0].id}, (res)=> {
              // console.log('watch')
            })
          }
        }
      })
    } else {
      wx.hideLoading();
      Api.wxRequest(watchQuesApi,'POST',{qid: questionList[curr].id}, (res)=> {
        // console.log('watch')
      })
    }
  },
  shareToMoment () {
    let that = this;
    let token = that.data.token;
    let cardIdx = that.data.cardIdx;
    let qid = that.data.questionList[cardIdx].id;
    that.setData({
      showShare: false
    });
    wx.navigateTo({
      url: `/pages/saveposter/saveposter?qid=${qid}&token=${token}`
    })
  }
})
