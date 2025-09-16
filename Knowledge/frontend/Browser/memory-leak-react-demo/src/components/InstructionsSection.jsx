import React from 'react';

export const InstructionsSection = () => {
  return (
    <div className="instructions-section">
      <h3>📖 使用说明</h3>
      <div className="instructions">
        <h4>如何使用Chrome DevTools检测内存泄漏：</h4>
        <ol>
          <li>打开Chrome DevTools (F12)</li>
          <li>切换到 "Performance" 标签页</li>
          <li>勾选 "Memory" 选项</li>
          <li>点击录制按钮，操作页面后停止录制</li>
          <li>查看内存使用趋势图</li>
        </ol>
        
        <h4>使用Memory标签页：</h4>
        <ol>
          <li>切换到 "Memory" 标签页</li>
          <li>选择 "Heap snapshot" 选项</li>
          <li>点击 "Take snapshot" 按钮</li>
          <li>对比不同时间点的快照，查找内存增长</li>
        </ol>

        <h4>启动Chrome时添加标志以获得更精确的内存信息：</h4>
        <div className="code-block">
          <code>chrome --enable-precise-memory-info --js-flags="--expose-gc"</code>
        </div>

        <h4>项目启动命令：</h4>
        <div className="code-block">
          <code>pnpm dev</code>
        </div>
        
        <h4>React + Vite 版本特性：</h4>
        <ul>
          <li>使用React Hooks进行状态管理</li>
          <li>组件化架构，便于理解和维护</li>
          <li>Vite提供快速的热重载开发体验</li>
          <li>现代化的构建工具链</li>
          <li>TypeScript支持（可选）</li>
        </ul>
      </div>
    </div>
  );
};
