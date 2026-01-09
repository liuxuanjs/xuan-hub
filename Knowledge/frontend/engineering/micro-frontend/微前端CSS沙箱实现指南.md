# 微前端CSS沙箱实现指南

在微前端架构中，样式冲突是另一个令人头疼的问题。想象一下，主应用和子应用都有一个`.button`类，结果样式混在一起乱套了！CSS沙箱就是专门解决这个问题的。

## 🎯 什么是CSS沙箱？

CSS沙箱就像给每个应用的样式穿上"专属制服"，让它们只能在自己的"地盘"内生效，不会影响到其他应用。

**问题场景**：
```css
/* 主应用的样式 */
.button {
  background: blue;
  padding: 10px;
}

/* 子应用的样式 */  
.button {
  background: red;  /* ❌ 冲突了！会覆盖主应用 */
  border: none;
}
```

结果主应用的按钮也变成红色了！

## 🛠️ 两种主流解决方案

### 1. 命名空间隔离 - 最实用的方案

**原理**：给每个应用的CSS选择器都加上独特的前缀。

```javascript
/**
 * CSS命名空间隔离器
 */
class CSSNamespaceIsolator {
  constructor(appName) {
    this.appName = appName;
    this.namespace = `micro-app-${appName}`;  // 应用的专属前缀
    this.dynamicStyles = [];  // 记录动态添加的样式
    this.isActive = false;
  }

  // 激活样式隔离
  activate(container) {
    if (this.isActive) return;

    // 1. 给容器加上命名空间class
    container.classList.add(this.namespace);
    
    // 2. 开始监听新增的样式
    this.startWatching();
    
    this.isActive = true;
    console.log(`🎨 ${this.appName} CSS隔离已激活`);
  }

  // 停用样式隔离
  deactivate(container) {
    if (!this.isActive) return;

    // 1. 移除命名空间
    container.classList.remove(this.namespace);
    
    // 2. 清理动态样式
    this.cleanupStyles();
    
    // 3. 停止监听
    this.stopWatching();
    
    this.isActive = false;
    console.log(`🎨 ${this.appName} CSS隔离已停用`);
  }

  // 监听页面中新增的样式
  startWatching() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (this.isStyleNode(node)) {
            this.processNewStyle(node);
          }
        });
      });
    });

    // 监听head中的变化
    this.observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }

  // 停止监听
  stopWatching() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // 判断是否为样式节点
  isStyleNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && 
           (node.tagName === 'STYLE' || 
            (node.tagName === 'LINK' && node.rel === 'stylesheet'));
  }

  // 处理新的样式节点
  processNewStyle(styleNode) {
    // 标记这个样式属于当前应用
    styleNode.setAttribute('data-micro-app', this.appName);
    this.dynamicStyles.push(styleNode);

    if (styleNode.tagName === 'STYLE') {
      this.addNamespaceToStyle(styleNode);
    } else if (styleNode.tagName === 'LINK') {
      this.processLinkStyle(styleNode);
    }
  }

  // 为style标签添加命名空间
  addNamespaceToStyle(styleNode) {
    const originalCSS = styleNode.textContent;
    if (!originalCSS.trim()) return;

    const namespacedCSS = this.addNamespaceToCSS(originalCSS);
    styleNode.textContent = namespacedCSS;
    
    console.log(`✅ 已为 ${this.appName} 的样式添加命名空间`);
  }

  // 处理外部样式表
  async processLinkStyle(linkNode) {
    try {
      const response = await fetch(linkNode.href);
      const cssText = await response.text();
      
      // 创建新的style标签替代
      const styleNode = document.createElement('style');
      styleNode.setAttribute('data-micro-app', this.appName);
      styleNode.textContent = this.addNamespaceToCSS(cssText);
      
      // 替换原来的link标签
      linkNode.parentNode.insertBefore(styleNode, linkNode);
      linkNode.parentNode.removeChild(linkNode);
      
      console.log(`✅ 已处理外部样式表: ${linkNode.href}`);
    } catch (error) {
      console.warn(`⚠️ 处理外部样式表失败:`, error);
    }
  }

  // 核心方法：为CSS添加命名空间
  addNamespaceToCSS(cssText) {
    return cssText.replace(/([^{}]+)\s*\{/g, (match, selectors) => {
      // 跳过@规则（如@media, @keyframes等）
      if (selectors.trim().startsWith('@')) {
        return match;
      }

      // 处理多个选择器（逗号分隔）
      const processedSelectors = selectors
        .split(',')
        .map(selector => this.addNamespaceToSelector(selector.trim()))
        .join(', ');

      return `${processedSelectors} {`;
    });
  }

  // 为单个选择器添加命名空间
  addNamespaceToSelector(selector) {
    // 特殊处理html/body
    if (selector === 'html' || selector === 'body') {
      return `.${this.namespace}`;
    }

    if (selector.startsWith('html ') || selector.startsWith('body ')) {
      return selector.replace(/^(html|body)\s*/, `.${this.namespace} `);
    }

    // 如果已经包含命名空间，跳过
    if (selector.includes(`.${this.namespace}`)) {
      return selector;
    }

    // 普通选择器直接加前缀
    return `.${this.namespace} ${selector}`;
  }

  // 清理动态样式
  cleanupStyles() {
    console.log(`🧹 清理 ${this.appName} 的 ${this.dynamicStyles.length} 个样式`);
    
    this.dynamicStyles.forEach(styleNode => {
      if (styleNode && styleNode.parentNode) {
        styleNode.parentNode.removeChild(styleNode);
      }
    });
    
    this.dynamicStyles = [];
  }
}
```

**使用示例**：
```javascript
// 假设有个子应用容器
const appContainer = document.getElementById('child-app');

// 创建CSS隔离器
const cssIsolator = new CSSNamespaceIsolator('my-react-app');

// 激活隔离
cssIsolator.activate(appContainer);

// 现在子应用添加的样式会自动被处理
const style = document.createElement('style');
style.textContent = `
  .button { background: red; }
  .header { font-size: 24px; }
`;
document.head.appendChild(style);

// 实际生效的CSS变成：
// .micro-app-my-react-app .button { background: red; }
// .micro-app-my-react-app .header { font-size: 24px; }
```

**转换效果对比**：
```css
/* 原始CSS */
.button { background: red; }
.header .title { color: blue; }
body { margin: 0; }
@media (max-width: 768px) { .button { padding: 5px; } }

/* 转换后的CSS */
.micro-app-my-app .button { background: red; }
.micro-app-my-app .header .title { color: blue; }
.micro-app-my-app { margin: 0; }  /* body被替换为命名空间 */
@media (max-width: 768px) { .micro-app-my-app .button { padding: 5px; } }
```

### 2. Shadow DOM隔离 - 最彻底的方案

**原理**：使用浏览器原生的Shadow DOM技术，创建真正独立的样式空间。

```javascript
/**
 * Shadow DOM样式隔离器
 */
class ShadowDOMIsolator {
  constructor(appName) {
    this.appName = appName;
    this.shadowHost = null;  // Shadow DOM的宿主元素
    this.shadowRoot = null;  // Shadow DOM根节点
    this.isActive = false;
  }

  // 创建Shadow DOM
  create(container) {
    if (this.shadowRoot) {
      console.warn(`${this.appName} Shadow DOM已存在`);
      return this.shadowRoot;
    }

    try {
      // 1. 创建shadow host
      this.shadowHost = document.createElement('div');
      this.shadowHost.setAttribute('data-micro-app', this.appName);
      
      // 2. 创建shadow root（开放模式，便于调试）
      this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });
      
      // 3. 创建应用容器
      const appContainer = document.createElement('div');
      appContainer.id = 'app-root';
      appContainer.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
      `;
      
      this.shadowRoot.appendChild(appContainer);
      container.appendChild(this.shadowHost);
      
      console.log(`🌟 ${this.appName} Shadow DOM创建成功`);
      return this.shadowRoot;
    } catch (error) {
      console.error(`❌ ${this.appName} Shadow DOM创建失败:`, error);
      throw error;
    }
  }

  // 激活Shadow DOM隔离
  activate() {
    this.isActive = true;
    console.log(`🟢 ${this.appName} Shadow DOM隔离已激活`);
  }

  // 停用Shadow DOM隔离
  deactivate() {
    this.isActive = false;
    console.log(`🔴 ${this.appName} Shadow DOM隔离已停用`);
  }

  // 向Shadow DOM添加样式
  addStyle(cssText) {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);
    
    console.log(`📝 已添加样式到 ${this.appName} Shadow DOM`);
  }

  // 添加外部样式表
  addStylesheet(href) {
    if (!this.shadowRoot) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    this.shadowRoot.appendChild(link);
    
    console.log(`🔗 已添加样式表到 ${this.appName} Shadow DOM: ${href}`);
  }

  // 获取应用容器
  getContainer() {
    return this.shadowRoot ? this.shadowRoot.querySelector('#app-root') : null;
  }

  // 销毁Shadow DOM
  destroy() {
    if (this.shadowHost && this.shadowHost.parentNode) {
      this.shadowHost.parentNode.removeChild(this.shadowHost);
    }
    
    this.shadowHost = null;
    this.shadowRoot = null;
    this.isActive = false;
    
    console.log(`🗑️ ${this.appName} Shadow DOM已销毁`);
  }
}
```

**使用示例**：
```javascript
// 创建Shadow DOM隔离器
const shadowIsolator = new ShadowDOMIsolator('secure-app');

