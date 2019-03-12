Page({
  data: {
    content: '',
    msg: '',
    time: '',
    title: '',
    option1: '',
    option2: '',
    item: {},
    opLeftRed: '',
    opRightRed: '',
    titleRed: ''
  },
  onLoad: function (options) {
    let that = this;
    let msg = options.msg;
    let item = JSON.parse(options.item);
    let titleRed = '';
    let opLeftRed = '';
    let opRightRed = '';
    that.setData({
      item: item
    });
    if (msg !== 'null' && item.template_type===3 && item.type===2) {
      that.setData({msg: msg});
      let msgs=msg.replace(/<\/?.+?>/g,"");
      let msgArr = msgs.split(" ");
      let reg = /\{{(.+?)\}}/g;
      for (let i=0;i<msgArr.length;i++) {
        if (msgArr[i].match(reg)) {
          let word = msgArr[i].substring(msgArr[i].indexOf("{{")+2,msgArr[i].indexOf("}}"));
          msgArr[i] = msgArr[i].replace(/\{{.*?\}}/g, ` ${word} `);
        }
      }
      that.setData({
        title: msgArr[0],
        option1: msgArr[1],
        option2: msgArr[2],
        titleRed: titleRed,
        opLeftRed: opLeftRed,
        opRightRed: opRightRed
      })
    }
    if (msg !== 'null' && item.template_type===5 && item.type===2) {
      let reg = /\{{(.+?)\}}/g;
      if (msg.match(reg)) {
        let word = msg.substring(msg.indexOf("{{")+2,msg.indexOf("}}"));
        msg = msg.replace(/\{{.*?\}}/g, ` ${word} `);
        that.setData({msg:msg})
      }
    }
    if (item.id) {
      let time = item.created_time;
      that.setData({
        time: time,
        content: item.template.content
      })
    }
    wx.setNavigationBarColor({
      frontColor:'#000000',
      backgroundColor:'#F5F6F8'
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
})
