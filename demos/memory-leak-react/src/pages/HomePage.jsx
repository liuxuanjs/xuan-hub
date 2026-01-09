import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>🔍 Chrome DevTools Performance 实战演示</h1>
        <p className="hero-subtitle">
          通过5个真实的内存泄漏场景，学会使用 Performance 面板和 Memory 标签页
        </p>
        
        <div className="setup-instructions">
          <h3>🚀 开始前的准备</h3>
          <div className="instruction-card">
            <h4>1. 启动 Chrome 浏览器（重要）</h4>
            <div className="code-block">
              <code>
                # macOS/Linux<br/>
                /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-precise-memory-info --js-flags="--expose-gc"<br/><br/>
                # Windows<br/>
                chrome.exe --enable-precise-memory-info --js-flags="--expose-gc"
              </code>
            </div>
            <p>这些标志可以获得精确的内存数据和垃圾回收功能</p>
          </div>

          <div className="instruction-card">
            <h4>2. 打开 Chrome DevTools</h4>
            <ul>
              <li>按 F12 或右键选择"检查"</li>
              <li>切换到 <strong>Performance</strong> 标签页</li>
              <li>勾选 <strong>Memory</strong> 选项</li>
              <li>可选：勾选 Screenshots 查看页面变化</li>
            </ul>
          </div>

          <div className="instruction-card">
            <h4>3. 学习流程建议</h4>
            <ol>
              <li><strong>选择一个场景</strong> - 从左侧菜单选择要学习的泄漏类型</li>
              <li><strong>录制基线</strong> - 先录制正常状态的性能数据</li>
              <li><strong>制造泄漏</strong> - 点击"创建泄漏"按钮</li>
              <li><strong>观察变化</strong> - 查看 Memory 图表的变化</li>
              <li><strong>深度分析</strong> - 使用 Memory 标签页拍摄堆快照</li>
              <li><strong>修复验证</strong> - 点击"修复泄漏"按钮验证效果</li>
            </ol>
          </div>
        </div>
      </header>

      <section className="scenarios-overview">
        <h2>📚 内存泄漏场景概览</h2>
        <div className="scenarios-grid">
          <ScenarioCard 
            path="/global-leak"
            icon="🌍"
            title="全局变量泄漏"
            description="学习识别意外创建的全局变量如何导致内存无法释放"
            difficulty="初级"
            keyPoints={[
              "意外的全局变量创建",
              "window 对象属性检查",
              "严格模式的重要性"
            ]}
          />

          <ScenarioCard 
            path="/event-leak"
            icon="🎯"
            title="事件监听器泄漏"
            description="了解未正确移除的事件监听器如何阻止对象被垃圾回收"
            difficulty="初级"
            keyPoints={[
              "addEventListener 与 removeEventListener",
              "组件卸载时的清理",
              "事件委托的优势"
            ]}
          />

          <ScenarioCard 
            path="/timer-leak"
            icon="⏰"
            title="定时器泄漏"
            description="掌握定时器泄漏的识别和防范，避免持续的内存增长"
            difficulty="中级"
            keyPoints={[
              "setInterval 与 clearInterval",
              "setTimeout 的正确清理",
              "React useEffect 中的定时器管理"
            ]}
          />

          <ScenarioCard 
            path="/closure-leak"
            icon="🔒"
            title="闭包泄漏"
            description="理解闭包如何意外持有大对象引用，导致内存泄漏"
            difficulty="高级"
            keyPoints={[
              "闭包的内存机制",
              "意外的对象引用",
              "WeakMap 的使用场景"
            ]}
          />

          <ScenarioCard 
            path="/dom-leak"
            icon="📄"
            title="DOM引用泄漏"
            description="学习已移除DOM元素仍被JavaScript引用的问题"
            difficulty="中级"
            keyPoints={[
              "DOM 节点的引用管理",
              "detached DOM 的识别",
              "观察者模式的清理"
            ]}
          />

          <ScenarioCard 
            path="/memory-monitor"
            icon="📊"
            title="内存监控工具"
            description="实时监控内存使用情况，建立性能监控体系"
            difficulty="工具"
            keyPoints={[
              "实时内存监控",
              "性能指标收集",
              "自动化告警系统"
            ]}
          />
        </div>
      </section>

      <section className="learning-resources">
        <h2>📚 学习资源</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <h3>📖 Chrome DevTools 官方文档</h3>
            <p>Google 官方提供的 Chrome DevTools 使用指南，包含最新的功能和最佳实践。</p>
            <a href="https://developers.google.com/web/tools/chrome-devtools/memory-problems" target="_blank" className="resource-link">
              查看官方文档 →
            </a>
          </div>
          <div className="resource-card">
            <h3>🎯 JavaScript 内存管理</h3>
            <p>MDN 上关于 JavaScript 内存管理的详细说明，理解垃圾回收机制。</p>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management" target="_blank" className="resource-link">
              查看 MDN 文档 →
            </a>
          </div>
          <div className="resource-card">
            <h3>🚀 React 性能优化</h3>
            <p>React 官方文档中关于性能优化的指南，包含内存泄漏的防范方法。</p>
            <a href="https://react.dev/learn/render-and-commit" target="_blank" className="resource-link">
              查看 React 文档 →
            </a>
          </div>
        </div>
      </section>

      <section className="learning-tips">
        <h2>💡 学习建议</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>🎯 循序渐进</h3>
            <p>建议按照难度等级学习：初级 → 中级 → 高级。每个场景都包含详细的代码解释和最佳实践。</p>
          </div>
          <div className="tip-card">
            <h3>📊 数据驱动</h3>
            <p>重点关注 Performance 面板中的 Memory 图表变化，学会从数据中识别问题模式。</p>
          </div>
          <div className="tip-card">
            <h3>🔄 反复练习</h3>
            <p>每个场景都可以重复操作，通过多次练习加深对内存泄漏模式的理解。</p>
          </div>
          <div className="tip-card">
            <h3>🛠️ 实际应用</h3>
            <p>学完后尝试在自己的项目中应用这些知识，建立性能监控和优化流程。</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ScenarioCard = ({ path, icon, title, description, difficulty, keyPoints }) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case '初级': return '#10b981';
      case '中级': return '#f59e0b';
      case '高级': return '#ef4444';
      case '工具': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <Link to={path} className="scenario-card">
      <div className="scenario-header">
        <div className="scenario-icon">{icon}</div>
        <span 
          className="difficulty-badge" 
          style={{ backgroundColor: getDifficultyColor(difficulty) }}
        >
          {difficulty}
        </span>
      </div>
      <div className="scenario-body">
        <h3 className="scenario-title">{title}</h3>
        <p className="scenario-description">{description}</p>
      </div>
      <div className="scenario-footer">
        <div className="key-points">
          <strong>关键知识点：</strong>
          <ul>
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
};
