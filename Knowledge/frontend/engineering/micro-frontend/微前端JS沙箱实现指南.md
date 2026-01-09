# 微前端JS沙箱实现指南

微前端架构中，最重要的问题之一是如何让多个应用独立运行而不相互影响。JavaScript沙箱就是解决这个问题的核心技术。

## 🎯 什么是JS沙箱？

简单来说，JS沙箱就像是给每个微前端应用建造一个"独立的房间"，让它们各自在自己的房间里运行，不会干扰到其他应用。

想象一下这个场景：
```javascript
// 主应用设置了全局变量
window.userInfo = { name: 'admin', role: 'admin' };

// 子应用A运行时意外修改了
window.userInfo = { name: 'user1', role: 'user' };  // ❌ 糟糕！

// 子应用B运行时获取到的就是错误的值
console.log(window.userInfo.name); // 'user1' 而不是 'admin'
```

这就是为什么我们需要沙箱隔离！

## 📚 三种沙箱实现方案

### 1. 快照沙箱 - 最简单的方案

**原理**：就像给window拍照，用完后恢复照片。

```javascript
/**
 * 快照沙箱 - 最容易理解的实现
 */
class SnapshotSandbox {
  constructor(name) {
    this.name = name;
    this.windowSnapshot = {}; // 存储window的"照片"
    this.modifyProps = {};    // 记录修改过的属性
    this.active = false;
  }

  // 激活沙箱：拍照 + 恢复之前的修改
  activate() {
    if (this.active) return;

    // 1. 给当前window拍个照
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 2. 恢复这个应用之前的修改
    Object.keys(this.modifyProps).forEach(prop => {
      window[prop] = this.modifyProps[prop];
    });

    this.active = true;
    console.log(`✅ ${this.name} 沙箱激活`);
  }

  // 停用沙箱：记录修改 + 恢复照片
  deactivate() {
    if (!this.active) return;

    // 1. 记录这次运行中的所有修改
    this.modifyProps = {};
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyProps[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop]; // 恢复原样
      }
    }

    // 2. 删除新增的属性
    for (const prop in window) {
      if (!(prop in this.windowSnapshot)) {
        this.modifyProps[prop] = window[prop];
        delete window[prop];
      }
    }

    this.active = false;
    console.log(`❌ ${this.name} 沙箱停用`);
  }
}
```

**使用示例**：
```javascript
const appSandbox = new SnapshotSandbox('my-app');

// 激活沙箱
appSandbox.activate();

// 应用运行（修改全局变量）
window.myAppData = 'hello';
window.userInfo = { modified: true };

// 停用沙箱（自动恢复window）
appSandbox.deactivate();

console.log(window.myAppData); // undefined - 被清理了
console.log(window.userInfo);  // 恢复到原来的值
```

**优点**：简单易懂，兼容性好
**缺点**：只能一个应用用，性能一般

### 2. 代理沙箱 - 最实用的方案

**原理**：给每个应用一个"假的window"，通过代理拦截所有访问。

```javascript
/**
 * 代理沙箱 - 可以同时运行多个应用
 */
class ProxySandbox {
  constructor(name) {
    this.name = name;
    this.fakeWindow = {};  // 这是应用专属的"假window"
    this.active = false;
    
    // 创建代理window
    this.proxyWindow = new Proxy(this.fakeWindow, {
      // 当应用设置属性时
      set: (target, prop, value) => {
        if (this.active) {
          target[prop] = value;  // 存到假window里
          console.log(`📝 ${this.name} 设置了 ${prop}`);
          return true;
        }
        return false;
      },

      // 当应用访问属性时
      get: (target, prop) => {
        // 优先从假window获取
        if (prop in target) {
          return target[prop];
        }
        
        // 否则从真window获取
        const value = window[prop];
        
        // 如果是函数，绑定正确的this
        if (typeof value === 'function') {
          return value.bind(window);
        }
        
        return value;
      }
    });
  }

  activate() {
    this.active = true;
    console.log(`✅ ${this.name} 代理沙箱激活`);
  }

  deactivate() {
    this.active = false;
    console.log(`❌ ${this.name} 代理沙箱停用`);
  }

  // 获取应用专属的window
  getProxyWindow() {
    return this.proxyWindow;
  }

  // 清理沙箱
  destroy() {
    this.fakeWindow = {};
    console.log(`🗑️ ${this.name} 沙箱已清理`);
  }
}
```

