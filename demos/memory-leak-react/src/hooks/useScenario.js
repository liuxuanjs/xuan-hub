import { useState, useCallback, useRef, useEffect } from 'react';
import { useMemoryLeaks } from './useMemoryLeaks';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { LEAK_STATUS, SCENARIO_TYPES } from '../core/domain/constants';

/**
 * 场景通用 Hook
 * 整合内存泄漏管理和性能监控功能
 *
 * @param {string} scenarioType - 场景类型
 * @returns {object} 场景状态和操作方法
 */
export const useScenario = (scenarioType) => {
  const [leakStatus, setLeakStatus] = useState(LEAK_STATUS.NORMAL);

  // 使用性能监控 Hook
  const {
    memoryInfo,
    isMonitoring,
    logs,
    isSupported,
    startMonitoring,
    stopMonitoring,
    addLog,
    clearLogs,
    forceGarbageCollection,
    updateMemoryInfo
  } = usePerformanceMonitor();

  // 使用内存泄漏 Hook
  const memoryLeaks = useMemoryLeaks(addLog);

  // 场景特定数据
  const [scenarioData, setScenarioData] = useState({});

  /**
   * 获取对应场景的创建/修复函数
   */
  const getLeakFunctions = useCallback(() => {
    const functions = {
      [SCENARIO_TYPES.GLOBAL]: {
        create: memoryLeaks.createGlobalLeak,
        fix: memoryLeaks.fixGlobalLeak
      },
      [SCENARIO_TYPES.EVENT]: {
        create: memoryLeaks.createEventLeak,
        fix: memoryLeaks.fixEventLeak
      },
      [SCENARIO_TYPES.TIMER]: {
        create: memoryLeaks.createTimerLeak,
        fix: memoryLeaks.fixTimerLeak
      },
      [SCENARIO_TYPES.CLOSURE]: {
        create: memoryLeaks.createClosureLeak,
        fix: memoryLeaks.fixClosureLeak
      },
      [SCENARIO_TYPES.DOM]: {
        create: memoryLeaks.createDomLeak,
        fix: memoryLeaks.fixDomLeak
      }
    };

    return functions[scenarioType] || { create: () => {}, fix: () => {} };
  }, [scenarioType, memoryLeaks]);

  /**
   * 创建泄漏
   */
  const createLeak = useCallback(() => {
    const { create } = getLeakFunctions();
    create();
    setLeakStatus(LEAK_STATUS.ACTIVE);
  }, [getLeakFunctions]);

  /**
   * 修复泄漏
   */
  const fixLeak = useCallback(() => {
    const { fix } = getLeakFunctions();
    fix();
    setLeakStatus(LEAK_STATUS.NORMAL);
  }, [getLeakFunctions]);

  /**
   * 重置场景
   */
  const resetScenario = useCallback(() => {
    if (leakStatus === LEAK_STATUS.ACTIVE) {
      fixLeak();
    }
    clearLogs();
    setScenarioData({});
  }, [leakStatus, fixLeak, clearLogs]);

  // 使用 ref 保存最新的状态和函数，避免闭包捕获旧值
  const leakStatusRef = useRef(leakStatus);
  const getLeakFunctionsRef = useRef(getLeakFunctions);

  // 更新 ref
  useEffect(() => {
    leakStatusRef.current = leakStatus;
    getLeakFunctionsRef.current = getLeakFunctions;
  }, [leakStatus, getLeakFunctions]);

  // 组件卸载时自动清理
  useEffect(() => {
    return () => {
      if (leakStatusRef.current === LEAK_STATUS.ACTIVE) {
        const { fix } = getLeakFunctionsRef.current();
        fix();
      }
    };
  }, []);

  return {
    // 状态
    leakStatus,
    isLeakActive: leakStatus === LEAK_STATUS.ACTIVE,
    scenarioData,
    setScenarioData,

    // 泄漏操作
    createLeak,
    fixLeak,
    resetScenario,

    // 内存监控
    memoryInfo,
    isMonitoring,
    isSupported,
    startMonitoring,
    stopMonitoring,
    forceGarbageCollection,
    updateMemoryInfo,

    // 日志
    logs,
    addLog,
    clearLogs,

    // 底层访问（如需要更细粒度控制）
    memoryLeaks
  };
};

export default useScenario;