// 在主容器中创建Shadow DOM
const mainContainer = document.getElementById('main-container');
const shadowRoot = shadowIsolator.create(mainContainer);

// 激活隔离
shadowIsolator.activate();

// 添加样式（完全隔离，不会影响外部）
shadowIsolator.addStyle(`
  .button {
    background: red;
    border: none;
    padding: 10px 20px;
  }
  
  .header {
    background: blue;
    color: white;
    padding: 20px;
  }
`);

// 添加外部样式表
shadowIsolator.addStylesheet('/assets/app-styles.css');

// 获取应用容器，在其中渲染应用
const appContainer = shadowIsolator.getContainer();
appContainer.innerHTML = `
  <div class="header">我是隔离的标题</div>
  <button class="button">我是隔离的按钮</button>
`;
```

## 🚀 完整的CSS隔离管理器

结合两种方案，创建一个灵活的CSS隔离管理器：

```javascript
/**
 * 完整的CSS隔离管理器
 */
class CSSIsolationManager {
  constructor(appName, options = {}) {
    this.appName = appName;
    this.options = {
      mode: 'namespace',  // 'namespace' | 'shadow'
      autoCleanup: true,
      enableWarnings: true,
      ...options
    };
    
    this.container = null;
    this.isolator = null;
    this.isActive = false;
    
    this.initializeIsolator();
  }