**使用示例**：
```javascript
// 可以同时创建多个沙箱
const app1Sandbox = new ProxySandbox('app1');
const app2Sandbox = new ProxySandbox('app2');

app1Sandbox.activate();
app2Sandbox.activate();

// 获取各自的代理window
const app1Window = app1Sandbox.getProxyWindow();
const app2Window = app2Sandbox.getProxyWindow();

// 应用1设置数据
app1Window.appData = 'app1的数据';
app1Window.userInfo = { name: 'app1用户' };

// 应用2设置数据  
app2Window.appData = 'app2的数据';
app2Window.userInfo = { name: 'app2用户' };

// 它们完全隔离！
console.log(app1Window.appData); // 'app1的数据'
console.log(app2Window.appData); // 'app2的数据'
console.log(window.appData);     // undefined - 真window没被污染
```

**优点**：支持多应用，隔离效果好，性能不错
**缺点**：需要现代浏览器支持Proxy

### 3. 原生沙箱 - 最安全的方案

**原理**：使用iframe创建真正独立的JavaScript环境。

```javascript
/**
 * 原生沙箱 - 使用iframe实现真正隔离
 */
class IframeSandbox {
  constructor(name) {
    this.name = name;
    this.iframe = null;
    this.sandboxWindow = null;
  }

  // 创建沙箱
  async create() {
    return new Promise((resolve, reject) => {
      // 创建隐藏的iframe
      this.iframe = document.createElement('iframe');
      this.iframe.style.display = 'none';
      this.iframe.src = 'about:blank';
      
      this.iframe.onload = () => {
        this.sandboxWindow = this.iframe.contentWindow;
        
        // 注入必要的API
        this.sandboxWindow.console = window.console;
        this.sandboxWindow.fetch = window.fetch.bind(window);
        
        console.log(`🏗️ ${this.name} 原生沙箱创建成功`);
        resolve(this.sandboxWindow);
      };

      document.body.appendChild(this.iframe);
    });
  }

  // 在沙箱中运行代码
  execute(code) {
    if (!this.sandboxWindow) {
      throw new Error('沙箱未创建');
    }
    
    return this.sandboxWindow.eval(code);
  }

  // 销毁沙箱
  destroy() {
    if (this.iframe) {
      document.body.removeChild(this.iframe);
      this.iframe = null;
      this.sandboxWindow = null;
    }
    console.log(`🗑️ ${this.name} 原生沙箱已销毁`);
  }
}
```

**使用示例**：
```javascript
const nativeSandbox = new IframeSandbox('secure-app');

// 创建沙箱
await nativeSandbox.create();

// 在完全隔离的环境中运行代码
nativeSandbox.execute(`
  // 这里的代码运行在独立的iframe中
  window.sensitiveData = '机密信息';
  console.log('沙箱中的代码正在运行');
`);

// 主window完全不受影响
console.log(window.sensitiveData); // undefined
```

**优点**：100%隔离，最安全
**缺点**：性能开销大，通信复杂

## 🛡️ 属性保护沙箱 - 实际项目中的需求

在实际项目中，我们经常需要保护主应用的关键属性不被子应用修改：

