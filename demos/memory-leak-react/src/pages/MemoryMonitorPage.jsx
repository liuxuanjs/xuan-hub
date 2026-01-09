import React, { useState, useEffect, useRef } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const MemoryMonitorPage = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [memoryData, setMemoryData] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);
  const alertThresholds = useRef({
    memoryGrowth: 50, // MB
    memoryUsage: 0.8, // 80%
    rapidGrowth: 20 // MB in 30 seconds
  });

  const startMonitoring = () => {
    if (!performance.memory) {
      addAlert('error', '当前浏览器不支持 performance.memory API');
      return;
    }

    setIsMonitoring(true);
    addAlert('info', '开始内存监控');

    intervalRef.current = setInterval(() => {
      const memory = performance.memory;
      const timestamp = Date.now();
      const memoryInfo = {
        timestamp,
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };

      setCurrentMemory(memoryInfo);
      setMemoryData(prev => {
        const newData = [...prev, memoryInfo];
        // 只保留最近100个数据点
        if (newData.length > 100) {
          newData.shift();
        }
        
        // 检查内存异常
        checkMemoryAlerts(newData);
        
        return newData;
      });
    }, 2000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addAlert('info', '内存监控已停止');
  };

  const clearData = () => {
    setMemoryData([]);
    setCurrentMemory(null);
    setAlerts([]);
  };

  const addAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setAlerts(prev => [...prev.slice(-10), alert]);
  };

  const checkMemoryAlerts = (data) => {
    if (data.length < 2) return;

    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    // 检查内存使用率
    if (current.usage > alertThresholds.current.memoryUsage) {
      addAlert('warning', `内存使用率过高: ${(current.usage * 100).toFixed(1)}%`);
    }

    // 检查内存增长
    const growthMB = (current.used - previous.used) / 1024 / 1024;
    if (growthMB > 10) {
      addAlert('warning', `内存快速增长: +${growthMB.toFixed(1)}MB`);
    }

    // 检查30秒内的总增长
    const thirtySecondsAgo = data.find(d => current.timestamp - d.timestamp >= 30000);
    if (thirtySecondsAgo) {
      const totalGrowth = (current.used - thirtySecondsAgo.used) / 1024 / 1024;
      if (totalGrowth > alertThresholds.current.rapidGrowth) {
        addAlert('error', `30秒内内存增长过快: +${totalGrowth.toFixed(1)}MB`);
      }
    }
  };

  const forceGC = () => {
    if (window.gc) {
      window.gc();
      addAlert('success', '已执行垃圾回收');
    } else {
      addAlert('warning', '垃圾回收不可用，请使用 --js-flags="--expose-gc" 启动Chrome');
    }
  };

  const generateReport = () => {
    if (memoryData.length === 0) {
      addAlert('warning', '没有足够的数据生成报告');
      return;
    }

    const first = memoryData[0];
    const last = memoryData[memoryData.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000 / 60; // 分钟
    const growth = (last.used - first.used) / 1024 / 1024; // MB
    const avgUsage = memoryData.reduce((sum, d) => sum + d.usage, 0) / memoryData.length;

    const report = {
      duration: duration.toFixed(1),
      memoryGrowth: growth.toFixed(2),
      growthRate: (growth / duration).toFixed(2),
      avgUsage: (avgUsage * 100).toFixed(1),
      peakUsage: (Math.max(...memoryData.map(d => d.usage)) * 100).toFixed(1),
      dataPoints: memoryData.length
    };

    console.group('📊 内存监控报告');
    console.log(`监控时长: ${report.duration} 分钟`);
    console.log(`内存增长: ${report.memoryGrowth} MB`);
    console.log(`增长率: ${report.growthRate} MB/分钟`);
    console.log(`平均使用率: ${report.avgUsage}%`);
    console.log(`峰值使用率: ${report.peakUsage}%`);
    console.log(`数据点数: ${report.dataPoints}`);
    console.groupEnd();

    addAlert('info', `报告已生成，请查看控制台。增长率: ${report.growthRate} MB/分钟`);
  };

  const codeExample = {
    problem: `// 这是一个完整的内存监控工具
// 可以集成到任何项目中使用

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
}

// 使用示例
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

monitor.start();`
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ScenarioPage
      title="内存监控工具"
      icon="📊"
      description="学习如何建立完整的内存监控体系，实时追踪应用的内存使用情况"
      difficulty="工具"
      leakStatus="normal"
      onCreateLeak={startMonitoring}
      onFixLeak={stopMonitoring}
      codeExample={codeExample}
      keyPoints={[
        {
          title: "实时监控的重要性",
          description: "持续监控内存使用情况可以及早发现内存泄漏，避免问题积累导致应用崩溃。"
        },
        {
          title: "智能告警机制",
          description: "设置合理的阈值和告警条件，在内存异常时及时通知开发者或运维人员。"
        },
        {
          title: "数据收集与分析",
          description: "收集足够的历史数据，分析内存使用模式，识别潜在的性能问题。"
        },
        {
          title: "生产环境集成",
          description: "将监控工具集成到生产环境，结合日志系统和告警平台，建立完整的监控体系。"
        }
      ]}
      performanceTips={[
        "设置合理的监控间隔，避免过于频繁影响性能",
        "结合业务场景设置告警阈值",
        "定期生成内存使用报告，分析趋势",
        "在关键业务流程前后记录内存快照",
        "建立内存泄漏的自动化检测流程"
      ]}
    >
      <div className="memory-monitor-demo">
        <div className="monitor-controls">
          <div className="control-buttons">
            <button 
              onClick={startMonitoring}
              disabled={isMonitoring}
              className="btn btn-success"
            >
              {isMonitoring ? '监控中...' : '开始监控'}
            </button>
            <button 
              onClick={stopMonitoring}
              disabled={!isMonitoring}
              className="btn btn-danger"
            >
              停止监控
            </button>
            <button 
              onClick={forceGC}
              className="btn btn-outline"
            >
              强制GC
            </button>
            <button 
              onClick={generateReport}
              className="btn btn-primary"
              disabled={memoryData.length === 0}
            >
              生成报告
            </button>
            <button 
              onClick={clearData}
              className="btn btn-outline"
            >
              清空数据
            </button>
          </div>
        </div>

        {currentMemory && (
          <div className="current-memory">
            <h4>📊 当前内存状态</h4>
            <div className="memory-stats">
              <div className="stat-item">
                <span className="stat-label">已使用:</span>
                <span className="stat-value">{(currentMemory.used / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">总分配:</span>
                <span className="stat-value">{(currentMemory.total / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">使用率:</span>
                <span className={`stat-value ${currentMemory.usage > 0.8 ? 'high' : currentMemory.usage > 0.6 ? 'medium' : 'low'}`}>
                  {(currentMemory.usage * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">数据点:</span>
                <span className="stat-value">{memoryData.length}</span>
              </div>
            </div>
          </div>
        )}

        {memoryData.length > 0 && (
          <div className="memory-chart">
            <h4>📈 内存使用趋势</h4>
            <div className="chart-container">
              <div className="chart-area">
                {memoryData.map((point, index) => {
                  const height = point.usage * 100;
                  const left = (index / (memoryData.length - 1)) * 100;
                  return (
                    <div
                      key={point.timestamp}
                      className="chart-point"
                      style={{
                        left: `${left}%`,
                        bottom: `${height}%`,
                        backgroundColor: height > 80 ? '#ef4444' : height > 60 ? '#f59e0b' : '#10b981'
                      }}
                      title={`${(point.usage * 100).toFixed(1)}% - ${new Date(point.timestamp).toLocaleTimeString()}`}
                    />
                  );
                })}
              </div>
              <div className="chart-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="alerts-section">
            <h4>🚨 监控告警</h4>
            <div className="alerts-list">
              {alerts.slice(-5).reverse().map((alert) => (
                <div key={alert.id} className={`alert alert-${alert.type}`}>
                  <span className="alert-time">{alert.timestamp}</span>
                  <span className="alert-message">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="demo-info">
          <h4>🛠️ 监控工具使用说明:</h4>
          <ol>
            <li><strong>开始监控</strong>: 点击"开始监控"按钮启动实时内存监控</li>
            <li><strong>观察趋势</strong>: 查看内存使用率的变化趋势图</li>
            <li><strong>关注告警</strong>: 留意系统自动生成的内存告警信息</li>
            <li><strong>生成报告</strong>: 定期生成内存使用报告，分析应用性能</li>
            <li><strong>结合其他工具</strong>: 配合 Performance 和 Memory 面板进行深度分析</li>
          </ol>
        </div>
      </div>
    </ScenarioPage>
  );
};
