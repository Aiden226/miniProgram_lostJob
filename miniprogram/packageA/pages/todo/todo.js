Page({
    data: {
      inputValue: '',
      todoList: [],
      currentDate: '' // 格式：YYYY-MM-DD
    },
  
    onLoad() {
      // 初始化日期
      const today = this.formatDate(new Date());
      this.setData({ currentDate: today });
      
      // 加载今日任务
      this.loadTodayTodos();
    },
  
    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  
    // 加载今日任务
    loadTodayTodos() {
      const today = this.data.currentDate;
      const allHistory = wx.getStorageSync('todoHistory') || {};
      this.setData({
        todoList: allHistory[today] || []
      });
    },
  
    // 输入框变化
    onInput(e) {
      this.setData({ inputValue: e.detail.value.trim() });
    },
  
    // 添加任务
    addTodo() {
      const { inputValue, todoList, currentDate } = this.data;
      if (!inputValue) {
        wx.showToast({ title: '请输入任务内容', icon: 'none' });
        return;
      }
  
      // 新增任务
      const newTodo = { content: inputValue, completed: false };
      const updatedList = [...todoList, newTodo];
      
      // 更新本地存储
      const allHistory = wx.getStorageSync('todoHistory') || {};
      allHistory[currentDate] = updatedList;
      wx.setStorageSync('todoHistory', allHistory);
      
      // 更新页面
      this.setData({
        todoList: updatedList,
        inputValue: ''
      });
    },
  
    // 切换完成状态
    toggleComplete(e) {
      const { index } = e.currentTarget.dataset;
      const { todoList, currentDate } = this.data;
      
      todoList[index].completed = !todoList[index].completed;
      const allHistory = wx.getStorageSync('todoHistory') || {};
      allHistory[currentDate] = todoList;
      wx.setStorageSync('todoHistory', allHistory);
      
      this.setData({ todoList });
    },
  
    // 删除任务
    deleteTodo(e) {
      const { index } = e.currentTarget.dataset;
      const { todoList, currentDate } = this.data;
      
      const updatedList = todoList.filter((_, i) => i !== index);
      const allHistory = wx.getStorageSync('todoHistory') || {};
      allHistory[currentDate] = updatedList;
      wx.setStorageSync('todoHistory', allHistory);
      
      this.setData({ todoList: updatedList });
    },
  
    // 跳转到历史页面
    goToHistory() {
      wx.navigateTo({ url: '/packageA/pages/history/history' });
    }
  });