  // 初始化隔离器
  initializeIsolator() {
    if (this.options.mode === 'shadow') {
      this.isolator = new ShadowDOMIsolator(this.appName);
    } else {
      this.isolator = new CSSNamespaceIsolator(this.appName);
    }
    
    console.log(`🎨 ${this.appName} CSS隔离器初始化完成 (${this.options.mode}模式)`);
  }

  // 设置容器并激活隔离
  activate(container) {
    if (this.isActive) return;
    
    this.container = container;
    
    if (this.options.mode === 'shadow') {
      this.isolator.create(container);
      this.isolator.activate();
    } else {
      this.isolator.activate(container);
    }
    
    this.isActive = true;
    console.log(`🟢 ${this.appName} CSS隔离已激活`);
  }

  // 停用隔离
  deactivate() {
    if (!this.isActive) return;
    
    if (this.options.mode === 'shadow') {
      this.isolator.deactivate();
    } else {
      this.isolator.deactivate(this.container);
    }
    
    this.isActive = false;
    console.log(`🔴 ${this.appName} CSS隔离已停用`);
  }

  // 添加样式
  addStyle(cssText) {
    if (this.isolator && this.isolator.addStyle) {
      this.isolator.addStyle(cssText);
    }
  }

  // 添加样式表
  addStylesheet(href) {
    if (this.isolator && this.isolator.addStylesheet) {
      this.isolator.addStylesheet(href);
    }
  }

