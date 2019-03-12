// components/dialog/dialog.js
Component({
  properties: {
    dialogShow:{
      type: Boolean,
      value: false
    },
    openType: {
      type: String,
      value: 'getUserInfo'
    },
    authInfo: {
      type: String,
      value: '需要微信授权登录才能更多操作哦'
    }
  },
  data: {},
  methods: {
    confirmDialog () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
       this.triggerEvent('confirmDialog', myEventDetail, myEventOption)
    },
    cancelDialog (e) {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
       this.triggerEvent('cancelDialog', myEventDetail, myEventOption)
    }
  }
})
