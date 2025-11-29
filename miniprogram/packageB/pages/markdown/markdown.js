Page({
  data: {
    isPreviewMode: true,    // 默认预览模式
    mdContent: '',          // Markdown 原始内容
    renderedHtml: '',       // 解析后的 HTML
    selectedFile: null,     // 已选择的文件信息
    isLoading: false        // 加载状态
  },

  onLoad() {
    // 初始化 Markdown 解析器（使用全局挂载的 marked，无需 import）
    if (!wx.marked) {
      wx.showToast({
        title: 'Markdown 解析库加载失败',
        icon: 'none',
        duration: 2000
      });
    } else {
      // 配置 marked 解析选项
      wx.marked.setOptions({
        breaks: true,        // 支持换行
        gfm: true,           // 支持 GitHub 风格 Markdown
        tables: true,        // 支持表格
        emoji: true,         // 支持表情
        sanitize: false,     // 允许 HTML 标签
        highlight: (code, lang) => {
          // 代码高亮优化
          const langClass = lang ? `language-${lang}` : '';
          return `<pre class="code-block"><code class="${langClass}">${wx.marked.escape(code)}</code></pre>`;
        }
      });
    }
  },

  /**
   * 切换预览/编辑模式
   */
  toggleMode(e) {
    const isPreviewMode = e.detail.value;
    this.setData({ isPreviewMode });
    
    // 切换到预览模式时重新解析（防止编辑后未同步）
    if (isPreviewMode && this.data.mdContent && wx.marked) {
      this.renderMarkdown(this.data.mdContent);
    }
  },

  /**
   * 选择 Markdown 文件
   */
  chooseMdFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['.md'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({ 
          selectedFile: file,
          isLoading: true    // 显示加载状态
        });
        this.readMdFile(file.path);
      },
      fail: (err) => {
        wx.showToast({
          title: '文件选择失败',
          icon: 'none',
          duration: 1500
        });
        console.error('文件选择失败：', err);
      }
    });
  },

  /**
   * 读取 Markdown 文件内容
   */
  readMdFile(filePath) {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'utf-8',
      success: (res) => {
        const mdContent = res.data;
        this.setData({ mdContent });
        console.log('wx.marked 是否存在：', !!wx.marked);
        console.log('marked.parse 是否为函数：', typeof wx.marked?.parse === 'function');
        // 解析 Markdown
        if (wx.marked) {
          this.renderMarkdown(mdContent);
        } else {
          wx.showToast({
            title: '无法解析 Markdown',
            icon: 'none',
            duration: 1500
          });
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.showToast({
          title: '文件读取失败',
          icon: 'none',
          duration: 1500
        });
        console.error('文件读取失败：', err);
      }
    });
  },

  /**
   * 渲染 Markdown 为 HTML
   */
  renderMarkdown(mdContent) {
    try {
      const renderedHtml = wx.marked.parse(mdContent);
      this.setData({ 
        renderedHtml,
        isLoading: false     // 隐藏加载状态
      });
    } catch (err) {
      this.setData({ isLoading: false });
      wx.showToast({
        title: 'Markdown 解析失败',
        icon: 'none',
        duration: 1500
      });
      console.error('Markdown 解析失败：', err);
    }
  },

  /**
   * 编辑模式内容变化监听
   */
  handleInput(e) {
    const mdContent = e.detail.value;
    this.setData({ mdContent });
    
    // 实时预览（节流处理，避免频繁解析）
    if (this.data.isPreviewMode && wx.marked) {
      this.debounceRender(mdContent);
    }
  },

  /**
   * 防抖函数：避免实时编辑时频繁解析
   */
  debounceRender: (function() {
    let timer = null;
    return function(content) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.renderMarkdown(content);
      }, 300); // 300ms 防抖延迟
    };
  })(),

  /**
   * 格式化文件大小
   */
  formatFileSize(size) {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
});