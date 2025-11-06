Page({
  data: {
    // 可在这里添加页面数据（如用户信息、商品列表等）
    showDialog: false,    // 控制对话框显示
    avatarUrl: '',        // 头像临时路径
    nickName: ''          // 用户昵称
  },

  onLoad() {
    // 页面加载时的初始化操作
    wx.getStorage({
      key: 'userInfo', // 要读取的键名
      success: (res) => {
        console.log('读取到的缓存数据：', res.data);
        // res.data 即为存入的值（如 {name: '张三', ...}）
        if (res.data?.isLogin) {
          this.setData({
            nickName: res.data.nickName,
            avatarUrl: res.data.avatarUrl
          })
        }
      },
      fail: (err) => {
        console.error('读取缓存失败（可能不存在）', err);
      }
    });
  },

  // 显示登录对话框
  showLoginDialog() {
    this.setData({
      showDialog: true
    })
  },

  // 关闭对话框
  closeDialog() {
    this.setData({
      showDialog: false
    })
  },

  // 选择头像回调
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl
    })
  },

  // 昵称输入回调
  onNicknameInput(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  confirmLogin() {
    const { avatarUrl, nickName } = this.data

    // 这里可以添加登录逻辑，比如上传用户信息到服务器
    wx.showLoading({
      title: '登录中...'
    })

    // 模拟登录请求
    setTimeout(() => {
      // 保存用户信息到本地存储
      wx.setStorageSync('userInfo', {
        avatarUrl,
        nickName,
        isLogin: true
      })

      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 关闭对话框
      this.closeDialog()

      // 可以添加跳转逻辑
      // wx.navigateBack()
    }, 1000)
  },
  // 绑定手机号点击事件
  onClickPowerInfo(event) {
    const name = event.currentTarget.dataset.name;
    wx.showToast({
      title: `${name}功能即将开放，尽请期待`,
      icon: 'none'
    })
  },
  // TodoList
  onTargetUrl(event) {
    const url = event.currentTarget.dataset.url;
    wx.navigateTo({
      url,
    });
  }
})