  // 获取应用容器
  getContainer() {
    if (this.options.mode === 'shadow') {
      return this.isolator.getContainer();
    }
    return this.container;
  }

  // 销毁隔离器
  destroy() {
    this.deactivate();
    
    if (this.isolator && this.isolator.destroy) {
      this.isolator.destroy();
    }
    
    this.isolator = null;
    this.container = null;
    
    console.log(`🗑️ ${this.appName} CSS隔离器已销毁`);
  }

  // 获取状态信息
  getStatus() {
    return {
      appName: this.appName,
      mode: this.options.mode,
      isActive: this.isActive,
      hasContainer: !!this.container,
      isolatorStatus: this.isolator ? this.isolator.getStatus?.() : null
    };
  }
}
```

## 📊 两种方案对比

| 特性 | 命名空间隔离 | Shadow DOM隔离 |
|------|-------------|----------------|
| **兼容性** | ✅ 所有浏览器 | ⚠️ 现代浏览器 |
| **隔离效果** | ⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 完美 |
| **性能** | ⭐⭐⭐⭐ 较好 | ⭐⭐⭐ 一般 |
| **调试难度** | ⭐⭐ 容易 | ⭐⭐⭐⭐ 困难 |
| **实现复杂度** | ⭐⭐⭐ 中等 | ⭐⭐ 简单 |
| **第三方组件** | ⭐⭐⭐ 支持 | ⭐⭐ 有限制 |

## 🎯 实际应用场景

### 场景1：电商平台多店铺装修
```javascript
// 每个店铺有自己的装修风格，不能相互影响
const shopAIsolator = new CSSIsolationManager('shop-a', { mode: 'namespace' });
const shopBIsolator = new CSSIsolationManager('shop-b', { mode: 'namespace' });

// 激活各自的样式隔离
shopAIsolator.activate(document.getElementById('shop-a-container'));
shopBIsolator.activate(document.getElementById('shop-b-container'));

// 店铺A的红色按钮
shopAIsolator.addStyle('.button { background: red; }');

// 店铺B的蓝色按钮
shopBIsolator.addStyle('.button { background: blue; }');

// 两个店铺的按钮样式完全独立！
```

### 场景2：安全要求高的金融应用
```javascript
// 金融应用需要最高级别的隔离
const secureApp = new CSSIsolationManager('trading-app', { 
  mode: 'shadow',
  autoCleanup: true 
});

secureApp.activate(document.getElementById('secure-container'));

// 即使有恶意代码尝试修改样式，也无法影响主应用
secureApp.addStyle(`
  .sensitive-data { color: red; background: yellow; }
  /* 这些样式完全无法影响到Shadow DOM外部 */
`);
```

### 场景3：组件库样式冲突解决
```javascript
// 解决不同版本组件库的样式冲突
class ComponentLibraryIsolator {
  constructor() {
    this.isolators = new Map();
  }
  
  // 为每个组件库创建独立的隔离环境
  registerLibrary(libName, version) {
    const isolator = new CSSIsolationManager(`${libName}-${version}`, {
      mode: 'namespace'
    });
    
    this.isolators.set(libName, isolator);
    return isolator;
  }
  
