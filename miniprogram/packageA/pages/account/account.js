Page({
  data: {
    currentTab: 'record', // 当前选中标签：record-记账，history-历史
    currentDate: '', // 记账当前日期
    selectedMonth: '', // 历史记录选中月份
    typeList: ['餐饮', '交通', '购物', '娱乐', '住房', '通讯', '医疗', '其他'], // 消费类型
    typeIndex: 0, // 选中的消费类型索引
    typeColor: { // 不同类型对应的颜色
      '餐饮': '#ff7a7a',
      '交通': '#7a9cff',
      '购物': '#7affa8',
      '娱乐': '#ffd67a',
      '住房': '#d67aff',
      '通讯': '#7ad6ff',
      '医疗': '#ff7ad6',
      '其他': '#8baa92'
    },
    amount: '', // 消费金额
    remark: '', // 备注
    records: [], // 所有记账记录
    filteredRecords: [], // 筛选后的记录（按月份）
    totalAmount: 0 // 选中月份总消费
  },

  onLoad() {
    // 初始化日期
    const now = new Date();
    const currentDate = this.formatDate(now);
    const selectedMonth = this.formatMonth(now);
    
    this.setData({
      currentDate,
      selectedMonth
    });

    // 从storage加载历史记录
    this.loadRecords();
  },

  // 格式化日期为 yyyy-MM-dd
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化月份为 yyyy-MM
  formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  // 切换标签（记账/历史）
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    }, () => {
      // 切换到历史标签时，重新筛选当月记录
      if (tab === 'history') {
        this.filterRecordsByMonth();
      }
    });
  },

  // 日期选择器改变
  bindDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
  },

  // 月份选择器改变
  bindMonthChange(e) {
    this.setData({
      selectedMonth: e.detail.value
    }, () => {
      this.filterRecordsByMonth();
    });
  },

  // 消费类型选择改变
  bindTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    });
  },

  // 金额输入
  onAmountInput(e) {
    // 只允许输入数字和小数点
    const value = e.detail.value.replace(/[^0-9.]/g, '');
    // 限制只能有一个小数点
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1 && value.indexOf('.', dotIndex + 1) !== -1) {
      return;
    }
    // 限制小数点后最多两位
    if (dotIndex !== -1 && value.length - dotIndex > 3) {
      return;
    }
    this.setData({
      amount: value
    });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 保存记账记录
  saveRecord() {
    const { currentDate, typeList, typeIndex, amount, remark, records } = this.data;

    // 验证金额
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 构建记录对象
    const newRecord = {
      id: Date.now(), // 用时间戳作为唯一ID
      date: currentDate,
      type: typeList[typeIndex],
      amount: parseFloat(amount),
      remark: remark.trim()
    };

    // 更新记录列表
    const newRecords = [...records, newRecord];

    // 保存到storage和页面数据
    wx.setStorageSync('accountRecords', newRecords);
    this.setData({
      records: newRecords,
      amount: '',
      remark: '',
      typeIndex: 0
    });

    wx.showToast({
      title: '记账成功',
      icon: 'success',
      duration: 1500
    });
  },

  // 从storage加载记录
  loadRecords() {
    const records = wx.getStorageSync('accountRecords') || [];
    this.setData({
      records
    }, () => {
      // 初始化时筛选当月记录
      this.filterRecordsByMonth();
    });
  },

  // 按月份筛选记录
  filterRecordsByMonth() {
    const { records, selectedMonth } = this.data;
    // 筛选出当月的记录
    const filteredRecords = records.filter(record => {
      return record.date.startsWith(selectedMonth);
    });
    // 计算当月总金额
    const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
    this.setData({
      filteredRecords,
      totalAmount
    });
  }
});