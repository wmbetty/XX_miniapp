const backApi = require('../../utils/util');
const Api = require('../../wxapi/wxApi');

Page({
  data: {
    pindex: -1,    // 当前转动到哪个位置，起点位置
    count: 8,    // 总共有多少个位置
    timer: 0,    // 每次转动定时器
    speed: 200,   // 初始转动速度
    times: 0,    // 转动次数
    cycle: 50,   // 转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1,   // 中奖位置
    click: true,
    showToast: false,
    viewHeight: 0,
    token: '',
    prizeList: [],
    showContent: false
  },
  onLoad: function () {
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status * 1 === 200) {
        let token = response.data.data.access_token;
        that.setData({token: token})
        let rewardItemApi = backApi.rewardItemApi+token;
        Api.wxRequest(rewardItemApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            that.setData({prizeList: res.data.data,showContent: true})
          } else {
            Api.wxShowToast('奖品数据获取失败','none',2000)
          }
        })
      }
    })
  },
  onShow () {
    let wxGetSystemInfo = Api.wxGetSystemInfo();
    wxGetSystemInfo().then(res => {
      if (res.windowHeight) {
        this.setData({viewHeight: res.windowHeight});
      }
    })
  },
  // 开始抽奖
  startLottery () {
    let that = this;
    let click = that.data.click;
    if (!click) {
      return
    }
    that.setData({
      speed: 200,
      click: false
    });
    that.startRoll()
  },
  // 开始转动
  startRoll () {
    let that = this;
    let times = that.data.times;
    let listItem = that.data.prizeList;
    that.setData({
      times: times+=1 // 转动次数
    })
    that.oneRoll()  // 转动过程调用的每一次转动方法，这里是第一次调用初始化
    // 如果当前转动次数达到要求 && 目前转到的位置是中奖位置
    if (that.data.times > that.data.cycle + 10 && that.data.prize === that.data.pindex) {
      clearTimeout(that.data.timer)   // 清除转动定时器，停止转动
      that.setData({
        prize: -1,
        times: 0,
        click: true,
        showToast: true
      })
      console.log('你已经中奖了', '000')
    } else {
      if (that.data.times < that.data.cycle) {
        let speed = that.data.speed;
        that.setData({
          speed: speed -= 10 // 加快转动速度
        })
      } else if (that.data.times === that.data.cycle) {    // 随机获得一个中奖位置
        let lotteryApi = backApi.lotteryApi+that.data.token;
        Api.wxRequest(lotteryApi,'GET',{}, (res)=>{
          console.log(res, 'lottery')
          if (res.data.status*1===200) {
            let reward_code = res.data.data.prize.code;
            // clearTimeout(that.data.timer);
            for (let i=0; i<listItem.length;i++) {
              if (listItem[i].code===reward_code) {
                that.setData({prize: i})
              }
            }
            // that.setData({prize: res.data.data.prize.code})
            setTimeout(()=>{
              wx.showModal({
                title: '提示',
                content: `${res.data.data.msg}`,
                showCancel: 'false',
                success: function(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  }
                }
              })
            },2800)
          } else {
            clearTimeout(that.data.timer)   // 清除转动定时器，停止转动
            that.setData({
              prize: -1,
              times: 0,
              click: true,
              showToast: true,
              pindex: -1
            })
            Api.wxShowToast(res.data.msg,'none',2000)
          }

        })
      } else if (that.data.times > that.data.cycle + 10 &&
        ((that.data.prize === 0 && that.data.pindex === 7) || that.data.prize === that.data.pindex + 1)) {
        let speed = that.data.speed;
        that.setData({speed: speed+=110})
      } else {
        let speed = that.data.speed;
        that.setData({speed: speed+=20})
      }

      if (that.data.speed < 40) {
        that.setData({speed: 40})
      }
      that.setData({timer: setTimeout(that.startRoll, that.data.speed)})
    }
  },
  // 每一次转动
  oneRoll () {
    let that = this;
    let index = that.data.pindex  // 当前转动到哪个位置
    const count = that.data.count  // 总共有多少个位置
    index += 1
    if (index > count - 1) {
      index = 0
    }
    that.setData({pindex: index})
  },
  onShareAppMessage: function () {
    return {
      title: '参与抽奖',
      path: `/pages/gcindex/gcindex?isReward=1`
    }
  }
})
