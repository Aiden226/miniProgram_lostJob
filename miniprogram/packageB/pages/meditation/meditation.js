Page({
  data: {
    audioList: [
      {
        id: 1,
        name: "森林雨声",
        url: "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3", // 免费测试音频
        cover: "https://picsum.photos/id/1019/300/300" // 森林相关图片（300x300像素）
      },
      {
        id: 2,
        name: "溪流鸟鸣",
        url: "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_2MB_MP3.mp3",
        cover: "https://picsum.photos/id/1025/300/300" // 自然溪流图片
      },
      {
        id: 3,
        name: "空灵禅音",
        url: "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_5MB_MP3.mp3",
        cover: "https://picsum.photos/id/1035/300/300" // 禅意相关图片
      }
    ],
    currentIndex: 0,  // 当前播放音频的索引
    currentAudio: {},  // 当前播放音频的信息
    isPlaying: false,  // 是否正在播放
    currentTime: 0,    // 当前播放进度（秒）
    duration: 0,       // 音频总时长（秒）
    isDragging: false  // 是否正在拖动进度条（避免拖动时进度跳动）
  },

  // 页面加载时初始化
  onLoad() {
    // 初始化当前播放音频
    const { audioList } = this.data;
    this.setData({ currentAudio: audioList[0] });
    // 创建音频实例（全局唯一，避免重复创建）
    this.innerAudioContext = wx.createInnerAudioContext();
    // 绑定音频事件监听
    this.bindAudioEvents();
  },

  // 绑定音频相关事件
  bindAudioEvents() {
    const { innerAudioContext } = this;

    // 音频加载完成：获取总时长
    innerAudioContext.onCanplay(() => {
      setTimeout(() => {  // 延迟获取，确保duration已更新
        this.setData({ duration: innerAudioContext.duration });
      }, 100);
    });

    // 播放进度更新：实时更新当前进度（拖动时不更新）
    innerAudioContext.onTimeUpdate(() => {
      if (!this.data.isDragging) {
        this.setData({ currentTime: innerAudioContext.currentTime });
      }
    });

    // 音频播放结束：自动播放下一曲
    innerAudioContext.onEnded(() => {
      this.playNext();
    });

    // 音频播放错误：提示用户
    innerAudioContext.onError((err) => {
      wx.showToast({ title: `播放失败：${err.errMsg}`, icon: "none" });
    });
  },

  // 切换播放/暂停
  togglePlay() {
    const { isPlaying, currentAudio } = this.data;
    const { innerAudioContext } = this;

    if (isPlaying) {
      // 暂停播放
      innerAudioContext.pause();
    } else {
      // 开始播放（设置音频路径，避免切换曲目后路径未更新）
      innerAudioContext.src = currentAudio.url;
      innerAudioContext.play();
    }

    this.setData({ isPlaying: !isPlaying });
  },

  // 播放指定索引的音频
  playAudio(e) {
    const { index } = e.currentTarget.dataset;
    const { audioList } = this.data;

    // 如果点击的是当前正在播放的音频，切换暂停/播放
    if (index === this.data.currentIndex) {
      this.togglePlay();
      return;
    }

    // 切换到新音频
    this.setData({
      currentIndex: index,
      currentAudio: audioList[index],
      currentTime: 0  // 重置进度
    });

    // 播放新音频
    this.innerAudioContext.src = audioList[index].url;
    this.innerAudioContext.play();
    this.setData({ isPlaying: true });
  },

  // 播放上一曲
  playPrev() {
    let { currentIndex, audioList } = this.data;
    currentIndex = currentIndex === 0 ? audioList.length - 1 : currentIndex - 1;
    this.switchAudio(currentIndex);
  },

  // 播放下一曲
  playNext() {
    let { currentIndex, audioList } = this.data;
    currentIndex = currentIndex === audioList.length - 1 ? 0 : currentIndex + 1;
    this.switchAudio(currentIndex);
  },

  // 切换音频（通用方法）
  switchAudio(index) {
    const { audioList } = this.data;
    this.setData({
      currentIndex: index,
      currentAudio: audioList[index],
      currentTime: 0
    });
    this.innerAudioContext.src = audioList[index].url;
    this.innerAudioContext.play();
    this.setData({ isPlaying: true });
  },

  // 拖动进度条开始：标记为拖动中
  handleProgressTouchStart() {
    this.setData({ isDragging: true });
  },

  // 拖动进度条结束：更新播放进度
  handleProgressTouchEnd() {
    const { currentTime } = this.data;
    this.innerAudioContext.seek(currentTime);  // 跳转到指定进度
    this.setData({ isDragging: false });
  },

  // 拖动进度条过程：更新当前进度（仅UI展示）
  handleProgressChange(e) {
    this.setData({ currentTime: e.detail.value });
  },

  // 格式化时间：秒 → 分:秒（如 125 → 2:05）
  formatTime(second) {
    const min = Math.floor(second / 60);
    const sec = Math.floor(second % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  },

  // 页面卸载时：销毁音频实例，避免内存泄漏
  onUnload() {
    this.innerAudioContext.destroy();
  },

  // 页面隐藏时：暂停播放（可选，根据需求调整）
  onHide() {
    if (this.data.isPlaying) {
      this.innerAudioContext.pause();
      this.setData({ isPlaying: false });
    }
  }
});