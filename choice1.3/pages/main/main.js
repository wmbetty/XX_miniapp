const tabBar = require('../../components/tabBar/tabBar.js');
const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

let baseLock = '';
let mid = '';
let downList = [];
var startx, starty;

Page({
  data: {
    animationData: {},
    questionList: [],
    downList: [],
    showMask: false,
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
    shareFriImg: ''
  },
  //手指接触屏幕
  touchstart (e) {
    let that = this;
    startx = e.touches[0].pageX;
    starty = e.touches[0].pageY;
  },
  //手指离开屏幕
  touchend (e) {
    let that = this;
    let token = that.data.token;
    let curr_id = e.currentTarget.dataset.item.id;
    let listItem = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    var endx, endy;
    endx = e.changedTouches[0].pageX;
    endy = e.changedTouches[0].pageY;
    var direction = getDirection(startx, starty, endx, endy);
    if (direction === 1) {
      that.setData({isDown: false});
      that.slidethis(index,curr_id,listItem);
      that.setData({hadUp: true,showUserbase: false});
    }
  },

  //事件处理函数
  slidethis (index, qid, card) {

    let that = this;
    let page = that.data.page;
    let notopPage = that.data.notopPage;
    let token = that.data.token;
    let watchQuesApi = backApi.watchQuesApi+token;
    let noTopQuesApi = backApi.noTopQues+token;
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
    });
    that.animation = animation;
    that.animation.translateY(-(that.data.viewHeight-60)).translateX(15).step();
    that.animation.opacity(0).step({duration: 1200});
    var animationData = that.data.animationData;
    animationData[index] = that.animation.export();
    that.setData({
      animationData: animationData,
      down_times: 1,
      showThumb: false
    });
    setTimeout(function() {
      var questionList = that.data.questionList;

      if (index===questionList.length-1) {
        wx.showLoading({
          title: '加载中',
        });
        Api.wxRequest(backApi.questions+token, 'GET', {page:page+1}, (res)=>{
          if (res.data.status*1 === 200) {
            that.setData({page: page+1});
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
                  that.setData({notopPage: notopPage+1});
                }
                if (datas.length===0) {
                  wx.hideLoading();
                  that.setData({
                    isEmpty: true
                  })
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
        Api.wxRequest(watchQuesApi,'POST',{qid: qid}, (res)=> {
          // console.log('watch')
        })
      }

      let user_random = parseInt(Math.random()*(20-10+1)+10,10);
      let showBaseApi = backApi.showBaseApi+token;
      let myinfoApi = backApi.myInfo+token;
      if (user_random-index>1 && user_random-index<=3 && baseLock*1===2) {
        that.setData({showUserbase: true});
        Api.wxRequest(showBaseApi,'GET',{},(res)=>{
          // console.log(res,'base')
        });

        // 更新基地状态
        setTimeout(()=>{
          Api.wxRequest(myinfoApi,'GET',{},(res)=>{
            baseLock = res.data.data.user_base_lock;
            that.setData({baseRedDot: 0})
          });
        },200)
      }
      downList = downList.concat(card);
      that.setData({downList: downList})
    }, 200);
  },

  onLoad: function () {
    let that = this;
    tabBar.tabbar("tabBar", 0, that);
    let questId = wx.getStorageSync('quesid');
    if (questId) {
      wx.navigateTo({
        url: `/pages/details/details?id=${questId}`
      })
      setTimeout(()=> {
        wx.setStorageSync('quesid', '');
      }, 300)
    }

    // 获取token
    backApi.getToken().then(function(response){
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        that.setData({token: token});
        let userInfo = wx.getStorageSync('userInfo', userInfo);
        let userInfoApi = backApi.userInfo+token;
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

          // 更新用户信息

          Api.wxRequest(userInfoApi,'PUT',userData,(res)=>{
            baseLock = res.data.data.user_base_lock;
            if (baseLock*1===2) {
              that.setData({baseRedDot: 1});
            }
            mid = res.data.data.id;
          });
        }

        wx.showLoading({
          title: '加载中',
        });
        let watchQuesApi = backApi.watchQuesApi+token;
        let noTopQuesApi = backApi.noTopQues+token;
        let page = that.data.page;
        let notopPage = that.data.notopPage;

        // 取首页数据
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
                    that.setData({
                      isEmpty: true
                    })
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
  onShow () {
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
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

  },
  onReady () {
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        this.setData({viewHeight: res.windowHeight,viewWidth:res.windowWidth});
      }
    })
  },
  onShareAppMessage (res) {
    let that = this;
    let questId = that.data.quesId;
    let token = that.data.token;
    let shareFriends = backApi.shareFriends+'?access-token='+token;
    let shareFriImg = that.data.shareFriImg || '';

    if (res.from === 'menu') {
      return {
        title: '选象 让选择简单点',
        path: `/pages/main/main`,
        imageUrl: '/images/posterBg2.png',
        success() {
          Api.wxRequest(shareFriends,'POST',{},(res)=>{
            // console.log(res, 'friends')
          })
        },
        fail() {},
        complete() {

        }
      }
    } else {
      return {
        title: that.data.question,
        path: `/pages/main/main?qid=${questId}`,
        imageUrl: shareFriImg?shareFriImg:'/images/posterBg2.png',
        success() {
          Api.wxRequest(shareFriends,'POST',{},(res)=>{
            // console.log(res, 'friends')
          })
        },
        fail() {},
        complete() {

        }
      }

    }
  },
  shareToMoment () {
    let that = this;
    let token = that.data.token;
    let qid = that.data.quesId;

    that.setData({
      showShare: false
    });
    wx.navigateTo({
      url: `/pages/saveposter/saveposter?qid=${qid}&token=${token}`
    })
  },

  //保存至相册

  //

  shareToFriends () {
    let that = this;
    that.setData({
      showShare: false
    })
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
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },
  confirmDialog (e) {
    let that = this;
    let openType = that.data.openType;
    let token = that.data.token;
    let userInfoApi = backApi.userInfo+token;
    that.setData({
      showDialog: false
    });
    if (openType==='getUserInfo') {
      wx.getUserInfo({
        success: (res)=>{
          let userInfo = res.userInfo;
          if (userInfo.nickName) {
            wx.setStorageSync('userInfo', userInfo);
            Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
              baseLock = res.data.data.user_base_lock;
              if (baseLock*1===2) {
                that.setData({baseRedDot: 1});
              }
            })
          }
        },
        fail: (res)=>{
          wx.openSetting({
            success(settingdata) {
              if (settingdata.authSetting["scope.userInfo"]) {
                Api.wxShowToast("获取权限成功",'none',2000)
              } else {
                Api.wxShowToast("获取权限失败",'none',2000)
              }
            }
          })
        }
      })
    } else {
    }

  },
  // 投票
  gotoVote (e) {
    let that = this;
    // let page = that.data.page;
    let token = that.data.token;
    // let watchQuesApi = backApi.watchQuesApi+token;
    // let noTopQuesApi = backApi.noTopQues+token;
    let userInfo = wx.getStorageSync('userInfo');
    let language = userInfo.language || '';
    let answerData = {
      qid: 0,
      choose: ''
    };

    // 判断是否授权
    if (language) {

      let qList = that.data.questionList;
      let direct = e.currentTarget.dataset.direct;
      let idx = e.currentTarget.dataset.index;
      let qid = '';
      if (e.currentTarget.dataset.item) {
        qid = e.currentTarget.dataset.item.id;
      }

      let answerApi = backApi.u_answer;
      answerData.qid = qid;
      let showThumb = that.data.showThumb;

      if (direct === 'left') {
        answerData.choose = 1;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          // 投票成功后
          if (status === 201) {
            if (!showThumb) {
              that.setData({showThumb: true})
            }
            let afterChoose = res.data.data;
            for (let i=0;i<qList.length;i++) {
              if (idx===i) {
                qList[i].choose_left = true;
                qList[i].showMask = true;
                qList[i].hots = afterChoose.hots;
                qList[i].choose1_per = afterChoose.choose1_per;
                qList[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    questionList: qList
                  })
                },600)
              }
            }
          } else {
            that.setData({showThumb: false})
            Api.wxShowToast('投过票了', 'none', 300);
          }
        })

      }
      if (direct === 'right') {
        answerData.choose = 2;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;
          // 投票成功后
          if (status === 201) {
            if (!showThumb) {
              that.setData({showThumb: true})
            }
            let afterChoose = res.data.data;
            for (let i=0;i<qList.length;i++) {
              if (idx === i) {
                qList[i].choose_right = true;
                qList[i].showMask = true;
                qList[i].hots = afterChoose.hots;
                qList[i].choose1_per = afterChoose.choose1_per;
                qList[i].choose2_per = afterChoose.choose2_per;
                setTimeout(()=>{
                  that.setData({
                    questionList: qList
                  })
                },600)
              }
            }
          } else {
            that.setData({showThumb: false,noShowThumb: true})
            Api.wxShowToast('投过票了', 'none', 2000);
          }
        })
      }

      if (direct==='userbase') {
        wx.navigateTo({
          url: `/pages/usercenter/usercenter`
        })
      }

      if (direct==='nobase') {
        that.setData({showbaseMask:true});
        setTimeout(()=>{
          that.setData({showUserbase: false})
        },3200)
      }

      setTimeout(()=>{
        that.slidethis(idx,qid,e.currentTarget.dataset.item);
      },4000)

    } else {
      // 微信授权
      that.setData({
        showDialog: true
      })
    }
  },
  // 到他人中心
  gotoOthers (e) {
    let that = this;
    let token = that.data.token;
    let userInfo = wx.getStorageSync('userInfo');
    let language = userInfo.language || '';
    let local_userId = '';
    if (language) {
      let mid = e.target.dataset.mid;
      let userInfoApi = backApi.userInfo+token;
      Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
        local_userId = res.data.data.id;
        if (local_userId*1===mid*1) {
          wx.reLaunch({
            url: `/pages/mine/mine`
          })
        } else {
          wx.navigateTo({
            url: `/pages/others/others?mid=${mid}`
          })
        }
      });
    } else {
      // 微信授权
      that.setData({
        showDialog: true
      })
    }
  },
  goShare (e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    let language = userInfo.language || '';
    if (language) {
      let quesId = e.target.dataset.question.id;
      let question = e.target.dataset.question.question;
      let token = that.data.token;
      let shareApi = backApi.shareApi+token;
      let postData = {
        type: 'friend',
        qid: quesId
      };

      Api.wxRequest(shareApi,'POST',postData,(res)=>{
        console.log(res.data.data.url,'friends');
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
      // 微信授权
      that.setData({
        showDialog: true
      })
    }
  },
  gotoDetails (e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    let language = userInfo.language || '';
    if (language) {
      let id = e.currentTarget.dataset.id;
      let myid = e.currentTarget.dataset.mid;
      let my = '';
      if (myid==mid) {
        my = 1;
      }
      wx.navigateTo({
        url: `/pages/details/details?id=${id}&my=${my}`
      })
    } else {
      // 微信授权
      that.setData({
        showDialog: true
      })
    }
  }

})

//获得角度
function getAngle(angx, angy) {
  return Math.atan2(angy, angx) * 180 / Math.PI;
};
//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
function getDirection(startx, starty, endx, endy) {
  var angx = endx - startx;
  var angy = endy - starty;
  var result = 0;
  //如果滑动距离太短
  if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
    return result;
  }

  var angle = getAngle(angx, angy);
  if (angle <= -50) {
    result = 1;
  } else if (angle >= 50) {
    result = 2;
  }

  return result;
}