  // 使用特定版本的组件库
  useLibrary(libName, container) {
    const isolator = this.isolators.get(libName);
    if (isolator) {
      isolator.activate(container);
      return isolator.getContainer();
    }
  }
}

// 使用示例
const libManager = new ComponentLibraryIsolator();

// 注册Ant Design 4.x
const antd4 = libManager.registerLibrary('antd', '4.x');
antd4.addStylesheet('/cdn/antd-4.x.css');

// 注册Ant Design 5.x  
const antd5 = libManager.registerLibrary('antd', '5.x');
antd5.addStylesheet('/cdn/antd-5.x.css');

// 在不同区域使用不同版本，完全不冲突！
```

## 🛠️ 开发调试技巧

### 1. CSS隔离调试器
```javascript
class CSSIsolationDebugger {
  constructor() {
    this.isolators = new Map();
    this.setupGlobalDebugger();
  }
  
  register(isolator) {
    this.isolators.set(isolator.appName, isolator);
  }
  
  setupGlobalDebugger() {
    window.__CSS_DEBUG__ = {
      // 查看所有应用的CSS隔离状态
      getStatus: () => {
        const status = {};
        this.isolators.forEach((isolator, name) => {
          status[name] = isolator.getStatus();
        });
        return status;
      },
      
      // 高亮显示某个应用的容器
      highlight: (appName) => {
        const isolator = this.isolators.get(appName);
        if (isolator) {
          const container = isolator.getContainer();
          if (container) {
            container.style.outline = '3px solid red';
            setTimeout(() => {
              container.style.outline = '';
            }, 3000);
          }
        }
      },
      
      // 查看应用的所有样式
      getStyles: (appName) => {
        const isolator = this.isolators.get(appName);
        if (isolator && isolator.options.mode === 'shadow') {
          const shadowRoot = isolator.isolator.shadowRoot;
          return Array.from(shadowRoot.querySelectorAll('style, link')).map(el => ({
            type: el.tagName,
            content: el.textContent || el.href
          }));
        }
        return [];
      }
    };
  }
}
```

### 2. 样式冲突检测
```javascript
class StyleConflictDetector {
  static detect() {
    const allStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
    const conflicts = [];
    
    allStyles.forEach(styleEl => {
      const appName = styleEl.getAttribute('data-micro-app');
      if (appName) {
        // 检测是否有未正确隔离的选择器
        const css = styleEl.textContent || '';
        const selectors = css.match(/[^{}]+(?=\s*\{)/g) || [];
        
        selectors.forEach(selector => {
          if (!selector.includes(`micro-app-${appName}`) && 
              !selector.startsWith('@')) {
            conflicts.push({
              app: appName,
              selector: selector.trim(),
              element: styleEl
            });
          }
        });
      }
    });
    
    if (conflicts.length > 0) {
      console.warn('🚨 发现样式隔离冲突:', conflicts);
    }
    
    return conflicts;
  }
}
```

## ✅ 总结

CSS沙箱是微前端中解决样式冲突的核心技术：

### 🎯 **核心作用**
1. **样式隔离** - 防止应用间样式相互影响
2. **命名空间管理** - 自动为CSS选择器添加前缀
3. **动态样式处理** - 实时处理新增的样式
4. **清理机制** - 应用卸载时完全清理样式

### 📋 **选择建议**
- **大多数场景**：使用命名空间隔离，兼容性好、性能佳
- **高安全要求**：使用Shadow DOM，隔离最彻底
- **老旧浏览器**：只能使用命名空间隔离
- **复杂组件库**：考虑混合使用两种方案

### 🚀 **最佳实践**
1. 开发阶段启用调试工具
2. 定期检测样式冲突
3. 合理选择隔离模式
4. 做好样式清理工作

有了CSS沙箱，你的微前端应用就能在样式上实现真正的独立运行！

## 🔗 相关文章

- [微前端JS沙箱实现指南](./微前端JS沙箱实现指南.md) - 学习JavaScript隔离
