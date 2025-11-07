Page({
    data: {
      diaryList: [] // 日记列表数据
    },
  
    onLoad() {
      this.getDiaryList();
    },
  
    onShow() {
      this.getDiaryList();
    },
  
    // 从本地存储读取日记列表
    getDiaryList() {
      const diaryList = wx.getStorageSync('diaryList') || [];
      diaryList.sort((a, b) => new Date(b.time) - new Date(a.time));
      this.setData({ diaryList });
    },
  
    // 跳转到编辑页
    gotoEditPage() {
      wx.navigateTo({
        url: '/packageB/pages/diaryEdit/diaryEdit'
      });
    },
  
    // 新增：删除日记
    deleteDiary(e) {
      const diaryId = e.currentTarget.dataset.id;
      const { diaryList } = this.data;
  
      // 弹窗确认删除
      wx.showModal({
        title: '提示',
        content: '确定要删除这篇日记吗？',
        cancelText: '取消',
        confirmText: '删除',
        confirmColor: '#ff6b6b',
        success: (res) => {
          if (res.confirm) {
            // 过滤掉要删除的日记
            const newDiaryList = diaryList.filter(item => item.id !== diaryId);
            // 保存到本地存储
            wx.setStorageSync('diaryList', newDiaryList);
            // 刷新列表
            this.setData({ diaryList: newDiaryList });
            wx.showToast({
              title: '删除成功',
              icon: 'none',
              duration: 1500
            });
          }
        }
      });
    }
  });