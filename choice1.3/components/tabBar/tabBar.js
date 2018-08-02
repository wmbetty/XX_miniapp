// components/tabBar/tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    msgCount: {
      type: Number,
      value: 0
    },
    voteUnreadCount: {
      type: Number,
      value: 0
    },
    baseRedDot: {
      type: Number,
      value: 0
    },
    commentTotal: {
      type: Number,
      value: 0
    }
  }
})
//初始化数据
function tabbarinit() {
  return [
       { "current":0,
         "pagePath": "/pages/main/main",
         "iconPath": "/images/main.png",
         "selectedIconPath": "/images/main_act.png",
         "text": "选象"
       },
      //  {
      //    "current": 0,
      //    "pagePath": "/pages/messages/messages",
      //    "iconPath": "/images/msg.png",
      //    "selectedIconPath": "/images/msg_act.png",
      //    "text": "消息"
 
      //  },
       {
         "current": 0,
         "pagePath": "/pages/index/index",
         "iconPath": "/images/add_bigIcon.png",
         "selectedIconPath": "/images/add_bigIcon.png"
       },
       {
         "current": 0,
         "pagePath": "/pages/mine/mine",
         "iconPath": "/images/my.png",
         "selectedIconPath": "/images/my_act.png",
         "text": "我"
       }
     ]
 }
 //tabbar 主入口
 function tabbarmain(bindName = "tabdata", id, target) {
   var that = target;
   var bindData = {};
   var otabbar = tabbarinit();
   otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']//换当前的icon
   otabbar[id]['current'] = 1;
   bindData[bindName] = otabbar
   that.setData({ bindData });
 }
 
 module.exports = {
   tabbar: tabbarmain
 }
