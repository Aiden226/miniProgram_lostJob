Page({
    data: {
      historyList: [] // 格式：[{date: '2023-10-01', tasks: [...]}, ...]
    },
  
    onLoad() {
      this.loadHistory();
    },
  
    // 加载历史记录并按日期倒序排列
    loadHistory() {
      const allHistory = wx.getStorageSync('todoHistory') || {};
      const historyList = [];
      
      // 转换为数组并排序（最新日期在前）
      Object.keys(allHistory).forEach(date => {
        // 过滤空任务列表
        if (allHistory[date].length > 0) {
          historyList.push({
            date,
            tasks: allHistory[date]
          });
        }
      });
      
      // 按日期倒序排列
      historyList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.setData({ historyList });
    }
  });