import React, { useState, useRef } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const ClosureLeakPage = () => {
  const [leakStatus, setLeakStatus] = useState('normal');
  const [closureFunctions, setClosureFunctions] = useState([]);
  const closureRefsRef = useRef([]);

  const createClosureLeak = () => {
    const functions = [];
    
    for (let i = 0; i < 3; i++) {
      // 创建一个很大的数据对象
      const veryLargeData = new Array(200000).fill(`大数据-${i}-${Math.random()}`);
      const someOtherData = new Array(100000).fill(`其他数据-${i}`);
      const metadata = { id: i, created: Date.now(), size: veryLargeData.length };
      
      // ❌ 问题：这个闭包意外持有了所有变量的引用
      const leakyFunction = function(action) {
        // 函数只需要 metadata，但闭包持有了所有变量
        if (action === 'getMetadata') {
          return metadata;
        } else if (action === 'getSize') {
          // 即使只需要长度，整个 veryLargeData 仍被引用
          return veryLargeData.length;
        } else if (action === 'getOtherSize') {
          return someOtherData.length;
        }
        return null;
      };
      
      // 创建另一个更隐蔽的闭包泄漏
      const anotherFunction = function() {
        // 这个函数看起来不使用大数据，但闭包仍然持有引用
        return `处理器 ${i} 已就绪`;
      };
      
      const functionInfo = {
        id: i,
        name: `闭包函数 ${i}`,
        largeDataSize: veryLargeData.length,
        otherDataSize: someOtherData.length,
        func: leakyFunction,
        anotherFunc: anotherFunction,
        // 保持对大数据的直接引用（演示用）
        _largeData: veryLargeData,
        _otherData: someOtherData
      };
      
      functions.push(functionInfo);
    }
    
    closureRefsRef.current = functions;
    setClosureFunctions(functions.map(f => ({
      id: f.id,
      name: f.name,
      largeDataSize: f.largeDataSize,
      otherDataSize: f.otherDataSize
    })));
    setLeakStatus('active');
  };

  const fixClosureLeak = () => {
    // 清理所有闭包引用
    closureRefsRef.current.forEach(item => {
      item.func = null;
      item.anotherFunc = null;
      item._largeData = null;
      item._otherData = null;
    });
    
    closureRefsRef.current = [];
    setClosureFunctions([]);
    setLeakStatus('normal');
  };

  const testClosureFunction = (id, action) => {
    const closureInfo = closureRefsRef.current.find(f => f.id === id);
    if (closureInfo && closureInfo.func) {
      const result = closureInfo.func(action);
      console.log(`闭包函数 ${id} 执行结果:`, result);
      return result;
    }
    return null;
  };

  const codeExample = {
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
  };

  const keyPoints = [
    {
      title: "闭包的内存机制",
      description: "JavaScript 闭包会持有整个外部作用域的引用，即使函数只使用其中一小部分变量，所有变量都会被保留在内存中。"
    },
    {
      title: "隐蔽的内存泄漏",
      description: "闭包导致的内存泄漏往往很隐蔽，看似简单的函数可能持有大量不必要的数据引用。"
    },
    {
      title: "作用域链的影响",
      description: "嵌套函数会创建作用域链，每个层级的变量都可能被内层函数持有，导致整个链条无法被垃圾回收。"
    },
    {
      title: "WeakMap 的应用",
      description: "使用 WeakMap 可以创建弱引用，当对象不再被其他地方引用时，WeakMap 中的条目会自动被清理。"
    }
  ];

  const performanceTips = [
    "在 Memory 面板中搜索 'Closure' 对象",
    "查看闭包持有的变量列表和大小",
    "使用 Retainers 视图追踪引用链",
    "对比快照前后的闭包数量变化",
    "关注 'system / Context' 的内存占用"
  ];

  return (
    <ScenarioPage
      title="闭包泄漏"
      icon="🔒"
      description="学习识别和修复闭包意外持有大对象引用导致的内存泄漏"
      difficulty="高级"
      leakStatus={leakStatus}
      onCreateLeak={createClosureLeak}
      onFixLeak={fixClosureLeak}
      codeExample={codeExample}
      keyPoints={keyPoints}
      performanceTips={performanceTips}
      nextScenario={{
        path: '/dom-leak',
        icon: '📄',
        title: 'DOM引用泄漏',
        description: '学习DOM元素引用导致的内存泄漏'
      }}
    >
      <div className="closure-leak-demo">
        <h3>闭包函数状态</h3>
        {closureFunctions.length === 0 ? (
          <div className="empty-state">
            <p>🟢 当前没有泄漏的闭包</p>
            <p>点击"创建泄漏"按钮开始演示</p>
          </div>
        ) : (
          <div className="closure-demo-active">
            <div className="closure-stats">
              <p>🔴 泄漏的闭包函数: {closureFunctions.length} 个</p>
              <p>📊 总数据量: ~{(closureFunctions.reduce((sum, f) => sum + f.largeDataSize + f.otherDataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
            </div>
            
            <div className="closure-list">
              <h4>闭包函数列表:</h4>
              {closureFunctions.map((func) => (
                <div key={func.id} className="closure-item">
                  <div className="closure-header">
                    <span className="closure-name">{func.name}</span>
                    <span className="closure-size">
                      {((func.largeDataSize + func.otherDataSize) / 1000).toFixed(0)}K 项
                    </span>
                  </div>
                  <div className="closure-actions">
                    <button 
                      className="test-btn"
                      onClick={() => testClosureFunction(func.id, 'getMetadata')}
                    >
                      获取元数据
                    </button>
                    <button 
                      className="test-btn"
                      onClick={() => testClosureFunction(func.id, 'getSize')}
                    >
                      获取大小
                    </button>
                    <button 
                      className="test-btn"
                      onClick={() => testClosureFunction(func.id, 'getOtherSize')}
                    >
                      获取其他大小
                    </button>
                  </div>
                  <div className="closure-details">
                    <small>大数据: {func.largeDataSize.toLocaleString()} 项</small>
                    <small>其他数据: {func.otherDataSize.toLocaleString()} 项</small>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="leak-analysis">
              <h4>🔍 闭包泄漏分析:</h4>
              <ul>
                <li>每个闭包函数都持有完整的外部作用域</li>
                <li>即使只使用少量数据，所有变量都被引用</li>
                <li>嵌套闭包会创建引用链，加剧泄漏</li>
                <li>这种泄漏在代码中很难直接看出</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="demo-info">
          <h4>🛠️ Memory 面板分析技巧:</h4>
          <ol>
            <li><strong>搜索 Closure</strong>: 在堆快照中搜索 "Closure"</li>
            <li><strong>查看 Retainers</strong>: 分析闭包被谁引用</li>
            <li><strong>对比快照</strong>: 创建前后对比闭包数量</li>
            <li><strong>检查作用域</strong>: 查看闭包持有的变量列表</li>
          </ol>
        </div>
      </div>
    </ScenarioPage>
  );
};
