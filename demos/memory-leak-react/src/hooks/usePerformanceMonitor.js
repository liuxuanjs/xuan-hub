import { useState, useEffect, useCallback, useRef } from 'react';

export const usePerformanceMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    used: 0,
    total: 0,
    limit: 0
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);
  const observersRef = useRef([]);

  // 检查浏览器支持
  const isSupported = 'memory' in performance;

  // 更新内存信息
  const updateMemoryInfo = useCallback(() => {
    if (!isSupported) return;

    const memory = performance.memory;
    const newMemoryInfo = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
    
    setMemoryInfo(newMemoryInfo);
    return newMemoryInfo;
  }, [isSupported]);

  // 添加日志
  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    setLogs(prevLogs => [...prevLogs, logEntry]);
  }, []);

  // 清空日志
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 开始监控
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !isSupported) return;

    setIsMonitoring(true);
    addLog('开始内存监控 (每2秒更新一次)');

    intervalRef.current = setInterval(() => {
      const memory = updateMemoryInfo();
      if (memory) {
        const used = (memory.used / 1024 / 1024).toFixed(2);
        const total = (memory.total / 1024 / 1024).toFixed(2);
        addLog(`内存使用: ${used}MB / ${total}MB`);
      }
    }, 2000);
  }, [isMonitoring, isSupported, updateMemoryInfo, addLog]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('内存监控已停止');
  }, [isMonitoring, addLog]);

  // 设置性能观察器
  const setupPerformanceObservers = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    // 长任务监控
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          addLog(`⚠️ 检测到长任务: ${entry.duration.toFixed(2)}ms`);
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      observersRef.current.push(longTaskObserver);
    } catch (e) {
      console.warn('Long task monitoring not available');
    }

    // 布局偏移监控
    try {
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
            if (cls > 0.1) {
              addLog(`⚠️ 累积布局偏移过大: ${cls.toFixed(4)}`);
            }
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observersRef.current.push(clsObserver);
    } catch (e) {
      console.warn('Layout shift monitoring not available');
    }

    // LCP监控
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          addLog(`📊 LCP: ${entry.startTime.toFixed(2)}ms`);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observersRef.current.push(lcpObserver);
    } catch (e) {
      console.warn('LCP monitoring not available');
    }
  }, [addLog]);

  // 强制垃圾回收
  const forceGarbageCollection = useCallback(() => {
    if (window.gc) {
      window.gc();
      addLog('✅ 已强制执行垃圾回收');
      setTimeout(() => updateMemoryInfo(), 100);
    } else {
      addLog('⚠️ 垃圾回收不可用。请使用以下标志启动Chrome:');
      addLog('chrome --js-flags="--expose-gc" --enable-precise-memory-info');
    }
  }, [updateMemoryInfo, addLog]);

  // 获取性能报告
  const getPerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      memory: memoryInfo,
      navigation: null,
      resources: []
    };

    // 获取导航时序
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      report.navigation = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domParse: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        total: navigation.loadEventEnd - navigation.navigationStart
      };
    }

    // 获取资源时序
    const resources = performance.getEntriesByType('resource');
    report.resources = resources.slice(-10).map(resource => ({
      name: resource.name.split('/').pop(),
      duration: resource.duration.toFixed(2),
      size: resource.transferSize || 0
    }));

    addLog('📊 性能报告已生成，请查看控制台');
    console.log('性能报告:', report);
    
    return report;
  }, [memoryInfo, addLog]);

  // 初始化
  useEffect(() => {
    updateMemoryInfo();
    setupPerformanceObservers();

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      observersRef.current.forEach(observer => observer.disconnect());
    };
  }, [updateMemoryInfo, setupPerformanceObservers]);

  return {
    memoryInfo,
    isMonitoring,
    logs,
    isSupported,
    startMonitoring,
    stopMonitoring,
    addLog,
    clearLogs,
    forceGarbageCollection,
    getPerformanceReport,
    updateMemoryInfo
  };
};
