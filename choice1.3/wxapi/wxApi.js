function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = res => resolve(res)
      obj.fail = err => reject(err)
      fn(obj)
    })
  }
}

//微信用户登录，获取code
function wxLogin() {
  return wxPromisify(wx.login)
}

/**
 * 获取微信用户信息
 * 必须在登录之后调用
 */
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}

/**
 获取用户的当前设置
 */
function wxGetSetting() {
  return wxPromisify(wx.getSetting)
}

/**
 * 获取系统信息
 */
function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}

/**
 * 消息提示
 */
function wxShowToast(title, icon, duration) {
  //title 文本最多显示 7 个汉字长度,
  //不显示图标时， title 文本最多可显示两行
  //icon有效值：success、loading、none
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  })
}

/**
 * 显示模态弹窗
 */
function wxShowModal(title, txt, showCancel, callback) {
  wx.showModal({
    confirmText: '确认',
    title: title,
    content: txt,
    confirmColor: '#E74C49',
    showCancel: showCancel,
    success: (res) => {
      callback(res)
    }
  })
}

// 本地存储
function wxSetStorage(key, value) {
  wx.setStorage({
    key: key,
    data: value
  })
}

function wxGetStorage(key, callback) {
  wx.getStorage({
    key: key,
    success: (res) => {
      callback(res)
    }
  })
}

function wxRemoveStorage(key, callback) {
  wx.removeStorage({
    key: key,
    success: function(res) {
      callback(res)
    }
  })
}

/**
 * 发起请求
 */
function wxRequest(url, method, data={}, callback) {
  wx.request({
    url: url,
    method: method,
    data: data,
    header: {
      'content-type': 'application/json' // 默认值
      // 'content-type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      callback(res)
    },
    fail: (res) => {
      console.log(res)
    }
  })
}

module.exports = {
  wxPromisify: wxPromisify,
  wxLogin: wxLogin,
  wxGetUserInfo: wxGetUserInfo,
  wxGetSystemInfo: wxGetSystemInfo,
  wxGetSetting: wxGetSetting,
  wxRequest: wxRequest,
  wxShowToast: wxShowToast,
  wxShowModal: wxShowModal,
  wxSetStorage: wxSetStorage,
  wxGetStorage: wxGetStorage,
  wxRemoveStorage: wxRemoveStorage
}