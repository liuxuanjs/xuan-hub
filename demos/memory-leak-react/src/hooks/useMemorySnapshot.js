import { useState, useCallback, useRef } from 'react';
import { getSnapshotService } from '../core/services/SnapshotService';

/**
 * 内存快照 Hook
 * 提供内存快照拍摄和对比功能
 *
 * @returns {object} 快照状态和操作方法
 */
export const useMemorySnapshot = () => {
  const snapshotService = useRef(getSnapshotService()).current;
  const [snapshots, setSnapshots] = useState([]);
  const [selectedIds, setSelectedIds] = useState([null, null]);
  const [comparison, setComparison] = useState(null);

  /**
   * 检查是否支持
   */
  const isSupported = snapshotService.isSupported();

  /**
   * 拍摄快照
   */
  const takeSnapshot = useCallback((label = '') => {
    const snapshot = snapshotService.takeSnapshot(label);
    if (snapshot) {
      setSnapshots(snapshotService.getAllSnapshots());
    }
    return snapshot;
  }, [snapshotService]);

  /**
   * 选择快照进行对比
   * @param {string} id - 快照ID
   * @param {number} position - 0 或 1，表示选择的位置
   */
  const selectSnapshot = useCallback((id, position) => {
    setSelectedIds(prev => {
      const newIds = [...prev];
      newIds[position] = id;
      return newIds;
    });
  }, []);

  /**
   * 对比选中的两个快照
   */
  const compareSelected = useCallback(() => {
    if (selectedIds[0] && selectedIds[1]) {
      const result = snapshotService.compare(selectedIds[0], selectedIds[1]);
      setComparison(result);
      return result;
    }
    return null;
  }, [selectedIds, snapshotService]);

  /**
   * 删除快照
   */
  const deleteSnapshot = useCallback((id) => {
    snapshotService.deleteSnapshot(id);
    setSnapshots(snapshotService.getAllSnapshots());

    // 如果删除的快照被选中，清除选择
    setSelectedIds(prev => prev.map(selectedId => selectedId === id ? null : selectedId));

    // 清除对比结果
    if (comparison && (comparison.snapshot1?.id === id || comparison.snapshot2?.id === id)) {
      setComparison(null);
    }
  }, [snapshotService, comparison]);

  /**
   * 清空所有快照
   */
  const clearAllSnapshots = useCallback(() => {
    snapshotService.clearAll();
    setSnapshots([]);
    setSelectedIds([null, null]);
    setComparison(null);
  }, [snapshotService]);

  /**
   * 获取单个快照
   */
  const getSnapshot = useCallback((id) => {
    return snapshotService.getSnapshot(id);
  }, [snapshotService]);

  return {
    // 状态
    snapshots,
    selectedIds,
    comparison,
    isSupported,

    // 操作
    takeSnapshot,
    selectSnapshot,
    compareSelected,
    deleteSnapshot,
    clearAllSnapshots,
    getSnapshot
  };
};

export default useMemorySnapshot;
