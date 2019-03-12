const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    textNum: 0,
    restNum: 200,
    isSubmit: false,
    mobile: '',
    content: '',
    contVal: '',
    submitDis: false,
    token: '',
    audit: ''
  },
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor:'#000000',
       backgroundColor:'#F5F6F8'
    });
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status*1===200) {
        let token = response.data.data.access_token;
        let audit = response.data.data.status;
        that.setData({token: token, audit: audit});
      } else {
        Api.wxShowToast('网络出错了，请稍后再试哦~', 'none', 2000);
      }
    })
  },
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      return {
        title: '选象 让选择简单点',
        path: `/pages/gcindex/gcindex`
      }
    }
  },
  putMobile (e) {
    let val =  (e.detail.value).replace(/\s+/g,"");
    let mobileReg=/^[1][3,4,5,7,8][0-9]{9}$/;
    if (!mobileReg.test(val)) {
      Api.wxShowToast('请填写11位有效手机号', 'none', 2000);
    } else {
      this.setData({mobile: val})
    }

  },
  putAdvice (e) {
    let that = this;
    let val =  e.detail.value;
    let textNum = val.length;
    let restNum = 200 - textNum*1;
    if (textNum > 200) {
      Api.wxShowToast('建议最多200字哦', 'none', 2000);
    } else if (0<textNum<=200){
      val = val.substring(0, 200)
      that.setData({
        isSubmit: true,
        content: val,
        contVal: val,
        textNum: textNum,
        restNum: restNum
      })
    }
  },
  submitAdvice () {
    let that = this;
    let textNum = this.data.textNum;
    let token = that.data.token;
    let feedApi = backApi.feedback+token;
    let audit = that.data.audit;
    let feedData = {
      content: that.data.content,
      mobile: that.data.mobile
    }

    if (textNum) {
      that.setData({
        submitDis: true
      })
      if (audit === 'audit') {
        Api.wxShowToast('检测违禁词中，暂时无法提交', 'none', 2000);
      } else {
        Api.wxRequest(feedApi,'POST',feedData,(res)=> {
          that.setData({
            isSubmit: false
          })
          wx.showLoading({
            title: '提交中',
            mask: true
          });
          if (res.data.status*1===201 && res.data.data.id) {
            wx.hideLoading();
            that.setData({
              submitDis: false
            })
            Api.wxShowToast('感谢你的建议，小象会及时跟进哟~', 'none', 2200);
            setTimeout(()=> {
              wx.navigateBack({
                delta: 1
              })
            }, 2000)
          }
        })
      }
    } else {
      Api.wxShowToast('填写建议反馈后方能提交哦', 'none', 2000);
    }
  }
})
