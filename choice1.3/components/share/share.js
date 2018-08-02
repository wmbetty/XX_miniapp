// components/share/share.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // winHeight: {
    //   type: Number,
    //   value: 0
    // },
    mask: {
      type: Boolean,
      value: false
    },
    share: {
      type: Boolean,
      value: false
    },
    delete: {
      type: Boolean,
      value: false
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
    cancelShare () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
      //  this.mask = false;
       this.triggerEvent('cancelShare', myEventDetail, myEventOption)
    },
    deleteChoice () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
       this.triggerEvent('deleteChoice', myEventDetail, myEventOption)
    },
    shareToFriends () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
       this.triggerEvent('shareToFriends', myEventDetail, myEventOption)
    },
    shareToMoment () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
       var myEventOption = {} // 触发事件的选项
       this.triggerEvent('shareToMoment', myEventDetail, myEventOption)
    }
  }
})
