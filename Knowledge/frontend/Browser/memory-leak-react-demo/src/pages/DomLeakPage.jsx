import React, { useState, useRef } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const DomLeakPage = () => {
  const [leakStatus, setLeakStatus] = useState('normal');
  const [domElements, setDomElements] = useState([]);
  const [detachedElements, setDetachedElements] = useState([]);
  const domRefsRef = useRef([]);

  const createDomLeak = () => {
    const elements = [];
    const refs = [];
    
    // 创建一些DOM元素并保持JavaScript引用
    for (let i = 0; i < 15; i++) {
      const div = document.createElement('div');
      div.id = `leak-element-${i}`;
      div.className = 'memory-leak-element';
      div.innerHTML = `
        <h3>泄漏元素 ${i + 1}</h3>
        <p>这是一个会导致内存泄漏的DOM元素</p>
        <ul>
          ${Array(20).fill().map((_, j) => `<li>列表项 ${j + 1} - 数据 ${Math.random()}</li>`).join('')}
        </ul>
      `;
      
      // 添加大量数据到元素上
      div._leakData = new Array(30000).fill(`DOM数据-${i}-${Date.now()}`);
      
      // 添加事件监听器（增加泄漏复杂度）
      const clickHandler = function() {
        console.log(`点击了泄漏元素 ${i}，数据长度:`, div._leakData.length);
      };
      div.addEventListener('click', clickHandler);
      
      // 先添加到DOM中
      document.body.appendChild(div);
      
      const elementInfo = {
        id: i,
        element: div,
        clickHandler: clickHandler,
        dataSize: div._leakData.length,
        attached: true
      };
      
      elements.push(elementInfo);
      refs.push(elementInfo);
    }
    
    // 显示元素列表
    setDomElements(elements.map(e => ({
      id: e.id,
      dataSize: e.dataSize,
      attached: e.attached
    })));
    
    // 2秒后移除DOM元素，但保持JavaScript引用
    setTimeout(() => {
      const detached = [];
      refs.forEach(ref => {
        if (ref.element && ref.element.parentNode) {
          // 从DOM中移除元素
          ref.element.parentNode.removeChild(ref.element);
          ref.attached = false;
          detached.push({
            id: ref.id,
            dataSize: ref.dataSize
          });
        }
      });
      
      setDetachedElements(detached);
      setDomElements(prev => prev.map(e => ({ ...e, attached: false })));
    }, 2000);
    
    domRefsRef.current = refs;
    setLeakStatus('active');
  };

  const fixDomLeak = () => {
    // 清理所有DOM引用和相关数据
    domRefsRef.current.forEach(ref => {
      if (ref.element) {
        // 移除事件监听器
        if (ref.clickHandler) {
          ref.element.removeEventListener('click', ref.clickHandler);
        }
        
        // 如果还在DOM中，先移除
        if (ref.element.parentNode) {
          ref.element.parentNode.removeChild(ref.element);
        }
        
        // 清理元素上的数据
        ref.element._leakData = null;
        
        // 清理JavaScript引用
        ref.element = null;
        ref.clickHandler = null;
      }
    });
    
    domRefsRef.current = [];
    setDomElements([]);
    setDetachedElements([]);
    setLeakStatus('normal');
  };

  const codeExample = {
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
      
      // ❌ 保存事件处理器引用，但从不清理
      this.imageData.set(img, {
        handler: clickHandler,
        metadata: img._metadata
      });
    });
  }
  
  updateGallery = () => {
    // ❌ 动态移除DOM元素，但JavaScript引用仍然存在
    this.imageElements.forEach((img, index) => {
      if (index % 2 === 0) {
        img.parentNode.removeChild(img); // DOM中移除
        // 但 this.imageElements 仍然持有引用！
        // img._metadata 仍然存在！
      }
    });
  }
  
  // ❌ 组件卸载时没有清理DOM引用
  componentWillUnmount() {
    // this.imageElements 仍然持有已移除的DOM元素
    // 这些元素无法被垃圾回收
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
        size: '5MB', // 存储描述而非实际数据
        thumbnailCount: 20
      };
      
      // ✅ 将大数据存储在独立的地方，不直接附加到DOM
      const imageDataId = \`image-\${index}-\${Date.now()}\`;
      this.storeImageData(imageDataId, {
        originalData: new ArrayBuffer(5 * 1024 * 1024),
        processedData: new Array(100000).fill(\`image-\${index}\`)
      });
      
      const clickHandler = (e) => {
        if (!this.isActive) return;
        const data = this.getImageData(imageDataId);
        if (data) {
          this.showImageDetails(metadata);
        }
      };
      
      img.addEventListener('click', clickHandler);
      
      // ✅ 使用WeakMap存储临时关联
      this.imageRefs.set(img, { 
        dataId: imageDataId,
        metadata: metadata
      });
      
      // ✅ 记录清理函数
      this.cleanupFunctions.push(() => {
        img.removeEventListener('click', clickHandler);
        this.clearImageData(imageDataId);
        this.imageRefs.delete(img);
      });
    });
  }
  
  storeImageData = (id, data) => {
    // 使用独立的存储，不直接附加到DOM
    if (!this.dataStore) {
      this.dataStore = new Map();
    }
    this.dataStore.set(id, data);
  }
  
  getImageData = (id) => {
    return this.dataStore ? this.dataStore.get(id) : null;
  }
  
  clearImageData = (id) => {
    if (this.dataStore) {
      const data = this.dataStore.get(id);
      if (data) {
        // 清理大对象
        data.originalData = null;
        data.processedData = null;
        this.dataStore.delete(id);
      }
    }
  }
  
  updateGallery = () => {
    const images = document.querySelectorAll('.gallery-image');
    
    images.forEach((img, index) => {
      if (index % 2 === 0) {
        // ✅ 移除前先清理相关数据
        const imgData = this.imageRefs.get(img);
        if (imgData) {
          this.clearImageData(imgData.dataId);
        }
        
        // 移除DOM元素
        img.parentNode.removeChild(img);
        
        // ✅ WeakMap会自动清理引用
      }
    });
  }
  
  componentWillUnmount() {
    // ✅ 设置标志位
    this.isActive = false;
    
    // ✅ 执行所有清理函数
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    // ✅ 清理数据存储
    if (this.dataStore) {
      this.dataStore.clear();
      this.dataStore = null;
    }
    
    // WeakMap会自动清理
    this.imageRefs = null;
  }
}`
  };

  const keyPoints = [
    {
      title: "Detached DOM 元素",
      description: "当DOM元素从页面中移除但仍被JavaScript引用时，这些元素成为'detached DOM'，无法被垃圾回收。"
    },
    {
      title: "DOM元素的数据存储",
      description: "直接在DOM元素上存储大量数据（如 element._data）会导致内存泄漏，即使元素被移除，数据仍然存在。"
    },
    {
      title: "事件监听器的复合影响",
      description: "DOM元素上的事件监听器不仅会阻止元素被回收，监听器函数的闭包还可能持有额外的数据引用。"
    },
    {
      title: "WeakMap 的应用价值",
      description: "使用WeakMap存储DOM相关数据可以避免强引用，当DOM元素被回收时，相关数据也会自动清理。"
    }
  ];

  const performanceTips = [
    "在 Memory 面板中搜索 'Detached' 找到游离的DOM元素",
    "查看 DOM 元素的 Retainers 了解被谁引用",
    "使用 Elements 面板的 Memory 信息查看元素大小",
    "对比快照中 'HTMLElement' 类型对象的数量变化",
    "检查 'system / DOMWrapper' 的内存占用"
  ];

  return (
    <ScenarioPage
      title="DOM引用泄漏"
      icon="📄"
      description="学习识别和修复已移除DOM元素仍被JavaScript引用导致的内存泄漏"
      difficulty="中级"
      leakStatus={leakStatus}
      onCreateLeak={createDomLeak}
      onFixLeak={fixDomLeak}
      codeExample={codeExample}
      keyPoints={keyPoints}
      performanceTips={performanceTips}
      nextScenario={{
        path: '/memory-monitor',
        icon: '📊',
        title: '内存监控工具',
        description: '学习如何建立完整的内存监控体系'
      }}
    >
      <div className="dom-leak-demo">
        <h3>DOM元素状态</h3>
        {domElements.length === 0 ? (
          <div className="empty-state">
            <p>🟢 当前没有泄漏的DOM引用</p>
            <p>点击"创建泄漏"按钮开始演示</p>
          </div>
        ) : (
          <div className="dom-demo-active">
            <div className="dom-stats">
              <p>🔴 创建的DOM元素: {domElements.length} 个</p>
              <p>👻 游离的DOM元素: {detachedElements.length} 个</p>
              <p>📊 总数据量: ~{(domElements.reduce((sum, e) => sum + e.dataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
            </div>
            
            {detachedElements.length > 0 && (
              <div className="detached-warning">
                <h4>⚠️ 检测到游离DOM元素</h4>
                <p>这些元素已从页面中移除，但仍被JavaScript引用：</p>
                <div className="detached-list">
                  {detachedElements.map(element => (
                    <div key={element.id} className="detached-item">
                      <span>元素 #{element.id}</span>
                      <span>{(element.dataSize / 1000).toFixed(0)}K 项数据</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="dom-timeline">
              <h4>📅 泄漏时间线:</h4>
              <div className="timeline">
                <div className="timeline-item completed">
                  <span className="timeline-step">1</span>
                  <span className="timeline-text">创建DOM元素并添加到页面</span>
                </div>
                <div className="timeline-item completed">
                  <span className="timeline-step">2</span>
                  <span className="timeline-text">在元素上存储大量数据</span>
                </div>
                <div className="timeline-item completed">
                  <span className="timeline-step">3</span>
                  <span className="timeline-text">添加事件监听器</span>
                </div>
                <div className={`timeline-item ${detachedElements.length > 0 ? 'completed' : 'pending'}`}>
                  <span className="timeline-step">4</span>
                  <span className="timeline-text">从DOM中移除元素（但保持引用）</span>
                </div>
                <div className="timeline-item pending">
                  <span className="timeline-step">5</span>
                  <span className="timeline-text">清理JavaScript引用</span>
                </div>
              </div>
            </div>
            
            <div className="leak-analysis">
              <h4>🔍 DOM泄漏分析:</h4>
              <ul>
                <li>元素虽然从页面移除，但JavaScript仍持有引用</li>
                <li>元素上的数据（_leakData）无法被垃圾回收</li>
                <li>事件监听器形成额外的引用链</li>
                <li>这种泄漏在单页应用中很常见</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="demo-info">
          <h4>🛠️ Memory 面板检测方法:</h4>
          <ol>
            <li><strong>搜索 Detached</strong>: 在堆快照中搜索 "Detached"</li>
            <li><strong>查看 HTMLElement</strong>: 检查HTML元素对象的数量</li>
            <li><strong>分析 Retainers</strong>: 查看DOM元素被谁引用</li>
            <li><strong>对比快照</strong>: 比较DOM操作前后的内存变化</li>
          </ol>
        </div>
      </div>
    </ScenarioPage>
  );
};
