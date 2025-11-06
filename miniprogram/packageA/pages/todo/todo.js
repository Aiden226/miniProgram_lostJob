Page({
  data: {
    inputValue: '', // 输入框内容
    todoList: [] // 任务列表
  },

  // 页面加载时读取缓存中的任务列表
  onLoad() {
    const savedTodos = wx.getStorageSync('todoList');
    if (savedTodos) {
      this.setData({
        todoList: savedTodos
      });
    }
  },

  // 监听输入框变化
  onInput(e) {
    this.setData({
      inputValue: e.detail.value.trim()
    });
  },

  // 添加新任务
  addTodo() {
    const { inputValue, todoList } = this.data;
    if (!inputValue) {
      wx.showToast({
        title: '请输入任务内容',
        icon: 'none'
      });
      return;
    }

    // 新增任务对象
    const newTodo = {
      content: inputValue,
      completed: false
    };

    // 更新任务列表并保存到缓存
    const newTodoList = [...todoList, newTodo];
    this.setData({
      todoList: newTodoList,
      inputValue: '' // 清空输入框
    });
    wx.setStorageSync('todoList', newTodoList);
  },

  // 切换任务完成状态
  toggleComplete(e) {
    const { index } = e.currentTarget.dataset;
    const { todoList } = this.data;
    
    // 切换completed状态
    todoList[index].completed = !todoList[index].completed;
    
    // 更新列表并保存缓存
    this.setData({ todoList });
    wx.setStorageSync('todoList', todoList);
  },

  // 删除任务
  deleteTodo(e) {
    const { index } = e.currentTarget.dataset;
    const { todoList } = this.data;
    
    // 删除对应索引的任务
    const newTodoList = todoList.filter((_, i) => i !== index);
    
    // 更新列表并保存缓存
    this.setData({ todoList: newTodoList });
    wx.setStorageSync('todoList', newTodoList);
  }
});