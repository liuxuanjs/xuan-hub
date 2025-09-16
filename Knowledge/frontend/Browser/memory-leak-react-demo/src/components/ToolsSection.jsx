import React from 'react';

export const ToolsSection = ({ 
  onForceGC, 
  onGetReport, 
  onAnalyzeMemory, 
  onUpdateMemory 
}) => {
  const takeHeapSnapshot = () => {
    console.log('📸 要获取堆快照，请：');
    console.log('1. 打开Chrome DevTools (F12)');
    console.log('2. 切换到 Memory 标签页');
    console.log('3. 选择 "Heap snapshot"');
    console.log('4. 点击 "Take snapshot" 按钮');
    console.log('5. 对比不同时间点的快照来分析内存变化');
  };

  return (
    <div className="tools-section">
      <h3>🛠️ 检测工具</h3>
      <div className="tool-buttons">
        <button 
          className="btn btn-warning" 
          onClick={onForceGC}
        >
          强制垃圾回收 (需要 --expose-gc)
        </button>
        <button 
          className="btn btn-info" 
          onClick={takeHeapSnapshot}
        >
          获取堆快照信息
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onAnalyzeMemory}
        >
          分析内存使用
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onGetReport}
        >
          生成性能报告
        </button>
        <button 
          className="btn btn-success" 
          onClick={onUpdateMemory}
        >
          刷新内存信息
        </button>
      </div>
    </div>
  );
};
