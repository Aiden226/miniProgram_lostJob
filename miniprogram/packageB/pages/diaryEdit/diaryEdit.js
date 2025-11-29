Page({
    data: {
      title: '', // 日记标题
      content: '', // 日记正文
      contentLength: 0, // 正文字数统计
      draftKey: 'diaryDraft_' + Date.now() // 草稿唯一标识（页面加载时生成）
    },
  
    onLoad() {
      // 页面加载时读取草稿（如果有）
      this.loadDraft();
    },
  
    onUnload() {
      // 页面卸载时保存草稿（标题或正文不为空时）
      const { title, content, draftKey } = this.data;
      if (title.trim() || content.trim()) {
        const draft = { title, content };
        wx.setStorageSync(draftKey, draft);
      }
    },
  
    // 读取草稿
    loadDraft() {
      const { draftKey } = this.data;
      const draft = wx.getStorageSync(draftKey);
      if (draft) {
        this.setData({
          title: draft.title,
          content: draft.content,
          contentLength: draft.content.length
        });
      }
    },
  
    // 监听标题输入
    onTitleInput(e) {
      this.setData({ title: e.detail.value });
      // 输入时自动保存草稿
      this.saveDraft();
    },
  
    // 监听正文输入（新增字数统计）
    onContentInput(e) {
      let content = e.detail.value;
      let contentLength = content.length;
      
      // 限制最多输入500个字符
      if (contentLength > 500) {
        content = content.substring(0, 500);
        contentLength = 500;
        // 只在首次超限时提示
        if (this.data.contentLength <= 500) {
          wx.showToast({
            title: '字数已达上限',
            icon: 'none',
            duration: 1500
          });
        }
      }
      
      this.setData({
        content,
        contentLength
      });
      // 输入时自动保存草稿
      this.saveDraft();
    },
  
    // 自动保存草稿（新增）
    saveDraft() {
      const { title, content, draftKey } = this.data;
      const draft = { title, content };
      wx.setStorageSync(draftKey, draft);
    },
  
    // 保存日记（优化：保存后清除草稿）
    saveDiary() {
      const { title, content, draftKey } = this.data;
  
      if (!title.trim()) {
        wx.showToast({
          title: '请输入日记标题',
          icon: 'none',
          duration: 1500
        });
        return;
      }
  
      // 生成当前时间
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const time = `${year}-${month}-${day} ${hour}:${minute}`;
  
      // 构造日记数据
      const newDiary = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        time: time
      };
  
      // 保存到日记列表
      const oldDiaryList = wx.getStorageSync('diaryList') || [];
      oldDiaryList.push(newDiary);
      wx.setStorageSync('diaryList', oldDiaryList);
  
      // 新增：保存成功后清除草稿
      wx.removeStorageSync(draftKey);
      this.setData({
        title: '', // 日记标题
        content: '', // 日记正文
        contentLength: 0, // 正文字数统计
        draftKey: null
      })
  
      // 提示并返回列表页
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  });
