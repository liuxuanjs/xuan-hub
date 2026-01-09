import { useState, useCallback, useRef } from 'react';

export const useMemoryLeaks = (addLog) => {
  // 存储各种泄漏的引用
  const globalLeaksRef = useRef([]);
  const eventElementsRef = useRef([]);
  const timersRef = useRef([]);
  const closureFunctionsRef = useRef([]);
  const domReferencesRef = useRef([]);

  const [eventElements, setEventElements] = useState([]);
  const [timerCount, setTimerCount] = useState(0);
  const [domElements, setDomElements] = useState([]);

  // =============================================================================
  // 全局变量泄漏
  // =============================================================================

  const createGlobalLeak = useCallback(() => {
    try {
      const largeData = new Array(100000).fill('这是一个大数据对象，用于演示全局变量泄漏');
      
      if (typeof window !== 'undefined') {
        window.accidentalGlobal = largeData;
        globalLeaksRef.current.push('accidentalGlobal');
      }

      addLog('❌ 已创建全局变量泄漏：accidentalGlobal (约10MB数据)');
      addLog('检查方法：在DevTools控制台输入 window.accidentalGlobal');
    } catch (error) {
      addLog(`创建全局变量泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  const fixGlobalLeak = useCallback(() => {
    try {
      let fixedCount = 0;
      globalLeaksRef.current.forEach(varName => {
        if (typeof window !== 'undefined' && window[varName]) {
          delete window[varName];
          fixedCount++;
        }
      });

      globalLeaksRef.current = [];
      addLog(`✅ 已清理 ${fixedCount} 个全局变量泄漏`);
    } catch (error) {
      addLog(`清理全局变量泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  // =============================================================================
  // 事件监听器泄漏
  // =============================================================================

  const createEventLeak = useCallback(() => {
    const newElements = [];
    
    for (let i = 0; i < 10; i++) {
      const largeData = new Array(10000).fill(`数据-${i}`);
      const eventHandler = function() {
        console.log('按钮被点击，数据长度:', largeData.length);
      };

      const elementData = {
        id: `btn-${i}`,
        text: `按钮 ${i + 1}`,
        handler: eventHandler,
        data: largeData
      };

      newElements.push(elementData);
      eventElementsRef.current.push(elementData);
    }

    setEventElements(newElements);
    addLog('❌ 已创建事件监听器泄漏：10个按钮，每个持有10KB数据');
    addLog('泄漏原因：元素被移除但事件监听器未清理，导致回调函数和相关数据无法回收');
  }, [addLog]);

  const fixEventLeak = useCallback(() => {
    try {
      eventElementsRef.current.forEach(item => {
        item.data = null;
      });

      setEventElements([]);
      eventElementsRef.current = [];
      addLog('✅ 已清理所有事件监听器泄漏');
    } catch (error) {
      addLog(`清理事件监听器泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  // =============================================================================
  // 定时器泄漏
  // =============================================================================

  const createTimerLeak = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      const largeData = new Array(50000).fill(`定时器数据-${i}`);
      
      const timerId = setInterval(() => {
        if (Math.random() < 0.01) {
          console.log(`定时器${i}运行中，数据长度:`, largeData.length);
        }
      }, 1000);

      timersRef.current.push({
        id: timerId,
        data: largeData,
        index: i
      });
    }

    setTimerCount(timersRef.current.length);
    addLog('❌ 已创建定时器泄漏：5个定时器，每个持有约200KB数据');
    addLog('泄漏原因：定时器未清理，持续持有大量数据的引用');
  }, [addLog]);

  const fixTimerLeak = useCallback(() => {
    try {
      timersRef.current.forEach(timer => {
        clearInterval(timer.id);
        timer.data = null;
      });

      timersRef.current = [];
      setTimerCount(0);
      addLog('✅ 已清理所有定时器泄漏');
    } catch (error) {
      addLog(`清理定时器泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  // =============================================================================
  // 闭包泄漏
  // =============================================================================

  const createClosureLeak = useCallback(() => {
    for (let i = 0; i < 3; i++) {
      const veryLargeData = new Array(200000).fill(`闭包数据-${i}`);
      const someOtherData = new Array(100000).fill(`其他数据-${i}`);

      const leakyFunction = function() {
        return someOtherData.length;
      };

      closureFunctionsRef.current.push({
        func: leakyFunction,
        largeData: veryLargeData,
        otherData: someOtherData,
        index: i
      });
    }

    addLog('❌ 已创建闭包泄漏：3个闭包，每个意外持有约800KB数据');
    addLog('泄漏原因：闭包持有了不必要的大对象引用');
  }, [addLog]);

  const fixClosureLeak = useCallback(() => {
    try {
      closureFunctionsRef.current.forEach(item => {
        item.func = null;
        item.largeData = null;
        item.otherData = null;
      });

      closureFunctionsRef.current = [];
      addLog('✅ 已清理所有闭包泄漏');
    } catch (error) {
      addLog(`清理闭包泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  // =============================================================================
  // DOM引用泄漏
  // =============================================================================

  const createDomLeak = useCallback(() => {
    const newElements = [];

    for (let i = 0; i < 20; i++) {
      const elementData = {
        id: `dom-${i}`,
        text: `DOM元素 ${i + 1}`,
        _largeData: new Array(20000).fill(`DOM关联数据-${i}`)
      };

      newElements.push(elementData);
      domReferencesRef.current.push(elementData);
    }

    setDomElements(newElements);

    // 模拟移除DOM元素但保留JavaScript引用
    setTimeout(() => {
      setDomElements([]);
      addLog('DOM元素已从页面移除，但JavaScript仍持有引用');
    }, 1000);

    addLog('❌ 已创建DOM引用泄漏：20个元素，每个关联约80KB数据');
    addLog('泄漏原因：DOM元素已移除但JavaScript仍持有引用');
  }, [addLog]);

  const fixDomLeak = useCallback(() => {
    try {
      domReferencesRef.current.forEach(element => {
        if (element._largeData) {
          element._largeData = null;
        }
      });

      domReferencesRef.current = [];
      setDomElements([]);
      addLog('✅ 已清理所有DOM引用泄漏');
    } catch (error) {
      addLog(`清理DOM引用泄漏时出错: ${error.message}`);
    }
  }, [addLog]);

  // =============================================================================
  // 分析内存使用
  // =============================================================================

  const analyzeMemory = useCallback(() => {
    addLog('🔍 内存分析报告:');
    addLog('================');
    
    addLog(`全局变量泄漏: ${globalLeaksRef.current.length} 个`);
    addLog(`事件监听器泄漏: ${eventElementsRef.current.length} 个`);
    addLog(`定时器泄漏: ${timersRef.current.length} 个`);
    addLog(`闭包泄漏: ${closureFunctionsRef.current.length} 个`);
    addLog(`DOM引用泄漏: ${domReferencesRef.current.length} 个`);

    const estimatedLeak = 
      globalLeaksRef.current.length * 10 +
      eventElementsRef.current.length * 0.01 +
      timersRef.current.length * 0.2 +
      closureFunctionsRef.current.length * 0.8 +
      domReferencesRef.current.length * 0.08;

    addLog(`估计泄漏内存: ~${estimatedLeak.toFixed(2)} MB`);

    if (estimatedLeak > 5) {
      addLog('⚠️ 检测到大量内存泄漏，建议立即清理');
    } else if (estimatedLeak > 1) {
      addLog('⚠️ 检测到中等内存泄漏，建议关注');
    } else {
      addLog('✅ 内存使用情况良好');
    }
  }, [addLog]);

  return {
    // 状态
    eventElements,
    timerCount,
    domElements,
    
    // 全局变量泄漏
    createGlobalLeak,
    fixGlobalLeak,
    
    // 事件监听器泄漏
    createEventLeak,
    fixEventLeak,
    
    // 定时器泄漏
    createTimerLeak,
    fixTimerLeak,
    
    // 闭包泄漏
    createClosureLeak,
    fixClosureLeak,
    
    // DOM引用泄漏
    createDomLeak,
    fixDomLeak,
    
    // 分析
    analyzeMemory
  };
};
