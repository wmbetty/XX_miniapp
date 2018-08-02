// components/empty/empty.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showBlue: {
      type: Boolean,
      value: false
    },
    emptyInfo: {
      type: String,
      value: '还没有收到通知哦'
    },
    blueText: {
      type: String,
      value: '点击底部“+”发起我的第一条'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
