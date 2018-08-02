const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');
let qid = '';
let isComment = false;

Page({
  data: {
    details: {},
    userInfo: {},
    leftPercent: 0.36,
    isLeft: false,
    isRight: false,
    showMask: false,
    isShare: false,
    isDelete: false,
    winHeight: 0,
    winWidth: 0,
    quesId: '',
    maskHidden: false,
    isMy: false,
    ismyVoted: false,
    showVoteMsk: false,
    rightRed: false,
    leftRed: false,
    hots: 0,
    showDialog: false,
    hasVoted: false,
    qrcodeImg: '',
    showPosterView: false,
    viewWidth: 0,
    myAvatar: '',
    showThumb: false,
    token: '',
    openType: 'getUserInfo',
    authInfo: '需要微信授权登录才能更多操作哦',
    page: 1,
    commentList: [],
    toastText:'评论最多可输入80字符~',
    isWeToast: false,
    nomoreList:true
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
    let openType = that.data.openType;
    that.setData({
      showDialog: false
    });
    if (openType==='getUserInfo') {
      wx.getUserInfo({
        success: (res)=>{
          let userInfo = res.userInfo;
          if (userInfo.nickName) {
            that.setData({myAvatar: userInfo.avatarUrl});
            wx.setStorageSync('userInfo', userInfo);
            Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
              console.log(res.data.status, 'sssssssss')
            });
            let detailUrl = backApi.quesDetail+qid;
            let myChooseTagApi = backApi.myChooseTagApi+token;
            let commentApi = backApi.commentApi+token;
            let page = that.data.page;

            Api.wxRequest(detailUrl,'GET',{},(res)=>{

              if (res.data.data.id) {
                if (res.data.data.status*1===4) {
                  Api.wxShowToast('该话题已被删', 'none', 3000);
                  setTimeout(()=>{
                    wx.reLaunch({
                      url: `/pages/main/main`
                    })
                  },1500)
                } else {
                  that.setData({
                    details: res.data.data,
                    quesId: res.data.data.id,
                    hots: res.data.data.hots
                  });
                  if (res.data.data.member) {
                    that.setData({
                      userInfo: res.data.data.member
                    })
                  }
                }
              } else {
                Api.wxShowToast('网络错误，请重试', 'none', 2000);
              }
            });
            Api.wxRequest(myChooseTagApi,'GET',{qid:qid},(res)=> {

              if (res.data === '') {
                that.setData({
                  ismyVoted: false
                })
              }
              if (res.data.status*1===200) {
                that.setData({
                  ismyVoted: true
                });
                if (res.data.data.choose*1===1) {
                  that.setData({
                    isLeft: true
                  })
                } else {
                  that.setData({
                    isRight: true
                  })
                }
              }
            });
            // 获取评论列表
            getCommentList(commentApi,qid,page,that);
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
  onLoad: function (options) {
    let that = this;
    let sec = options.scene || '';

    if (sec) {
      qid = sec;
    } else {
      qid = options.id;
    }

    let myTag = options.my;
    if (myTag*1===1) {
      that.setData({isMy: true})
    }
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        that.setData({winHeight: res.windowHeight,winWidth:res.windowWidth});
      }
    });
    wx.setNavigationBarColor({
      frontColor:'#000000',
       backgroundColor:'#F5F6F8'
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
    if (userInfo.language) {
      that.setData({myAvatar: userInfo.avatarUrl});

      backApi.getToken().then(function(response) {
        if (response.data.status*1===200) {
          let token = response.data.data.access_token;
          that.setData({token: token});
          let detailUrl = backApi.quesDetail+qid;
          let myChooseTagApi = backApi.myChooseTagApi+token;
          let commentApi = backApi.commentApi+token;
          let page = that.data.page;

          Api.wxRequest(detailUrl,'GET',{},(res)=>{

            if (res.data.data.id) {
              if (res.data.data.status*1===4) {
                Api.wxShowToast('该话题已被删', 'none', 3000);
                setTimeout(()=>{
                  wx.reLaunch({
                    url: `/pages/main/main`
                  })
                },1500)
              } else {
                that.setData({
                  details: res.data.data,
                  quesId: res.data.data.id,
                  hots: res.data.data.hots
                });
                if (res.data.data.member) {
                  that.setData({
                    userInfo: res.data.data.member
                  })
                }
              }
            } else {
              Api.wxShowToast('网络错误，请重试', 'none', 2000);
            }
          });
          Api.wxRequest(myChooseTagApi,'GET',{qid:qid},(res)=> {

            if (res.data === '') {
              that.setData({
                ismyVoted: false
              })
            }
            if (res.data.status*1===200) {
              that.setData({
                ismyVoted: true
              });
              if (res.data.data.choose*1===1) {
                that.setData({
                  isLeft: true
                })
              } else {
                that.setData({
                  isRight: true
                })
              }
            }
          });
          // 获取评论列表
          getCommentList(commentApi,qid,page,that);

          let userInfoApi = backApi.userInfo+token;
          Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
            that.setData({uInfo:res.data.data})
          })

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
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let commentPage = that.data.commentPage;
    let token = that.data.token;
    let commentApi = backApi.commentApi+token;
    let commlist = that.data.commentList;
    if (commentPage>1 && page<= commentPage) {
      wx.showLoading({title:'加载中'});
      Api.wxRequest(commentApi,'GET',{qid:qid,page:page},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          let moreList = res.data.data || [];
          that.setData({commentList: commlist.concat(moreList),page:page});
        } else {
          wx.hideLoading();
          Api.wxShowToast('获取评论数据出错，请稍后再试哦~', 'none', 2000);
        }
      })
    } else {
      if (commlist.length) {
        that.setData({nomoreList:true});
      }
    }
  },
  onShareAppMessage: function (res) {
    let that = this;
    let token = that.data.token;
    let questId = that.data.quesId;
    let shareFriends = backApi.shareFriends+'?access-token='+token;
    let friend_img_url = that.data.details.friend_img_url || '';

    return {
      title: that.data.details.question,
      path: `/pages/main/main?qid=${questId}`,
      imageUrl: friend_img_url?friend_img_url:'/images/posterBg2.png',
      success() {
        Api.wxRequest(shareFriends,'POST',{},(res)=>{
          // console.log(res, 'friends')
        })
      },
      fail() {},
      complete() {}
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
        title: "详情"
      });
    } else {
      wx.setNavigationBarColor({
        frontColor:'#000000',
        backgroundColor:'#F5F6F8'
      });
      wx.setNavigationBarTitle({
        title: ""
      })
    }
  },
  gotoShare (e) {
    let that = this;
    let token = that.data.token;
    let shareApi = backApi.shareApi+token;
    let postData = {
      type: 'friend',
      qid: that.data.details.id
    };

    Api.wxRequest(shareApi,'POST',postData,(res)=>{
      console.log(res.data.data.url,'friends');
      if (res.data.status*1===201) {
        that.setData({shareFriImg:res.data.data.url})
      }
    });
    that.setData({
      isShare: true,
      isDelete: false,
      showMask: true,
      isSlidedown: false
    })
  },
  cancelShare () {
    let that = this;
    that.setData({isSlidedown:true});
    setTimeout(()=>{
      that.setData({
        showMask: false
      })
    },280)
  },
  gotoDelete () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.language) {
      that.setData({
        isDelete: true,
        isShare: false,
        showMask: true,
        isSlidedown: false
      })
    } else {
      that.setData({showDialog: true})
    }
  },
  deleteChoice () {
    let that = this;
    let token = that.data.token;
    let deleMyQues = backApi.deleMyQues+`${qid}?access-token=${token}`;
    that.setData({
      showMask: false,
      maskHidden: false
    });
    Api.wxShowModal('', '删除后不可恢复，是否确认删除？', true, (res) => {
      if (res.confirm) {
        Api.wxRequest(deleMyQues,'DELETE',{},(res)=>{
          if (res.data.status*1 === 200) {
            Api.wxShowToast('删除成功', 'none', 2000);
            setTimeout(()=> {
              wx.navigateBack({
                delta: 1
              })
            }, 600)
          }
        })
      }
    })
  },
shareToMoment () {
  let that = this;
  let token = that.data.token;
  let qid = that.data.quesId;

  that.setData({
    showMask: false
  });
  wx.navigateTo({
    url: `/pages/saveposter/saveposter?qid=${qid}&token=${token}`
  })
},
  
  shareToFriends () {
    setTimeout(()=>{
      this.setData({
        isShare: false,
        showMask: false
      })
    },600)
  },
  //保存至相册

  //  投票
  goVote (e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.language) {
      let userInfoApi = backApi.userInfo+that.data.token;
      Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
        that.setData({uInfo:res.data.data})
      });

      let hasVoted = that.data.hasVoted;
      let chooseItem = e.currentTarget.dataset.choose;
      let details = e.currentTarget.dataset.details;
      let ismyVoted = that.data.ismyVoted
      let answerApi = backApi.u_answer;
      let qid = details.id;
      let answerData = {
        qid: qid,
        choose: ''
      };
      if (hasVoted) {
        Api.wxShowToast('这个问题投过票了', 'none', 2000);
        return false
      }
      
      if (chooseItem === 'one' && !ismyVoted || chooseItem === 'two' && !ismyVoted) {
        that.setData({
          showVoteMsk: true
        });

        if (chooseItem === 'one') {
          answerData.choose = 1
          let rightRed = that.data.rightRed;
          if (!rightRed) {
            that.setData({
              leftRed: true
            })
          }
          
        }
        if (chooseItem === 'two') {
          answerData.choose = 2;
          let leftRed = that.data.leftRed;
          if (!leftRed) {
            that.setData({
              rightRed: true
            })
          }
        }

        let token = that.data.token;
        let watchQuesApi = backApi.watchQuesApi+token;
        let showThumb = that.data.showThumb;
        Api.wxRequest(answerApi+token,'POST',answerData,(res)=>{
          let status = res.data.status*1;

          if (status === 201) {
            if (!showThumb) {
              details.hots = res.data.data.hots;
              details.choose1_per = res.data.data.choose1_per;
              details.choose2_per = res.data.data.choose2_per;
              that.setData({
                showThumb: true,
                details: details
              })
            }
            that.setData({
              hasVoted: true
            });
            Api.wxRequest(watchQuesApi,'POST',{qid: res.data.data.id}, (res)=> {
              console.log(res, 'ssss')
            });
            // 请求通知消息
            let msgTotalApi = backApi.msgUnreadTotal+token
            Api.wxRequest(msgTotalApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                setTimeout(()=> {
                  let msgTotal = res.data.data.total;
                  wx.setStorageSync('msgTotal', msgTotal);
                  that.setData({msgCount: msgTotal})
                }, 100)
              } else {
                Api.wxShowToast('网络出错了', 'none', 2000);
              }
            });
            // 请求投票消息
            let voteUnreadApi = backApi.voteUnreadApi+token
            Api.wxRequest(voteUnreadApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                if (res.data.data.vote) {
                  wx.setStorageSync('msgTotal', res.data.data.vote);
                  that.setData({msgCount: res.data.data.vote})
                }
              } else {
                Api.wxShowToast('网络出错了', 'none', 2000);
              }
            });
            // 请求评论消息
            let commUnreadApi = backApi.commentUnreadApi+token
            Api.wxRequest(commUnreadApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                if (res.data.data.total) {
                  wx.setStorageSync('commTotal', res.data.data.total);
                  that.setData({commentCount: res.data.data.total})
                }
              } else {
                Api.wxShowToast('网络出错了', 'none', 2000);
              }
            })
          }
          setTimeout(()=>{
            that.setData({showThumb: false})
          },3500)
        });
        
      }
    } else {
      that.setData({
        showDialog: true
      })
    }
    
  },
  gotoOthers (e) {
    let mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: `/pages/others/others?mid=${mid}`
    })
  },
  goHome () {
    wx.reLaunch({
      url: `/pages/main/main`
    })
  },
  // 点赞
  gotoLike (e) {
    let that = this;
    let token = that.data.token;
    let userInfo = wx.getStorageSync('userInfo');
    let userInfoApi = backApi.userInfo+token;
    let cid = e.currentTarget.dataset.cid;
    let idx = e.currentTarget.dataset.index;
    let commList = that.data.commentList;
    if (userInfo.language) {
      Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
        that.setData({uInfo:res.data.data})
      });
      let praiseApi = backApi.praiseApi+token;
      Api.wxRequest(praiseApi,'GET',{cid:cid},(res)=>{
        let status = res.data.status*1;
        if (status===201) {
          for (let i=0;i<commList.length;i++) {
            if (idx===i) {
              commList[i].isLike = true;
              commList[i].total_praise = commList[i].total_praise*1+1;
              that.setData({commentList:commList})
            }
          }
        } else {
          Api.wxShowToast(res.data.msg, 'none', 2000);
        }
      })
    } else {
      that.setData({
        showDialog: true
      })
    }
  },
  // 发表评论
  publishComment () {
    let that = this;
    let token = that.data.token;
    let pid = that.data.pid;
    let content = that.data.content;
    let commentApi = backApi.commentApi+token;
    let commentType = that.data.commentType;
    let commentList = that.data.commentList;
    let idx = that.data.idx;
    let userInfo = wx.getStorageSync('userInfo');
    let userInfoApi = backApi.userInfo+token;
    let details = that.data.details;
    Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
      that.setData({uInfo:res.data.data})
    });

    if (!content) {
      Api.wxShowToast('请填写内容哦', 'none', 2000);
      setTimeout(()=>{
        that.setData({showInput: true});
      },1500)
    } else {
      that.setData({showClickBtn:true});
      let postData = {};
      if (commentType==='reply') {
        postData = {qid: qid,pid:pid,content:content}
      } else {
        postData = {qid: qid,content:content}
      }
      Api.wxRequest(commentApi,'POST',postData,(res)=>{
        let status = res.data.status*1;
        if (status===201) {
          wx.showLoading({
            title:'发表中'
          });
          let item = res.data.data;
          setTimeout(()=>{
            wx.hideLoading();
            commentList.unshift(item);
            that.setData({commentList:commentList,showInput:false,inputVal:'',content:'',isRed:false});
            if (idx==='') {
              details.total_comment = details.total_comment*1+1;
              that.setData({details:details});
            }
            Api.wxShowToast('评论成功', 'none', 2000);
          },1000)
        } else {
          wx.hideLoading();
          Api.wxShowToast(res.data.msg, 'none', 2000);
        }
      });
    }
  },
  // 获取键盘高度
  getHeight () {
    console.log('获取键盘高度')
  },
  // 获取输入框内容
  getContent (e) {
    let that = this;
    let val = e.detail.value;
    if (val) {
      that.setData({isRed:true});
    } else {
      that.setData({isRed:false});
    }
    if (val.length>=79) {
      that.setData({isWeToast:true});
      setTimeout(()=>{
        that.setData({isWeToast:false});
      },2000)
    } else {
      that.setData({isWeToast:false});
    }
    that.setData({content:val});
  },
  // 回复评论
  gotoReply (e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.language) {
      let pid = e.currentTarget.dataset.pid || '';
      let commentType = e.currentTarget.dataset.type;
      let atename = e.currentTarget.dataset.atename;
      let idx = e.currentTarget.dataset.index || '';
      let userInfoApi = backApi.userInfo+that.data.token;
      let content = that.data.content;

      that.setData({pid:pid,commentType:commentType,showClickBtn:false,idx:idx,showInput:true});

      Api.wxRequest(userInfoApi,'PUT',userInfo,(res)=> {
        that.setData({uInfo:res.data.data});
      });

      if (commentType==='reply') {
        that.setData({atename:atename});
      } else {
        that.setData({atename:''});
      }

      if (commentType==='reply' && content!=='' && isComment) {
        that.setData({inputVal:''});
        isComment = false
      }
      if (commentType==='comment' && content!=='' && !isComment) {
        that.setData({inputVal:''});
        isComment = true
      }

    } else {
      that.setData({
        showDialog: true
      })
    }
  },
  inputBlur () {
    this.setData({showInput:false})
  },
  gotoOthers (e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    let language = userInfo.language || '';
    if (language) {
      let mid = e.currentTarget.dataset.mid;
      wx.navigateTo({
        url: `/pages/others/others?mid=${mid}`
      })
    } else {
      // 微信授权
      that.setData({
        showDialog: true
      })
    }
  }
})

// 获取评论列表
function getCommentList(commentApi,qid,page,that) {
  Api.wxRequest(commentApi,'GET',{qid:qid,page:page},(res)=>{
    if (res.data.status*1===200) {
      let commentList = res.data.data || [];
      let commentPage = res.header['X-Pagination-Page-Count'];
      that.setData({commentList: commentList,commentPage:commentPage})
    } else {
      Api.wxShowToast('获取评论数据出错，请稍后再试哦~', 'none', 2000);
    }
  })
}
