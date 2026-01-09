import React, { useState, useRef, useEffect } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const TimerLeakPage = () => {
  const [leakStatus, setLeakStatus] = useState('normal');
  const [activeTimers, setActiveTimers] = useState([]);
  const [timerLogs, setTimerLogs] = useState([]);
  const timersRef = useRef([]);

  const createTimerLeak = () => {
    const timers = [];
    const logs = [];
    
    // 创建多个定时器，每个都持有大量数据
    for (let i = 0; i < 5; i++) {
      const largeData = new Array(100000).fill(`定时器数据-${i}-${Date.now()}`);
      let executionCount = 0;
      
      // 创建 setInterval 定时器
      const intervalId = setInterval(() => {
        executionCount++;
        const logMessage = `定时器 ${i} 执行第 ${executionCount} 次，数据大小: ${largeData.length}`;
        
        // 更新日志（只保留最新的几条）
        setTimerLogs(prev => [...prev.slice(-10), {
          id: `timer-${i}-${executionCount}`,
          message: logMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        // 模拟一些计算，增加 CPU 负担
        if (executionCount % 10 === 0) {
          const sum = largeData.slice(0, 1000).reduce((acc, item) => acc + item.length, 0);
          console.log(`定时器 ${i} 计算结果:`, sum);
        }
      }, 1000 + i * 200); // 不同的间隔时间
      
      // 也创建一些 setTimeout 定时器
      const timeoutId = setTimeout(() => {
        console.log(`延迟执行定时器 ${i}，数据:`, largeData.slice(0, 3));
      }, 5000 + i * 1000);
      
      const timerInfo = {
        id: i,
        intervalId,
        timeoutId,
        data: largeData,
        type: 'interval + timeout',
        interval: 1000 + i * 200,
        executionCount: 0
      };
      
      timers.push(timerInfo);
      logs.push(`创建定时器 ${i}，间隔 ${timerInfo.interval}ms`);
    }
    
    timersRef.current = timers;
    setActiveTimers(timers.map(t => ({
      id: t.id,
      type: t.type,
      interval: t.interval,
      dataSize: t.data.length
    })));
    setLeakStatus('active');
  };

  const fixTimerLeak = () => {
    // 清理所有定时器
    timersRef.current.forEach(timer => {
      clearInterval(timer.intervalId);
      clearTimeout(timer.timeoutId);
      // 清理数据引用
      timer.data = null;
    });
    
    timersRef.current = [];
    setActiveTimers([]);
    setTimerLogs([]);
    setLeakStatus('normal');
  };

  // 组件卸载时确保清理
  useEffect(() => {
    return () => {
      if (timersRef.current.length > 0) {
        fixTimerLeak();
      }
    };
  }, []);

  const codeExample = {
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
  
  pollServerData = async () => {
    if (!this.isActive) return;
    
    try {
      const data = await fetch('/api/data');
      const result = await data.json();
      
      // ✅ 限制缓存大小，防止无限增长
      if (this.largeCache.size > 100) {
        const oldestKey = this.largeCache.keys().next().value;
        this.largeCache.delete(oldestKey);
      }
      
      this.largeCache.set(Date.now(), result);
      
      if (this.isActive) {
        this.setState({ data: result });
      }
    } catch (error) {
      console.error('轮询失败:', error);
    }
  }
  
  scheduleNextUpdate = () => {
    if (!this.isActive) return;
    
    const timeoutId = setTimeout(() => {
      if (this.isActive) {
        this.updateUI();
        this.scheduleNextUpdate(); // 有条件的递归
      }
    }, 2000);
    
    this.timers.push(timeoutId);
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
  };

  const keyPoints = [
    {
      title: "定时器的持久性",
      description: "setInterval 和 setTimeout 创建的定时器会持续运行，直到被显式清理，即使创建它们的组件已经卸载。"
    },
    {
      title: "闭包持有引用",
      description: "定时器的回调函数通常是闭包，会持有外部作用域的变量引用，包括大对象和 DOM 元素，阻止垃圾回收。"
    },
    {
      title: "递归定时器的风险",
      description: "使用 setTimeout 实现递归调用时，如果没有正确的退出条件，会导致无限递归和内存泄漏。"
    },
    {
      title: "React 中的定时器管理",
      description: "在 useEffect 的清理函数中或 componentWillUnmount 中，必须清理所有创建的定时器。"
    }
  ];

  const performanceTips = [
    "观察 Performance 面板中的周期性任务",
    "检查 Main 线程中的 'Timer Fired' 事件",
    "在 Memory 面板中查找定时器相关的闭包",
    "使用 console.time() 测量定时器回调的执行时间",
    "关注 CPU 使用率的周期性波动"
  ];

  return (
    <ScenarioPage
      title="定时器泄漏"
      icon="⏰"
      description="学习识别和修复未清理的定时器导致的内存泄漏"
      difficulty="中级"
      leakStatus={leakStatus}
      onCreateLeak={createTimerLeak}
      onFixLeak={fixTimerLeak}
      codeExample={codeExample}
      keyPoints={keyPoints}
      performanceTips={performanceTips}
      nextScenario={{
        path: '/closure-leak',
        icon: '🔒',
        title: '闭包泄漏',
        description: '学习闭包引用大对象导致的内存泄漏'
      }}
    >
      <div className="timer-leak-demo">
        <h3>定时器状态</h3>
        {activeTimers.length === 0 ? (
          <div className="empty-state">
            <p>🟢 当前没有运行的定时器</p>
            <p>点击"创建泄漏"按钮开始演示</p>
          </div>
        ) : (
          <div className="timer-demo-active">
            <div className="timer-stats">
              <p>🔴 活跃定时器: {activeTimers.length} 个</p>
              <p>📊 总数据量: ~{(activeTimers.reduce((sum, t) => sum + t.dataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
            </div>
            
            <div className="timer-list">
              <h4>定时器列表:</h4>
              {activeTimers.map((timer) => (
                <div key={timer.id} className="timer-item">
                  <span className="timer-id">定时器 {timer.id}</span>
                  <span className="timer-type">{timer.type}</span>
                  <span className="timer-interval">{timer.interval}ms</span>
                  <span className="timer-size">{(timer.dataSize / 1000).toFixed(0)}K 项</span>
                </div>
              ))}
            </div>
            
            <div className="timer-logs">
              <h4>定时器执行日志:</h4>
              <div className="log-container">
                {timerLogs.slice(-8).map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">{log.timestamp}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="demo-info">
          <h4>🔍 Performance 面板观察要点:</h4>
          <ul>
            <li><strong>Main 线程</strong>: 查看周期性的 'Timer Fired' 事件</li>
            <li><strong>Memory 图表</strong>: 观察 JS Heap 的锯齿状增长模式</li>
            <li><strong>CPU 使用率</strong>: 注意周期性的 CPU 峰值</li>
            <li><strong>Call Tree</strong>: 找到定时器回调函数的耗时</li>
          </ul>
        </div>
      </div>
    </ScenarioPage>
  );
};