```javascript
/**
 * 属性保护沙箱 - 专门保护重要属性
 */
class ProtectedSandbox extends ProxySandbox {
  constructor(name, protectedProps = []) {
    super(name);
    this.protectedProps = new Set(protectedProps);
    
    // 重写代理的set方法
    this.proxyWindow = new Proxy(this.fakeWindow, {
      set: (target, prop, value) => {
        // 检查是否为保护属性
        if (this.protectedProps.has(prop)) {
          console.warn(`🚫 ${this.name} 尝试修改受保护的属性: ${prop}`);
          return false; // 阻止修改
        }
        
        if (this.active) {
          target[prop] = value;
          return true;
        }
        return false;
      },

      get: (target, prop) => {
        if (prop in target) {
          return target[prop];
        }
        
        const value = window[prop];
        
        // 如果是保护属性且是对象，创建只读代理
        if (this.protectedProps.has(prop) && typeof value === 'object') {
          return this.createReadonlyProxy(value);
        }
        
        if (typeof value === 'function') {
          return value.bind(window);
        }
        
        return value;
      }
    });
  }

  // 创建只读代理，防止深层修改
  createReadonlyProxy(obj) {
    return new Proxy(obj, {
      set: () => {
        console.warn(`🚫 ${this.name} 尝试修改受保护对象的属性`);
        return false;
      },
      
      get: (target, prop) => {
        const value = target[prop];
        if (typeof value === 'object' && value !== null) {
          return this.createReadonlyProxy(value); // 递归保护
        }
        return value;
      }
    });
  }
}
```

**使用示例**：
```javascript
// 主应用注册重要服务
window.mainAppService = {
  userInfo: { name: 'admin', role: 'admin' },
  config: { apiUrl: 'https://api.main.com' }
};

// 创建保护沙箱
const protectedSandbox = new ProtectedSandbox('child-app', ['mainAppService']);
protectedSandbox.activate();

const childWindow = protectedSandbox.getProxyWindow();

// ✅ 子应用可以读取
console.log(childWindow.mainAppService.userInfo.name); // 'admin'

// ❌ 但不能修改
childWindow.mainAppService = null; // 被阻止
childWindow.mainAppService.config.apiUrl = 'hack'; // 被阻止

// ✅ 可以设置自己的属性
childWindow.myData = '子应用的数据'; // 正常
```

## 🚀 实际应用场景

### 场景1：简单的单页应用切换
```javascript
class SimpleMicroFrontend {
  constructor() {
    this.currentApp = null;
    this.sandbox = new SnapshotSandbox('current');
  }
  
  async loadApp(appName) {
    // 停用当前应用
    if (this.currentApp) {
      this.sandbox.deactivate();
    }
    
    // 激活新应用
    this.sandbox.activate();
    this.currentApp = appName;
    
    // 加载应用代码...
  }
}
```

### 场景2：多应用同时运行
```javascript
class MultiAppManager {
  constructor() {
    this.apps = new Map();
  }
  
  registerApp(name, config) {
    const sandbox = new ProxySandbox(name);
    this.apps.set(name, {
      sandbox,
      config,
      proxyWindow: sandbox.getProxyWindow()
    });
  }
  
  startApp(name) {
    const app = this.apps.get(name);
    if (app) {
      app.sandbox.activate();
      // 在代理window中运行应用...
    }
  }
  
  stopApp(name) {
    const app = this.apps.get(name);
    if (app) {
      app.sandbox.deactivate();
    }
  }
}
```

### 场景3：主从应用属性保护
```javascript
// 主应用初始化
window.kylinService = {
  userInfo: { name: 'admin' },
  api: { request: fetch.bind(window) }
};

// 为子应用创建保护沙箱
const childSandbox = new ProtectedSandbox('child', ['kylinService']);
childSandbox.activate();

// 子应用安全运行
const childEnv = childSandbox.getProxyWindow();
// 子应用可以使用但无法破坏主应用服务
```

## 📊 如何选择沙箱方案？

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 单个应用切换 | 快照沙箱 | 简单够用，兼容性好 |
| 多应用同时运行 | 代理沙箱 | 性能好，隔离效果佳 |
| 高安全要求 | 原生沙箱 | 100%隔离 |
| 主从应用保护 | 属性保护沙箱 | 专门解决属性保护问题 |
| 老旧浏览器 | 快照沙箱 | 不依赖新特性 |

## ✅ 总结

JS沙箱是微前端架构的基石，主要解决以下问题：

1. **全局变量冲突** - 每个应用有独立的全局空间
2. **状态污染** - 应用间状态完全隔离  
3. **内存泄漏** - 应用卸载时完全清理
4. **安全隔离** - 保护重要属性不被误改

选择合适的沙箱方案，就能让你的微前端应用安全、稳定地运行！

## 🔗 相关文章

- [微前端CSS沙箱实现指南](./微前端CSS沙箱实现指南.md) - 学习样式隔离
