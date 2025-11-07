Page({
    data: {
      historyList: [] // 格式：[{
      //   date: '2025-11-07',
      //   records: [...], 
      //   totalExpense: '0.00', 
      //   totalIncome: '0.00', 
      //   balance: '0.00'
      // }, ...]
    },
  
    onLoad() {
      this.loadHistoryRecords();
    },
  
    onShow() {
      // 每次页面显示时重新加载数据（确保新增记录能实时显示）
      this.loadHistoryRecords();
    },
  
    // 加载历史记录并计算每日统计数据
    loadHistoryRecords() {
      // 从本地缓存获取所有记账记录
      const allRecords = wx.getStorageSync('accountRecords') || {};
      const historyList = [];
  
      // 遍历所有日期的记录
      Object.keys(allRecords).forEach(date => {
        const records = allRecords[date];
        // 跳过空记录的日期
        if (!records || records.length === 0) return;
  
        // 计算当日总支出、总收入和结余
        let totalExpense = 0;
        let totalIncome = 0;
  
        records.forEach(record => {
          const amount = Number(record.amount);
          if (record.type === 'expense') {
            totalExpense += amount; // 累加支出
          } else {
            totalIncome += amount; // 累加收入
          }
        });
  
        // 保留两位小数并格式化
        totalExpense = totalExpense.toFixed(2);
        totalIncome = totalIncome.toFixed(2);
        const balance = (Number(totalIncome) - Number(totalExpense)).toFixed(2);
  
        // 添加到历史列表
        historyList.push({
          date,
          records,
          totalExpense,
          totalIncome,
          balance
        });
      });
  
      // 按日期倒序排列（最新的日期显示在最前面）
      historyList.sort((a, b) => new Date(b.date) - new Date(a.date));
  
      // 更新页面数据
      this.setData({ historyList });
    }
  });