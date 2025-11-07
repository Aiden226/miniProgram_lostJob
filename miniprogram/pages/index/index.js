Page({
    data: {
        // 可在这里添加页面数据（如用户信息、商品列表等）
        showDialog: false,    // 控制对话框显示
        avatarUrl: '',        // 头像临时路径
        nickName: '',          // 用户昵称
        showModal: false, // 弹窗显示状态
        selectedDate: '', // 选中的出生日期
        todayDate: '', // 今天日期（格式：YYYY-MM-DD）
        resultDays: 0 // 已过天数结果
    },

    onLoad() {
        // 初始化日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.setData({ todayDate: `${year}-${month}-${day}` });
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
        wx.getStorage({
            key: 'selectedDate',
            success: (res) => {
                this.setData({
                    selectedDate: res.data
                }, () => this.calculateDays())
            },
            fail: (err) => {
                console.error('读取缓存失败（可能不存在）', err);
            }
        })
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
    },
    // 打开日期选择弹窗
    openDateModal() {
        this.setData({ showModal: true });
    },

    // 关闭弹窗
    closeModal() {
        this.setData({ showModal: false });
    },

    // 选择日期变化
    onDateChange(e) {
        this.setData({ selectedDate: e.detail.value });
    },

    // 计算已过天数
    calculateDays() {
        const { selectedDate, todayDate } = this.data;
        wx.setStorageSync('selectedDate', selectedDate)
        // 验证是否选择日期
        if (!selectedDate) {
            wx.showToast({
                title: '请选择离职日期',
                icon: 'none',
                duration: 1500
            });
            return;
        }

        // 转换为时间戳（毫秒）
        const birthTimestamp = new Date(selectedDate).getTime();
        const todayTimestamp = new Date(todayDate).getTime();

        // 验证日期有效性（不能晚于今天）
        if (birthTimestamp > todayTimestamp) {
            wx.showToast({
                title: '离职日期不能晚于今天',
                icon: 'none',
                duration: 1500
            });
            return;
        }

        // 计算天数差（毫秒转天：除以 86400000 = 24*60*60*1000）
        const daysDiff = Math.floor((todayTimestamp - birthTimestamp) / 86400000);

        // 更新结果并关闭弹窗
        this.setData({
            resultDays: daysDiff,
            showModal: false
        });
    }
})