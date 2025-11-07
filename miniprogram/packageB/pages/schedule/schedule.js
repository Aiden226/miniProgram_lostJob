Page({
    data: {
        // 日历数据
        currentYear: 0,
        currentMonth: 0,
        currentDay: 0,
        selectedDay: 0,
        selectedFullDate: '', // 格式：YYYY-MM-DD
        prevMonthDays: [], // 上月日期
        currentMonthDays: [], // 当月日期
        nextMonthDays: [], // 下月日期

        // 日程数据
        schedules: {}, // 存储格式：{ "2025-11-07": [{time: "09:00", content: "会议"}, ...], ... }
        selectedSchedules: [], // 选中日期的日程

        // 弹窗相关
        showAddModal: false,
        scheduleTime: '',
        scheduleContent: '',
        dayStatus: []
    },

    onLoad() {
        // 初始化日期为今天
        const today = new Date();
        this.setData({
            currentYear: today.getFullYear(),
            currentMonth: today.getMonth() + 1,
            currentDay: today.getDate(),
            selectedDay: today.getDate()
        });

        // // 初始化日历
        // this.initCalendar();
        // // 加载日程数据
        // this.loadSchedules();
        this.loadSchedules(() => {
            // 回调函数：确保数据加载后再执行日历初始化
            this.initCalendar();
        });
    },

    // 初始化日历
    initCalendar() {
        const { currentYear, currentMonth, selectedDay } = this.data;
        const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 当月第一天是星期几（0-6）
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // 当月总天数

        // 计算上月需要显示的日期
        const prevMonth = currentMonth - 1 < 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth - 1 < 1 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate(); // 上月总天数
        const prevMonthDays = [];
        for (let i = 0; i < firstDay; i++) {
            prevMonthDays.push(daysInPrevMonth - firstDay + i + 1);
        }

        // 当月日期
        const currentMonthDays = [];
        for (let i = 1; i <= daysInMonth; i++) {
            currentMonthDays.push(i);
        }

        // 计算下月需要显示的日期（补满6行）
        const totalDays = prevMonthDays.length + currentMonthDays.length;
        const nextMonthDays = [];
        for (let i = 1; i <= 42 - totalDays; i++) {
            nextMonthDays.push(i);
        }

        // 设置选中日期的完整格式
        const selectedFullDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

        // 关键：预处理当月日期的日程状态
        const dayStatus = [];
        currentMonthDays.forEach(day => {
            // 计算该日期是否有日程（在 JS 中直接调用方法）
            const hasSchedule = this.hasSchedule(currentYear, currentMonth, day);
            dayStatus.push({
                day: day,
                hasSchedule: hasSchedule
            });
        });
        this.setData({
            prevMonthDays,
            currentMonthDays,
            nextMonthDays,
            selectedFullDate,
            dayStatus
        }, () => {
            // 日历初始化完成后，更新红点状态
            this.updateDayStatus();
        });

        // 加载选中日期的日程
        this.loadSelectedSchedules();
    },

    // 切换到上月
    prevMonth() {
        let { currentYear, currentMonth } = this.data;
        if (currentMonth === 1) {
            currentMonth = 12;
            currentYear--;
        } else {
            currentMonth--;
        }
        this.setData({ currentYear, currentMonth });
        this.initCalendar();
    },

    // 切换到下月
    nextMonth() {
        let { currentYear, currentMonth } = this.data;
        if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
        } else {
            currentMonth++;
        }
        this.setData({ currentYear, currentMonth });
        this.initCalendar();
    },

    // 选择日期
    selectDate(e) {
        const selectedDay = e.currentTarget.dataset.day;
        this.setData({ selectedDay });
        this.initCalendar(); // 重新初始化日历以更新选中状态
    },

    // 加载所有日程（从本地缓存）
    loadSchedules(callback) {
        // 从本地缓存加载数据
        const schedules = wx.getStorageSync('schedules') || {};
        this.setData({ schedules }, () => {
            // 数据更新完成后执行回调（初始化日历）
            if (callback) callback();
        });
    },

    // 加载选中日期的日程
    loadSelectedSchedules() {
        const { schedules, selectedFullDate } = this.data;
        this.setData({
            selectedSchedules: schedules[selectedFullDate] || []
        });
    },

    // 检查日期是否有日程（用于显示红点）
    hasSchedule(year, month, day) {
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const date = `${year}-${formattedMonth}-${formattedDay}`;
        const { schedules } = this.data;
        return schedules[date] && schedules[date].length > 0;
    },
    updateDayStatus() {
        const { currentYear, currentMonth, currentMonthDays, schedules } = this.data;

        // 重新计算每个日期是否有日程
        const dayStatus = [];
        currentMonthDays.forEach(day => {
            const formattedMonth = String(currentMonth).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const date = `${currentYear}-${formattedMonth}-${formattedDay}`;
            const hasSchedule = schedules[date] && schedules[date].length > 0;
            dayStatus.push({ day, hasSchedule });
        });

        // 实时更新页面数据，触发红点渲染
        this.setData({ dayStatus });
    },
    // 打开添加行程弹窗
    addSchedule() {
        this.setData({
            showAddModal: true,
            scheduleTime: '',
            scheduleContent: ''
        });
    },

    // 关闭弹窗
    closeModal() {
        this.setData({ showAddModal: false });
    },

    // 时间输入变化
    onTimeChange(e) {
        this.setData({ scheduleTime: e.detail.value });
    },

    // 内容输入变化
    onContentChange(e) {
        this.setData({ scheduleContent: e.detail.value.trim() });
    },

    // 保存行程
    saveSchedule() {
        const { scheduleTime, scheduleContent, selectedFullDate, schedules, selectedSchedules } = this.data;

        // 验证输入
        if (!scheduleTime) {
            wx.showToast({ title: '请选择时间', icon: 'none' });
            return;
        }
        if (!scheduleContent) {
            wx.showToast({ title: '请输入行程内容', icon: 'none' });
            return;
        }

        // 新增行程
        const newSchedule = {
            time: scheduleTime,
            content: scheduleContent
        };

        // 更新日程数据
        const updatedSchedules = { ...schedules };
        if (updatedSchedules[selectedFullDate]) {
            updatedSchedules[selectedFullDate].push(newSchedule);
        } else {
            updatedSchedules[selectedFullDate] = [newSchedule];
        }

        // 按时间排序
        updatedSchedules[selectedFullDate].sort((a, b) => a.time.localeCompare(b.time));

        // 保存到本地缓存
        wx.setStorageSync('schedules', updatedSchedules);

        // 更新页面数据
        this.setData({
            schedules: updatedSchedules,
            selectedSchedules: updatedSchedules[selectedFullDate],
            showAddModal: false
        }, () => {
            // 数据更新完成后，调用红点更新方法
            this.updateDayStatus();
        });

        wx.showToast({ title: '添加成功' });
    },

    // 删除行程
    deleteSchedule(e) {
        const { index } = e.currentTarget.dataset;
        const { selectedFullDate, schedules, selectedSchedules } = this.data;

        // 删除对应行程
        const updatedSelected = [...selectedSchedules];
        updatedSelected.splice(index, 1);

        // 更新到所有日程中
        const updatedSchedules = { ...schedules };
        updatedSchedules[selectedFullDate] = updatedSelected;

        // 保存到本地缓存
        wx.setStorageSync('schedules', updatedSchedules);

        // 更新页面数据
        this.setData({
            schedules: updatedSchedules,
            selectedSchedules: updatedSelected
        }, () => {
            // 数据更新完成后，调用红点更新方法
            this.updateDayStatus();
        });

        wx.showToast({ title: '已删除' });
    },
});