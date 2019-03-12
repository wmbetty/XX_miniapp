const Api = require('../wxapi/wxApi');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// const http = "https://fabu.choosen.604f.cn/"
// fabu.choosen.79643.com
const http = "https://choosen.79643.com/"
const login = `${http}v1/member/login`
const questop = `${http}v1/questions/top?access-token=`
const noTopQues = `${http}v1/questions?access-token=`
const my_quest = `${http}v1/questions/my-question?access-token=`
const join_quest = `${http}v1/questions/join-question?access-token=`
const choose_answer = `${http}v1/choose?access-token=`
const watch_ques = `${http}v1/watch?access-token=`
const publish = `${http}v1/questions?access-token=`
const quesDetail = `${http}v1/questions/`
const vote_count = `${http}v1/message/vote-count?access-token=`
const notice_count = `${http}v1/message/notice-count?access-token=`
const notice_msg = `${http}v1/message/notice-msg?access-token=`
const vote_msg = `${http}v1/message/vote-msg?access-token=`
const userInfo = `${http}v1/member/user-info?access-token=`
const myInfo = `${http}v1/member/info?access-token=`
const othersInfo = `${http}v1/member/other-info?access-token=`
const msgUnreadTotal = `${http}v1/message/total-count?access-token=`
const myChooseTagApi = `${http}v1/choose/my-choose?access-token=`
const readNoticeApi = `${http}v1/message/read-notice?access-token=`
const readVoteApi = `${http}v1/message/read-vote?access-token=`
const otherPublishQues = `${http}v1/questions/others-question?access-token=`
const feedback = `${http}v1/feed?access-token=`
const deleMyQues = `${http}v1/questions/`
const shareFriends = `${http}v1/share/share-friend`
const shareMoment = `${http}v1/share/share-circle?access-token=`
const posterApi = `${http}v1/questions/share-code?access-token=`
const uploadApi = `${http}v1/questions/upload-images?access-token=`
const userBaseApi = `${http}v1/basis/user-basis?access-token=`
const showBaseApi = `${http}v1/member/show-basis?access-token=`
const commentApi = `${http}v1/comment?access-token=`
const praiseApi = `${http}v1/comment/praise?access-token=`
const commentUnreadApi = `${http}v1/message/comment-notice-none-count?access-token=`
const commMsgListApi = `${http}v1/message/comment-notice?access-token=`
const commReadApi = `${http}v1/message/read-comment-notice?access-token=`
const shareApi = `${http}v1/share/share-generate?access-token=`
const bannerApi = `${http}v1/banner?access-token=`
const categoryListApi = `${http}v1/category?access-token=`
const topicListApi = `${http}v1/topic?access-token=`
const cateDetailsApi = `${http}v1/category/`
const cateQuesApi =  `${http}v1/category/question?access-token=`
const topicDetail = `${http}v1/topic/`
const topicQues = `${http}v1/topic/question?access-token=`
const rankApi = `${http}v1/ranking?access-token=`
const activityApi = `${http}v1/activity/`
const rewardItemApi = `${http}v1/reward?access-token=`
const lotteryApi = `${http}v1/reward/lottery?access-token=`
const miniprogramApi = `${http}v1/miniprogram`

function getToken(){
  return new Promise(function(resolve,reject){
    //ajax...
    wx.login({
      success: function(res) {
        let reqData = {};
        let code = res.code;
        if (code) {
          reqData.code = code;
          Api.wxRequest(login,'POST',reqData,(res)=>{
            resolve(res)
          })
        }
      }
    });
    //如果有错的话就reject
  })
}

module.exports = {
  formatTime: formatTime,
  loginApi: login,
  questions: questop,
  noTopQues: noTopQues,
  my_question: my_quest,
  my_join: join_quest,
  u_answer: choose_answer,
  publishApi: publish,
  quesDetail: quesDetail,
  voteUnreadApi: vote_count,
  noticeUnreadApi: notice_count,
  noticeMsg: notice_msg,
  voteMsg: vote_msg,
  userInfo: userInfo,
  othersInfo: othersInfo,
  msgUnreadTotal: msgUnreadTotal,
  watchQuesApi: watch_ques,
  myChooseTagApi: myChooseTagApi,
  readNoticeApi: readNoticeApi,
  readVoteApi: readVoteApi,
  otherPublishQues: otherPublishQues,
  myInfo: myInfo,
  feedback: feedback,
  deleMyQues: deleMyQues,
  shareFriends: shareFriends,
  shareMoment: shareMoment,
  posterApi: posterApi,
  uploadApi: uploadApi,
  userBaseApi: userBaseApi,
  showBaseApi: showBaseApi,
  getToken: getToken,
  commentApi: commentApi,
  praiseApi: praiseApi,
  commentUnreadApi: commentUnreadApi,
  commMsgListApi: commMsgListApi,
  commReadApi: commReadApi,
  shareApi: shareApi,
  bannerApi: bannerApi,
  categoryListApi: categoryListApi,
  topicListApi: topicListApi,
  cateDetailsApi: cateDetailsApi,
  cateQuesApi: cateQuesApi,
  topicDetail: topicDetail,
  topicQues: topicQues,
  rankApi: rankApi,
  activityApi: activityApi,
  rewardItemApi: rewardItemApi,
  lotteryApi: lotteryApi,
  miniprogramApi: miniprogramApi
}
