import { DIFFICULTY_LEVELS, SCENARIO_TYPES } from './constants';

/**
 * 场景配置元数据
 * 集中管理所有场景的配置信息
 */
export const SCENARIOS = {
  [SCENARIO_TYPES.GLOBAL]: {
    id: SCENARIO_TYPES.GLOBAL,
    path: '/global-leak',
    title: '全局变量泄漏',
    icon: '🌍',
    description: '学习识别和修复意外创建的全局变量导致的内存泄漏',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,

    codeExample: {
      problem: `// ❌ 问题代码：意外创建全局变量
function processUserData(userData) {
  // 忘记声明 var/let/const，创建了全局变量！
  userCache = new Array(100000).fill(userData);

  // 在严格模式下这会报错，但非严格模式下会创建全局变量
  processedData = userCache.map(item => ({
    ...item,
    processed: true
  }));

  return processedData;
}

// 另一个常见情况：循环中的意外全局变量
function initializeData() {
  for (i = 0; i < 1000; i++) { // 忘记声明 i
    // 每次循环都在修改全局变量 i
    data[i] = createLargeObject();
  }
}`,

      solution: `// ✅ 修复后的代码
function processUserData(userData) {
  // 正确声明局部变量
  const userCache = new Array(100000).fill(userData);

  const processedData = userCache.map(item => ({
    ...item,
    processed: true
  }));

  return processedData;
  // 函数结束后，局部变量会被垃圾回收
}

// 使用严格模式防止意外全局变量
'use strict';

function initializeData() {
  const data = [];
  for (let i = 0; i < 1000; i++) { // 正确声明循环变量
    data[i] = createLargeObject();
  }
  return data;
}`
    },

    keyPoints: [
      {
        title: '意外全局变量的产生',
        description: '在非严格模式下，忘记使用 var/let/const 声明变量会自动创建全局变量，这些变量不会被垃圾回收。'
      },
      {
        title: '严格模式的重要性',
        description: "使用 'use strict' 可以防止意外创建全局变量，未声明的变量会抛出 ReferenceError。"
      },
      {
        title: '全局变量的检测',
        description: '可以通过 Object.keys(window) 或在 DevTools Console 中检查 window 对象来发现意外的全局变量。'
      },
      {
        title: '内存泄漏的影响',
        description: '全局变量会一直存在于内存中，直到页面卸载，大量的全局变量会导致内存使用持续增长。'
      }
    ],

    performanceTips: [
      '打开 Performance 面板，勾选 Memory 选项',
      "点击录制按钮，然后点击'创建泄漏'",
      '观察 Memory 图表中的 JS Heap 线条上升',
      '停止录制，检查 Main 线程中的活动',
      '切换到 Memory 标签页，拍摄堆快照',
      "在快照中搜索 'accidentalGlobal' 找到泄漏的对象"
    ],

    nextScenario: {
      path: '/event-leak',
      icon: '🎯',
      title: '事件监听器泄漏',
      description: '学习事件监听器未清理导致的内存泄漏'
    }
  },

  [SCENARIO_TYPES.EVENT]: {
    id: SCENARIO_TYPES.EVENT,
    path: '/event-leak',
    title: '事件监听器泄漏',
    icon: '🎯',
    description: '学习识别和修复未清理的事件监听器导致的内存泄漏',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,

    codeExample: {
      problem: `// ❌ 问题代码：事件监听器未清理
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.largeUserData = new Array(100000).fill(props.userData);
  }

  componentDidMount() {
    // 添加事件监听器，但没有在卸载时清理
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('click', this.handleOutsideClick);

    // 这个监听器持有了组件实例的引用
    this.intervalId = setInterval(() => {
      this.updateUserStatus();
    }, 1000);
  }

  handleResize = () => {
    // 这个方法引用了 this.largeUserData
    console.log('窗口大小改变，用户数据长度:', this.largeUserData.length);
  }

  handleOutsideClick = (event) => {
    // 即使组件卸载了，这个监听器仍然存在
    if (this.largeUserData) {
      console.log('点击事件，数据:', this.largeUserData[0]);
    }
  }

  // ❌ 忘记清理事件监听器！
  // componentWillUnmount() {
  //   // 应该在这里清理所有监听器
  // }
}`,

      solution: `// ✅ 修复后的代码
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.largeUserData = new Array(100000).fill(props.userData);
    this.cleanup = []; // 统一管理清理函数
  }

  componentDidMount() {
    // 绑定方法并保存引用
    const handleResize = this.handleResize.bind(this);
    const handleOutsideClick = this.handleOutsideClick.bind(this);

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleOutsideClick);

    const intervalId = setInterval(() => {
      this.updateUserStatus();
    }, 1000);

    // 记录清理函数
    this.cleanup.push(
      () => window.removeEventListener('resize', handleResize),
      () => document.removeEventListener('click', handleOutsideClick),
      () => clearInterval(intervalId)
    );
  }

  componentWillUnmount() {
    // ✅ 清理所有事件监听器和定时器
    this.cleanup.forEach(cleanupFn => cleanupFn());
    this.cleanup = [];

    // 清理大对象引用
    this.largeUserData = null;
  }
}

// 使用 Hooks 的版本
function UserProfile({ userData }) {
  const largeUserDataRef = useRef(new Array(100000).fill(userData));

  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小改变');
    };

    const handleOutsideClick = (event) => {
      console.log('点击事件');
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleOutsideClick);

    // ✅ 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);
}`
    },

    keyPoints: [
      {
        title: '事件监听器的生命周期',
        description: '添加的事件监听器不会自动清理，即使添加监听器的组件已经卸载，监听器仍然存在并持有回调函数的引用。'
      },
      {
        title: '闭包引用问题',
        description: '事件处理函数通常是闭包，会持有外部作用域的变量引用，包括大对象，导致这些对象无法被垃圾回收。'
      },
      {
        title: 'React 组件的清理',
        description: '在 componentWillUnmount 或 useEffect 的返回函数中，必须清理所有添加的事件监听器。'
      },
      {
        title: '事件委托的优势',
        description: '使用事件委托可以减少事件监听器的数量，降低内存泄漏的风险，特别是在处理大量动态元素时。'
      }
    ],

    performanceTips: [
      '录制 Performance 时观察 Listeners 数量的变化',
      "在 Memory 标签页中查找 'Closure' 对象",
      '使用 getEventListeners() 检查元素的监听器',
      "观察 JS Heap 中的 'system / EventListener' 增长",
      '检查 Bottom-Up 面板中的事件处理函数耗时'
    ],

    nextScenario: {
      path: '/timer-leak',
      icon: '⏰',
      title: '定时器泄漏',
      description: '学习定时器未清理导致的内存泄漏'
    }
  },

  [SCENARIO_TYPES.TIMER]: {
    id: SCENARIO_TYPES.TIMER,
    path: '/timer-leak',
    title: '定时器泄漏',
    icon: '⏰',
    description: '学习识别和修复未清理的定时器导致的内存泄漏',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,

    codeExample: {
      problem: `// ❌ 问题代码：定时器未清理
class DataPoller extends React.Component {
  constructor(props) {
    super(props);
    this.largeCache = new Map();
    this.state = { data: null };
  }

  componentDidMount() {
    // ❌ 创建定时器但没有保存 ID
    setInterval(() => {
      this.pollServerData();
    }, 5000);

    // ❌ 另一个未清理的定时器
    setTimeout(() => {
      this.initializeCache();
    }, 1000);

    // ❌ 递归的 setTimeout 也没有清理机制
    this.scheduleNextUpdate();
  }

  pollServerData = async () => {
    try {
      const data = await fetch('/api/data');
      const result = await data.json();

      // 数据累积在缓存中，越来越大
      this.largeCache.set(Date.now(), result);
      this.setState({ data: result });
    } catch (error) {
      console.error('轮询失败:', error);
    }
  }

  scheduleNextUpdate = () => {
    // ❌ 递归调用，没有清理机制
    setTimeout(() => {
      this.updateUI();
      this.scheduleNextUpdate(); // 无限递归
    }, 2000);
  }

  // ❌ 组件卸载时没有清理定时器
  componentWillUnmount() {
    // 定时器继续运行，持有组件引用
    // this.largeCache 无法被垃圾回收
  }
}`,

      solution: `// ✅ 修复后的代码
class DataPoller extends React.Component {
  constructor(props) {
    super(props);
    this.largeCache = new Map();
    this.state = { data: null };
    this.timers = []; // 统一管理定时器 ID
    this.isActive = true; // 组件状态标志
  }

  componentDidMount() {
    // ✅ 保存定时器 ID
    const pollInterval = setInterval(() => {
      if (this.isActive) {
        this.pollServerData();
      }
    }, 5000);

    const initTimeout = setTimeout(() => {
      if (this.isActive) {
        this.initializeCache();
      }
    }, 1000);

    // 保存所有定时器 ID
    this.timers.push(pollInterval, initTimeout);

    // 启动可控的递归更新
    this.scheduleNextUpdate();
  }

  componentWillUnmount() {
    // ✅ 设置标志位，停止所有异步操作
    this.isActive = false;

    // ✅ 清理所有定时器
    this.timers.forEach(timerId => {
      clearInterval(timerId);
      clearTimeout(timerId);
    });
    this.timers = [];

    // ✅ 清理大对象引用
    this.largeCache.clear();
    this.largeCache = null;
  }
}

// 使用 Hooks 的版本
function DataPoller() {
  const [data, setData] = useState(null);
  const largeCacheRef = useRef(new Map());
  const isActiveRef = useRef(true);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (!isActiveRef.current) return;

      try {
        const response = await fetch('/api/data');
        const result = await response.json();

        // 限制缓存大小
        const cache = largeCacheRef.current;
        if (cache.size > 100) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }

        cache.set(Date.now(), result);
        setData(result);
      } catch (error) {
        console.error('轮询失败:', error);
      }
    }, 5000);

    // ✅ 清理函数
    return () => {
      isActiveRef.current = false;
      clearInterval(pollInterval);
      largeCacheRef.current.clear();
    };
  }, []);
}`
    },

    keyPoints: [
      {
        title: '定时器的持久性',
        description: 'setInterval 和 setTimeout 创建的定时器会持续运行，直到被显式清理，即使创建它们的组件已经卸载。'
      },
      {
        title: '闭包持有引用',
        description: '定时器的回调函数通常是闭包，会持有外部作用域的变量引用，包括大对象和 DOM 元素，阻止垃圾回收。'
      },
      {
        title: '递归定时器的风险',
        description: '使用 setTimeout 实现递归调用时，如果没有正确的退出条件，会导致无限递归和内存泄漏。'
      },
      {
        title: 'React 中的定时器管理',
        description: '在 useEffect 的清理函数中或 componentWillUnmount 中，必须清理所有创建的定时器。'
      }
    ],

    performanceTips: [
      '观察 Performance 面板中的周期性任务',
      "检查 Main 线程中的 'Timer Fired' 事件",
      '在 Memory 面板中查找定时器相关的闭包',
      '使用 console.time() 测量定时器回调的执行时间',
      '关注 CPU 使用率的周期性波动'
    ],

    nextScenario: {
      path: '/closure-leak',
      icon: '🔒',
      title: '闭包泄漏',
      description: '学习闭包引用大对象导致的内存泄漏'
    }
  },

  [SCENARIO_TYPES.CLOSURE]: {
    id: SCENARIO_TYPES.CLOSURE,
    path: '/closure-leak',
    title: '闭包泄漏',
    icon: '🔒',
    description: '学习识别和修复闭包意外持有大对象引用导致的内存泄漏',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,

    codeExample: {
      problem: `// ❌ 问题代码：闭包意外持有大对象引用
function createDataProcessor(rawData) {
  // 创建大量数据
  const massiveDataset = new Array(1000000).fill(rawData);
  const processedCache = new Map();
  const temporaryBuffer = new ArrayBuffer(50 * 1024 * 1024); // 50MB
  const metadata = { size: massiveDataset.length, created: Date.now() };

  // ❌ 这个函数只需要 metadata，但闭包持有了所有变量
  const getMetadata = function() {
    return metadata; // 简单的返回，但整个作用域被持有
  };

  // ❌ 这个函数只需要处理少量数据，但持有了全部引用
  const processSmallBatch = function(batchSize = 10) {
    // 只处理前 10 个元素，但 massiveDataset 全部被引用
    return massiveDataset.slice(0, batchSize).map(item => item.toUpperCase());
  };

  // ❌ 即使不使用大数据，闭包仍然持有引用
  const simpleCounter = (function() {
    let count = 0;
    return function() {
      return ++count; // 不使用任何大数据，但都被持有
    };
  })();

  return {
    getMetadata,
    processSmallBatch,
    simpleCounter
  };
  // massiveDataset, processedCache, temporaryBuffer 无法被回收！
}`,

      solution: `// ✅ 修复后的代码
function createDataProcessor(rawData) {
  const massiveDataset = new Array(1000000).fill(rawData);
  const processedCache = new Map();
  const temporaryBuffer = new ArrayBuffer(50 * 1024 * 1024);

  // ✅ 提取需要的数据，避免持有大对象
  const metadata = {
    size: massiveDataset.length,
    created: Date.now()
  };

  // ✅ 立即处理并清理大对象引用
  const smallBatchData = massiveDataset.slice(0, 100); // 只保留需要的部分

  // 清理大对象引用
  massiveDataset.length = 0; // 清空数组
  processedCache.clear();

  const getMetadata = function() {
    return metadata; // 只持有小对象的引用
  };

  const processSmallBatch = function(batchSize = 10) {
    // 使用预处理的小数据集
    return smallBatchData.slice(0, batchSize).map(item => item.toUpperCase());
  };

  // ✅ 独立的计数器，不持有其他引用
  const createCounter = function() {
    let count = 0;
    return function() {
      return ++count;
    };
  };

  return {
    getMetadata,
    processSmallBatch,
    simpleCounter: createCounter()
  };
}

// 使用 WeakMap 避免循环引用
const processorsCache = new WeakMap();

function createOptimizedProcessor(rawData) {
  const processor = {
    metadata: { size: rawData.length, created: Date.now() },

    processData: function(data) {
      // 使用 WeakMap 存储临时数据，自动清理
      if (!processorsCache.has(this)) {
        processorsCache.set(this, new Map());
      }
      const cache = processorsCache.get(this);

      // 处理逻辑...
      return data.slice(0, 10);
    }
  };

  return processor;
}`
    },

    keyPoints: [
      {
        title: '闭包的内存机制',
        description: 'JavaScript 闭包会持有整个外部作用域的引用，即使函数只使用其中一小部分变量，所有变量都会被保留在内存中。'
      },
      {
        title: '隐蔽的内存泄漏',
        description: '闭包导致的内存泄漏往往很隐蔽，看似简单的函数可能持有大量不必要的数据引用。'
      },
      {
        title: '作用域链的影响',
        description: '嵌套函数会创建作用域链，每个层级的变量都可能被内层函数持有，导致整个链条无法被垃圾回收。'
      },
      {
        title: 'WeakMap 的应用',
        description: '使用 WeakMap 可以创建弱引用，当对象不再被其他地方引用时，WeakMap 中的条目会自动被清理。'
      }
    ],

    performanceTips: [
      "在 Memory 面板中搜索 'Closure' 对象",
      '查看闭包持有的变量列表和大小',
      '使用 Retainers 视图追踪引用链',
      '对比快照前后的闭包数量变化',
      "关注 'system / Context' 的内存占用"
    ],

    nextScenario: {
      path: '/dom-leak',
      icon: '📄',
      title: 'DOM引用泄漏',
      description: '学习DOM元素引用导致的内存泄漏'
    }
  },

  [SCENARIO_TYPES.DOM]: {
    id: SCENARIO_TYPES.DOM,
    path: '/dom-leak',
    title: 'DOM引用泄漏',
    icon: '📄',
    description: '学习识别和修复已移除DOM元素仍被JavaScript引用导致的内存泄漏',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,

    codeExample: {
      problem: `// ❌ 问题代码：DOM引用泄漏
class ImageGallery extends React.Component {
  constructor(props) {
    super(props);
    this.imageElements = []; // 持有DOM元素的直接引用
    this.imageData = new Map(); // 存储大量图片数据
  }

  componentDidMount() {
    this.loadImages();
  }

  loadImages = () => {
    const images = document.querySelectorAll('.gallery-image');

    images.forEach((img, index) => {
      // ❌ 直接保存DOM元素引用
      this.imageElements.push(img);

      // ❌ 在元素上存储大量数据
      img._metadata = {
        originalData: new ArrayBuffer(5 * 1024 * 1024), // 5MB
        processedData: new Array(100000).fill(\`image-\${index}\`),
        thumbnails: new Array(20).fill().map(() => new ArrayBuffer(1024 * 1024))
      };

      // ❌ 添加事件监听器但不清理
      const clickHandler = (e) => {
        console.log('图片数据:', img._metadata);
        this.showImageDetails(img._metadata);
      };

      img.addEventListener('click', clickHandler);
    });
  }

  updateGallery = () => {
    // ❌ 动态移除DOM元素，但JavaScript引用仍然存在
    this.imageElements.forEach((img, index) => {
      if (index % 2 === 0) {
        img.parentNode.removeChild(img); // DOM中移除
        // 但 this.imageElements 仍然持有引用！
      }
    });
  }

  // ❌ 组件卸载时没有清理DOM引用
  componentWillUnmount() {
    // this.imageElements 仍然持有已移除的DOM元素
  }
}`,

      solution: `// ✅ 修复后的代码
class ImageGallery extends React.Component {
  constructor(props) {
    super(props);
    this.imageRefs = new WeakMap(); // 使用WeakMap避免强引用
    this.cleanupFunctions = []; // 统一管理清理函数
    this.isActive = true;
  }

  componentDidMount() {
    this.loadImages();
  }

  loadImages = () => {
    const images = document.querySelectorAll('.gallery-image');

    images.forEach((img, index) => {
      if (!this.isActive) return;

      // ✅ 使用WeakMap存储元数据，避免直接引用
      const metadata = {
        id: index,
        size: '5MB',
        thumbnailCount: 20
      };

      const clickHandler = (e) => {
        if (!this.isActive) return;
        this.showImageDetails(metadata);
      };

      img.addEventListener('click', clickHandler);

      // ✅ 使用WeakMap存储临时关联
      this.imageRefs.set(img, { metadata: metadata });

      // ✅ 记录清理函数
      this.cleanupFunctions.push(() => {
        img.removeEventListener('click', clickHandler);
        this.imageRefs.delete(img);
      });
    });
  }

  componentWillUnmount() {
    // ✅ 设置标志位
    this.isActive = false;

    // ✅ 执行所有清理函数
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];

    // WeakMap会自动清理
    this.imageRefs = null;
  }
}`
    },

    keyPoints: [
      {
        title: 'Detached DOM 元素',
        description: "当DOM元素从页面中移除但仍被JavaScript引用时，这些元素成为'detached DOM'，无法被垃圾回收。"
      },
      {
        title: 'DOM元素的数据存储',
        description: '直接在DOM元素上存储大量数据（如 element._data）会导致内存泄漏，即使元素被移除，数据仍然存在。'
      },
      {
        title: '事件监听器的复合影响',
        description: 'DOM元素上的事件监听器不仅会阻止元素被回收，监听器函数的闭包还可能持有额外的数据引用。'
      },
      {
        title: 'WeakMap 的应用价值',
        description: '使用WeakMap存储DOM相关数据可以避免强引用，当DOM元素被回收时，相关数据也会自动清理。'
      }
    ],

    performanceTips: [
      "在 Memory 面板中搜索 'Detached' 找到游离的DOM元素",
      '查看 DOM 元素的 Retainers 了解被谁引用',
      '使用 Elements 面板的 Memory 信息查看元素大小',
      "对比快照中 'HTMLElement' 类型对象的数量变化",
      "检查 'system / DOMWrapper' 的内存占用"
    ],

    nextScenario: {
      path: '/memory-monitor',
      icon: '📊',
      title: '内存监控工具',
      description: '学习如何建立完整的内存监控体系'
    }
  },

  [SCENARIO_TYPES.MEMORY_MONITOR]: {
    id: SCENARIO_TYPES.MEMORY_MONITOR,
    path: '/memory-monitor',
    title: '内存监控工具',
    icon: '📊',
    description: '学习如何建立完整的内存监控体系，实时追踪应用的内存使用情况',
    difficulty: DIFFICULTY_LEVELS.TOOL,

    codeExample: {
      problem: `// 内存监控工具 - 使用示例
class MemoryMonitor {
  constructor(options = {}) {
    this.options = {
      interval: options.interval || 5000,
      alertThreshold: options.alertThreshold || 0.8,
      maxDataPoints: options.maxDataPoints || 100,
      onAlert: options.onAlert || console.warn,
      ...options
    };

    this.data = [];
    this.isMonitoring = false;
    this.intervalId = null;
  }

  start() {
    if (!performance.memory) {
      console.warn('Memory API not supported');
      return false;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.collectData();
    }, this.options.interval);

    return true;
  }

  stop() {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  collectData() {
    const memory = performance.memory;
    const dataPoint = {
      timestamp: Date.now(),
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
    };

    this.data.push(dataPoint);

    if (this.data.length > this.options.maxDataPoints) {
      this.data.shift();
    }

    this.checkAlerts(dataPoint);
  }

  checkAlerts(current) {
    if (current.usage > this.options.alertThreshold) {
      this.options.onAlert(\`High memory usage: \${(current.usage * 100).toFixed(1)}%\`);
    }
  }

  getReport() {
    if (this.data.length < 2) return null;

    const first = this.data[0];
    const last = this.data[this.data.length - 1];

    return {
      duration: (last.timestamp - first.timestamp) / 1000 / 60,
      growth: (last.used - first.used) / 1024 / 1024,
      avgUsage: this.data.reduce((sum, d) => sum + d.usage, 0) / this.data.length
    };
  }
}`,

      solution: `// 生产环境集成示例
const monitor = new MemoryMonitor({
  interval: 3000,
  alertThreshold: 0.75,
  onAlert: (message) => {
    console.warn('Memory Alert:', message);
    // 发送到监控服务
    fetch('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ type: 'memory', message })
    });
  }
});

monitor.start();

// React Hook 封装
function useMemoryMonitor(options = {}) {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const monitorRef = useRef(null);

  useEffect(() => {
    monitorRef.current = new MemoryMonitor({
      ...options,
      onAlert: (message) => {
        setAlerts(prev => [...prev.slice(-10), {
          id: Date.now(),
          message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    });

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stop();
      }
    };
  }, []);

  const startMonitoring = useCallback(() => {
    monitorRef.current?.start();
  }, []);

  const stopMonitoring = useCallback(() => {
    monitorRef.current?.stop();
  }, []);

  return {
    memoryInfo,
    alerts,
    startMonitoring,
    stopMonitoring
  };
}`
    },

    keyPoints: [
      {
        title: '实时监控的重要性',
        description: '持续监控内存使用情况可以及早发现内存泄漏，避免问题积累导致应用崩溃。'
      },
      {
        title: '智能告警机制',
        description: '设置合理的阈值和告警条件，在内存异常时及时通知开发者或运维人员。'
      },
      {
        title: '数据收集与分析',
        description: '收集足够的历史数据，分析内存使用模式，识别潜在的性能问题。'
      },
      {
        title: '生产环境集成',
        description: '将监控工具集成到生产环境，结合日志系统和告警平台，建立完整的监控体系。'
      }
    ],

    performanceTips: [
      '设置合理的监控间隔，避免过于频繁影响性能',
      '结合业务场景设置告警阈值',
      '定期生成内存使用报告，分析趋势',
      '在关键业务流程前后记录内存快照',
      '建立内存泄漏的自动化检测流程'
    ],

    nextScenario: {
      path: '/',
      icon: '🏠',
      title: '返回首页',
      description: '查看所有内存泄漏场景'
    }
  }
};

/**
 * 获取场景列表（用于导航）
 */
export const getScenarioList = () => {
  return Object.values(SCENARIOS).map(scenario => ({
    id: scenario.id,
    path: scenario.path,
    title: scenario.title,
    icon: scenario.icon,
    description: scenario.description,
    difficulty: scenario.difficulty
  }));
};

/**
 * 根据ID获取场景配置
 */
export const getScenarioById = (id) => {
  return SCENARIOS[id] || null;
};

/**
 * 根据路径获取场景配置
 */
export const getScenarioByPath = (path) => {
  return Object.values(SCENARIOS).find(s => s.path === path) || null;
};

export default SCENARIOS;
