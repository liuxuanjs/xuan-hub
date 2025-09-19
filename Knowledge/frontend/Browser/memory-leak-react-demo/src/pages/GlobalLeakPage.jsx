import React, { useState, useRef } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const GlobalLeakPage = () => {
  const [leakStatus, setLeakStatus] = useState('normal');
  const [globalVars, setGlobalVars] = useState([]);
  const leakDataRef = useRef([]);

  const createGlobalLeak = () => {
    // 创建多个全局变量泄漏
    const leakData = [];
    
    for (let i = 0; i < 5; i++) {
      const varName = `accidentalGlobal${i}`;
      const largeData = new Array(100000).fill(`全局数据-${i}-${Date.now()}`);
      
      // 故意创建全局变量（模拟意外情况）
      window[varName] = largeData;
      
      leakData.push({
        name: varName,
        data: largeData,
        size: largeData.length
      });
    }
    
    leakDataRef.current = leakData;
    setGlobalVars(leakData.map(item => ({ name: item.name, size: item.size })));
    setLeakStatus('active');
  };

  const fixGlobalLeak = () => {
    // 清理全局变量
    leakDataRef.current.forEach(item => {
      if (window[item.name]) {
        delete window[item.name];
      }
    });
    
    leakDataRef.current = [];
    setGlobalVars([]);
    setLeakStatus('normal');
  };

  const codeExample = {
    problem: `// ❌ 问题代码：意外创建全局变量
function processUserData(userData) {
  // 忘记声明 var/let/const，创建了全局变量！
  userCache = new Array(100000).fill(userData);
  
  // 在严格模式下这会报错，但非严格模式下会创建全局变量
  processedData = userCache.map(item => ({
    ...item,
    processed: true
  }));
  
  return processedData;
}

// 另一个常见情况：循环中的意外全局变量
function initializeData() {
  for (i = 0; i < 1000; i++) { // 忘记声明 i
    // 每次循环都在修改全局变量 i
    data[i] = createLargeObject();
  }
}`,
    
    solution: `// ✅ 修复后的代码
function processUserData(userData) {
  // 正确声明局部变量
  const userCache = new Array(100000).fill(userData);
  
  const processedData = userCache.map(item => ({
    ...item,
    processed: true
  }));
  
  return processedData;
  // 函数结束后，局部变量会被垃圾回收
}

// 使用严格模式防止意外全局变量
'use strict';

function initializeData() {
  const data = [];
  for (let i = 0; i < 1000; i++) { // 正确声明循环变量
    data[i] = createLargeObject();
  }
  return data;
}`
  };

  const keyPoints = [
    {
      title: "意外全局变量的产生",
      description: "在非严格模式下，忘记使用 var/let/const 声明变量会自动创建全局变量，这些变量不会被垃圾回收。"
    },
    {
      title: "严格模式的重要性",
      description: "使用 'use strict' 可以防止意外创建全局变量，未声明的变量会抛出 ReferenceError。"
    },
    {
      title: "全局变量的检测",
      description: "可以通过 Object.keys(window) 或在 DevTools Console 中检查 window 对象来发现意外的全局变量。"
    },
    {
      title: "内存泄漏的影响",
      description: "全局变量会一直存在于内存中，直到页面卸载，大量的全局变量会导致内存使用持续增长。"
    }
  ];

  const performanceTips = [
    "打开 Performance 面板，勾选 Memory 选项",
    "点击录制按钮，然后点击'创建泄漏'",
    "观察 Memory 图表中的 JS Heap 线条上升",
    "停止录制，检查 Main 线程中的活动",
    "切换到 Memory 标签页，拍摄堆快照",
    "在快照中搜索 'accidentalGlobal' 找到泄漏的对象"
  ];

  return (
    <ScenarioPage
      title="全局变量泄漏"
      icon="🌍"
      description="学习识别和修复意外创建的全局变量导致的内存泄漏"
      difficulty="初级"
      leakStatus={leakStatus}
      onCreateLeak={createGlobalLeak}
      onFixLeak={fixGlobalLeak}
      codeExample={codeExample}
      keyPoints={keyPoints}
      performanceTips={performanceTips}
      nextScenario={{
        path: '/event-leak',
        icon: '🎯',
        title: '事件监听器泄漏',
        description: '学习事件监听器未清理导致的内存泄漏'
      }}
    >
      <div className="global-leak-demo">
        <h3>全局变量状态</h3>
        {globalVars.length === 0 ? (
          <div className="empty-state">
            <p>🟢 当前没有泄漏的全局变量</p>
            <p>点击"创建泄漏"按钮开始演示</p>
          </div>
        ) : (
          <div className="global-vars-list">
            <p>🔴 检测到 {globalVars.length} 个全局变量泄漏：</p>
            {globalVars.map((varInfo, index) => (
              <div key={index} className="global-var-item">
                <span className="var-name">window.{varInfo.name}</span>
                <span className="var-size">({varInfo.size.toLocaleString()} 项)</span>
              </div>
            ))}
            <div className="inspection-tip">
              💡 在 DevTools Console 中输入以下命令查看：
              <code>{`Object.keys(window).filter(key => key.startsWith('accidentalGlobal'))`}</code>
            </div>
          </div>
        )}
        
        <div className="demo-info">
          <h4>📊 如何在 Performance 面板中观察：</h4>
          <ol>
            <li>开始录制 Performance</li>
            <li>点击"创建泄漏"按钮</li>
            <li>等待几秒钟</li>
            <li>停止录制</li>
            <li>观察 Memory 图表中 JS Heap 的增长</li>
          </ol>
        </div>
      </div>
    </ScenarioPage>
  );
};
