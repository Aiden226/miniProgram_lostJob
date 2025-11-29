Page({
    data: {
      mdContent: '',    // 原始MD内容
      htmlContent: '',  // 转换后的HTML内容
      isEditMode: false // 是否编辑模式
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 检查基础库版本是否支持wx.parseMarkdown
      const systemInfo = wx.getSystemInfoSync();
      const SDKVersion = systemInfo.SDKVersion;
      const [major, minor] = SDKVersion.split('.').map(Number);
      if (major < 2 || (major === 2 && minor < 21)) {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，不支持MD预览功能，请升级微信至最新版本',
          showCancel: false
        });
      }
      console.log('当前基础库版本：', systemInfo.SDKVersion)
    },

   
  
    /**
     * 选择MD文件
     */
    chooseMdFile() {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.md'], // 仅允许选择MD文件
        success: (res) => {
          const file = res.tempFiles[0];
          // 校验文件后缀（二次兜底）
          if (!file.name.endsWith('.md')) {
            wx.showToast({ title: '请选择.md格式文件', icon: 'none' });
            return;
          }
          this.readMdFile(file.path);
        },
        fail: (err) => {
          wx.showToast({ title: '选择文件失败', icon: 'none' });
          console.error('选择文件失败：', err);
        }
      });
    },
  
    /**
     * 读取MD文件内容
     * @param {string} filePath 文件路径
     */
    readMdFile(filePath) {
      wx.showLoading({ title: '加载文件中...' });
      wx.getFileSystemManager().readFile({
        filePath,
        encoding: 'utf8',
        success: (res) => {
          const mdContent = res.data;
          this.setData({ mdContent });
          // 转换MD为HTML
          this.convertMdToHtml(mdContent);
          wx.hideLoading();
          wx.showToast({ title: '文件加载成功', icon: 'success' });
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '读取文件失败', icon: 'none' });
          console.error('读取文件失败：', err);
        }
      });
    },
  
    /**
     * 将MD内容转换为HTML（原生API）
     * @param {string} mdContent MD原始内容
     */
    convertMdToHtml(mdContent) {
    console.log('全局wx对象：', wx); // 正常应为{ parseMarkdown: ƒ, chooseMessageFile: ƒ ... }
    console.log('是否存在parseMarkdown：', !!wx.parseMarkdown); 
      if (!mdContent) {
        this.setData({ htmlContent: '' });
        return;
      }
      try {
        // 原生MD转HTML
        const htmlContent = wx.parseMarkdown({
          content: mdContent,
          options: {
            highlight: true, // 开启代码高亮
            enableToc: false // 关闭目录生成
          }
        });
        this.setData({ htmlContent });
      } catch (err) {
        // 打印完整错误信息（关键！）
        console.error('MD解析失败详情：', err); 
        // 错误信息包含：err.message（错误描述）、err.stack（错误栈）
        wx.showToast({ 
          title: `解析失败：${err.message || '未知错误'}`, 
          icon: 'none',
          duration: 3000
        });
      }
    },
  
    /**
     * 切换预览/编辑模式
     * @param {object} e 事件对象
     */
    switchMode(e) {
      const isEditMode = e.detail.value;
      this.setData({ isEditMode });
      // 切换到预览模式时，重新转换MD为HTML（同步编辑后的内容）
      if (!isEditMode) {
        this.convertMdToHtml(this.data.mdContent);
      }
    },
  
    /**
     * 编辑MD内容
     * @param {object} e 事件对象
     */
    onMdContentChange(e) {
      this.setData({ mdContent: e.detail.value });
    },
  
    /**
     * 可选：保存编辑后的MD文件
     * 可添加到页面菜单或按钮事件中
     */
    saveMdFile() {
      if (!this.data.mdContent) {
        wx.showToast({ title: '暂无内容可保存', icon: 'none' });
        return;
      }
      // 创建临时文件
      const tempFilePath = `${wx.env.USER_DATA_PATH}/edit_${Date.now()}.md`;
      wx.getFileSystemManager().writeFile({
        filePath: tempFilePath,
        data: this.data.mdContent,
        encoding: 'utf8',
        success: () => {
          // 保存到手机
          wx.saveFileToDisk({
            filePath: tempFilePath,
            success: () => {
              wx.showToast({ title: '文件保存成功', icon: 'success' });
            },
            fail: (err) => {
              wx.showToast({ title: '保存到手机失败', icon: 'none' });
              console.error(err);
            }
          });
        },
        fail: (err) => {
          wx.showToast({ title: '创建文件失败', icon: 'none' });
          console.error(err);
        }
      });
    }
  });