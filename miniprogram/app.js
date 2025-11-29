// app.js
import marked from './utils/marked.umd.min.js';
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: ""
    };
    // 方式 1：用 require 引入（推荐，小程序原生支持）
    try {
      const marked = require('./utils/marked.umd.min.js');
      // 验证 marked 是否有效
      if (marked && typeof marked.parse === 'function') {
        wx.marked = marked; // 全局挂载
        console.log('marked 全局挂载成功', marked.version); // 输出版本号，确认成功
      } else {
        console.error('marked 引入失败：文件格式错误');
        wx.showToast({
          title: 'Markdown 库格式错误',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('marked 挂载失败：', err);
      wx.showToast({
        title: 'Markdown 库加载失败',
        icon: 'none'
      });
    }

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
});