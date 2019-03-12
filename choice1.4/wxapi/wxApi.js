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

function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}

function wxGetSetting() {
  return wxPromisify(wx.getSetting)
}

function wxGetSystemInfo() {
  return wxPromisify(wx.getSystemInfo)
}

function wxShowToast(title, icon, duration) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  })
}

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