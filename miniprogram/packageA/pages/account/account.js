Page({
    data: {
        currentDate: '', // 格式：YYYY-MM-DD
        amount: '',      // 金额
        type: 'expense', // 类型：expense(支出)/income(收入)
        remark: '',      // 备注
        todayRecords: [], // 今日记录列表
        showTypeDialog: false, // 类型选择弹窗显示状态
        totalExpense: '0.00',  // 今日总支出
        totalIncome: '0.00',   // 今日总收入

        // 消费类型列表（十六宫格）
        typeList: [
            { id: 1, name: '餐饮', icon: '/images/types/food.png', type: 'expense' },
            { id: 2, name: '交通', icon: '/images/types/traffic.png', type: 'expense' },
            { id: 3, name: '购物', icon: '/images/types/shopping.png', type: 'expense' },
            { id: 4, name: '住房', icon: '/images/types/housing.png', type: 'expense' },
            { id: 5, name: '娱乐', icon: '/images/types/entertainment.png', type: 'expense' },
            { id: 6, name: '医疗', icon: '/images/types/medical.png', type: 'expense' },
            { id: 7, name: '教育', icon: '/images/types/education.png', type: 'expense' },
            { id: 8, name: '其他', icon: '/images/types/other.png', type: 'expense' },
            { id: 9, name: '工资', icon: '/images/types/salary.png', type: 'income' },
            { id: 10, name: '奖金', icon: '/images/types/bonus.png', type: 'income' },
            { id: 11, name: '理财', icon: '/images/types/finance.png', type: 'income' },
            { id: 12, name: '红包', icon: '/images/types/redpacket.png', type: 'income' },
            { id: 13, name: '兼职', icon: '/images/types/parttime.png', type: 'income' },
            { id: 14, name: '退款', icon: '/images/types/refund.png', type: 'income' },
            { id: 15, name: '投资', icon: '/images/types/invest.png', type: 'income' },
            { id: 16, name: '其他', icon: '/images/types/other-income.png', type: 'income' }
        ],
        selectedType: { id: 1, name: '餐饮', icon: '/images/types/food.png' } // 默认选中类型
    },

    onLoad() {
        // 初始化日期为当天
        const today = this.formatDate(new Date());
        this.setData({ currentDate: today });

        // 加载今日记录
        this.loadTodayRecords();
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 格式化时间为 HH:MM
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    // 打开日期选择器
    onDateChange(e) {
        this.setData({ currentDate: e.detail.value });
    },

    // 日期变更
    onDateChange(e) {
        this.setData({ currentDate: e.detail.value });
        this.loadTodayRecords(); // 重新加载选中日期的记录
    },

    // 加载选中日期的记录
    loadTodayRecords() {
        const date = this.data.currentDate;
        const allRecords = wx.getStorageSync('accountRecords') || {};
        const todayRecords = allRecords[date] || [];

        // 计算当日收支统计
        let totalExpense = 0;
        let totalIncome = 0;
        todayRecords.forEach(record => {
            const amount = Number(record.amount);
            if (record.type === 'expense') {
                totalExpense += amount;
            } else {
                totalIncome += amount;
            }
        });

        this.setData({
            todayRecords,
            totalExpense: totalExpense.toFixed(2),
            totalIncome: totalIncome.toFixed(2)
        });
    },

    // 金额输入
    onAmountInput(e) {
        // 限制只能输入数字和小数点，且最多两位小数
        let value = e.detail.value;
        value = value.replace(/[^\d.]/g, ''); // 清除非数字和小数点
        value = value.replace(/^\./g, ''); // 清除开头的小数点
        value = value.replace(/\.{2,}/g, '.'); // 只保留一个小数点
        value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
        value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 限制两位小数
        this.setData({ amount: value });
    },

    // 备注输入
    onRemarkInput(e) {
        this.setData({ remark: e.detail.value });
    },

    // 设置收支类型
    setType(e) {
        const type = e.currentTarget.dataset.type;
        this.setData({ type });

        // 自动切换类型列表默认选中项
        const defaultType = type === 'expense'
            ? this.data.typeList[0]
            : this.data.typeList[8];
        this.setData({ selectedType: defaultType });
    },

    // 打开类型选择弹窗
    openTypeDialog() {
        this.setData({ showTypeDialog: true });
    },

    // 关闭类型选择弹窗
    closeTypeDialog() {
        this.setData({ showTypeDialog: false });
    },

    // 选择消费类型
    selectType(e) {
        const selected = e.currentTarget.dataset.item;
        this.setData({
            selectedType: selected,
            type: selected.type, // 自动同步收支类型
            showTypeDialog: false
        });
    },

    // 添加记录
    addRecord() {
        const { amount, type, remark, currentDate, todayRecords, selectedType } = this.data;

        // 验证金额
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            wx.showToast({ title: '请输入有效金额', icon: 'none' });
            return;
        }

        // 创建新记录
        const newRecord = {
            amount: Number(amount).toFixed(2), // 保留两位小数
            type,
            typeInfo: selectedType, // 保存类型信息（含图标和名称）
            remark: remark.trim() || selectedType.name, // 备注为空时用类型名
            time: this.formatTime(new Date())
        };

        // 更新存储
        const allRecords = wx.getStorageSync('accountRecords') || {};
        allRecords[currentDate] = [...todayRecords, newRecord];
        wx.setStorageSync('accountRecords', allRecords);

        // 更新页面
        this.setData({
            amount: '',
            remark: '',
            todayRecords: allRecords[currentDate]
        });

        // 重新计算统计
        this.loadTodayRecords();
        wx.showToast({ title: '记录添加成功' });
    },

    // 删除记录
    deleteRecord(e) {
        const { index } = e.currentTarget.dataset;
        const { currentDate, todayRecords } = this.data;

        // 删除对应记录
        const updatedRecords = todayRecords.filter((_, i) => i !== index);

        // 更新存储
        const allRecords = wx.getStorageSync('accountRecords') || {};
        allRecords[currentDate] = updatedRecords;
        wx.setStorageSync('accountRecords', allRecords);

        // 更新页面和统计
        this.setData({ todayRecords: updatedRecords });
        this.loadTodayRecords();
    },

    // 跳转到历史页面
    goToHistory() {
        wx.navigateTo({ url: '/packageA/pages/account-history/account-history' });
    }
});