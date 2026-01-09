import React from 'react';
import { useMemorySnapshot } from '../../hooks/useMemorySnapshot';
import './MemorySnapshot.css';

/**
 * 内存快照组件
 * 提供快照拍摄、选择和对比功能
 */
export const MemorySnapshot = () => {
  const {
    snapshots,
    selectedIds,
    comparison,
    isSupported,
    takeSnapshot,
    selectSnapshot,
    compareSelected,
    deleteSnapshot,
    clearAllSnapshots
  } = useMemorySnapshot();

  if (!isSupported) {
    return (
      <div className="memory-snapshot memory-snapshot--unsupported">
        <h3>📸 内存快照</h3>
        <p className="memory-snapshot__warning">
          当前浏览器不支持 Memory API。
          <br />
          请使用以下命令启动 Chrome：
          <code>--enable-precise-memory-info</code>
        </p>
      </div>
    );
  }

  const handleTakeSnapshot = () => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    takeSnapshot(`快照 @${timestamp}`);
  };

  return (
    <div className="memory-snapshot">
      <div className="memory-snapshot__header">
        <h3>📸 内存快照</h3>
        <div className="memory-snapshot__actions">
          <button
            onClick={handleTakeSnapshot}
            className="btn btn-primary btn-sm"
          >
            拍摄快照
          </button>
          {snapshots.length > 0 && (
            <button
              onClick={clearAllSnapshots}
              className="btn btn-outline btn-sm"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="memory-snapshot__empty">
          <p>暂无快照</p>
          <p>点击"拍摄快照"开始记录内存状态</p>
        </div>
      ) : (
        <>
          <div className="memory-snapshot__list">
            {snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                className={`memory-snapshot__item ${
                  selectedIds.includes(snapshot.id) ? 'selected' : ''
                }`}
              >
                <div className="memory-snapshot__item-info">
                  <span className="memory-snapshot__item-label">
                    {snapshot.label}
                  </span>
                  <span className="memory-snapshot__item-memory">
                    {snapshot.usedMB} MB
                  </span>
                  <span className="memory-snapshot__item-time">
                    {snapshot.formattedTime}
                  </span>
                </div>
                <div className="memory-snapshot__item-actions">
                  <button
                    onClick={() => selectSnapshot(snapshot.id, 0)}
                    className={`memory-snapshot__select-btn ${
                      selectedIds[0] === snapshot.id ? 'active' : ''
                    }`}
                    title="选为快照A"
                  >
                    A
                  </button>
                  <button
                    onClick={() => selectSnapshot(snapshot.id, 1)}
                    className={`memory-snapshot__select-btn ${
                      selectedIds[1] === snapshot.id ? 'active' : ''
                    }`}
                    title="选为快照B"
                  >
                    B
                  </button>
                  <button
                    onClick={() => deleteSnapshot(snapshot.id)}
                    className="memory-snapshot__delete-btn"
                    title="删除快照"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedIds[0] && selectedIds[1] && (
            <div className="memory-snapshot__compare-section">
              <button
                onClick={compareSelected}
                className="btn btn-success btn-sm memory-snapshot__compare-btn"
              >
                对比快照 A → B
              </button>
            </div>
          )}

          {comparison && (
            <div className="memory-snapshot__result">
              <h4>📊 对比结果</h4>
              <div className="memory-snapshot__result-grid">
                <div className="memory-snapshot__result-item">
                  <span className="label">内存变化</span>
                  <span className={`value ${comparison.diff.isIncrease ? 'increase' : 'decrease'}`}>
                    {comparison.diff.isIncrease ? '+' : ''}{comparison.diff.usedMB} MB
                  </span>
                </div>
                <div className="memory-snapshot__result-item">
                  <span className="label">变化率</span>
                  <span className={`value ${comparison.diff.isIncrease ? 'increase' : 'decrease'}`}>
                    {comparison.diff.isIncrease ? '+' : ''}{comparison.diff.percentageChange}%
                  </span>
                </div>
                <div className="memory-snapshot__result-item">
                  <span className="label">时间间隔</span>
                  <span className="value">{comparison.diff.timeFormatted}</span>
                </div>
                <div className="memory-snapshot__result-item">
                  <span className="label">增长速率</span>
                  <span className="value">{comparison.diff.growthRate} KB/s</span>
                </div>
              </div>

              {comparison.diff.isIncrease && parseFloat(comparison.diff.usedMB) > 1 && (
                <div className="memory-snapshot__alert">
                  ⚠️ 检测到显著内存增长，可能存在内存泄漏
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="memory-snapshot__tips">
        <small>💡 提示：在创建泄漏前后分别拍摄快照，然后对比查看内存变化</small>
      </div>
    </div>
  );
};

export default MemorySnapshot;
