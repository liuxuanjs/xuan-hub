import React, { useState, useRef, useEffect } from 'react';
import { ScenarioPage } from '../components/ScenarioPage';

export const EventLeakPage = () => {
  const [leakStatus, setLeakStatus] = useState('normal');
  const [eventElements, setEventElements] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const eventHandlersRef = useRef([]);

  const createEventLeak = () => {
    const elements = [];
    const handlers = [];
    
    // 创建多个带有事件监听器的元素
    for (let i = 0; i < 10; i++) {
      const largeData = new Array(50000).fill(`事件数据-${i}`);
      
      // 创建事件处理器，持有大量数据的引用
      const eventHandler = function(event) {
        console.log(`按钮 ${i} 被点击，数据长度:`, largeData.length);
        setClickCount(prev => prev + 1);
        // 这个闭包持有了 largeData 的引用
      };
      
      const element = {
        id: `leak-btn-${i}`,
        text: `泄漏按钮 ${i + 1}`,
        data: largeData,
        handler: eventHandler
      };
      
      // 模拟添加事件监听器到 DOM
      document.addEventListener('click', eventHandler);
      
      elements.push(element);
      handlers.push({ handler: eventHandler, element });
    }
    
    eventHandlersRef.current = handlers;
    setEventElements(elements);
    setLeakStatus('active');
  };

  const fixEventLeak = () => {
    // 清理所有事件监听器
    eventHandlersRef.current.forEach(({ handler }) => {
      document.removeEventListener('click', handler);
    });
    
    // 清理数据引用
    eventHandlersRef.current.forEach(({ element }) => {
      element.data = null;
    });
    
    eventHandlersRef.current = [];
    setEventElements([]);
    setLeakStatus('normal');
    setClickCount(0);
  };

  // 组件卸载时确保清理
  useEffect(() => {
    return () => {
      if (eventHandlersRef.current.length > 0) {
        fixEventLeak();
      }
    };
  }, []);

  const codeExample = {
    problem: `// ❌ 问题代码：事件监听器未清理
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.largeUserData = new Array(100000).fill(props.userData);
  }
  
  componentDidMount() {
    // 添加事件监听器，但没有在卸载时清理
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('click', this.handleOutsideClick);
    
    // 这个监听器持有了组件实例的引用
    this.intervalId = setInterval(() => {
      this.updateUserStatus();
    }, 1000);
  }
  
  handleResize = () => {
    // 这个方法引用了 this.largeUserData
    console.log('窗口大小改变，用户数据长度:', this.largeUserData.length);
  }
  
  handleOutsideClick = (event) => {
    // 即使组件卸载了，这个监听器仍然存在
    if (this.largeUserData) {
      console.log('点击事件，数据:', this.largeUserData[0]);
    }
  }
  
  // ❌ 忘记清理事件监听器！
  // componentWillUnmount() {
  //   // 应该在这里清理所有监听器
  // }
}`,
    
    solution: `// ✅ 修复后的代码
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.largeUserData = new Array(100000).fill(props.userData);
    this.cleanup = []; // 统一管理清理函数
  }
  
  componentDidMount() {
    // 绑定方法并保存引用
    const handleResize = this.handleResize.bind(this);
    const handleOutsideClick = this.handleOutsideClick.bind(this);
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleOutsideClick);
    
    const intervalId = setInterval(() => {
      this.updateUserStatus();
    }, 1000);
    
    // 记录清理函数
    this.cleanup.push(
      () => window.removeEventListener('resize', handleResize),
      () => document.removeEventListener('click', handleOutsideClick),
      () => clearInterval(intervalId)
    );
  }
  
  componentWillUnmount() {
    // ✅ 清理所有事件监听器和定时器
    this.cleanup.forEach(cleanupFn => cleanupFn());
    this.cleanup = [];
    
    // 清理大对象引用
    this.largeUserData = null;
  }
}

// 使用 Hooks 的版本
function UserProfile({ userData }) {
  const largeUserDataRef = useRef(new Array(100000).fill(userData));
  
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小改变');
    };
    
    const handleOutsideClick = (event) => {
      console.log('点击事件');
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleOutsideClick);
    
    // ✅ 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);
}`
  };

  const keyPoints = [
    {
      title: "事件监听器的生命周期",
      description: "添加的事件监听器不会自动清理，即使添加监听器的组件已经卸载，监听器仍然存在并持有回调函数的引用。"
    },
    {
      title: "闭包引用问题",
      description: "事件处理函数通常是闭包，会持有外部作用域的变量引用，包括大对象，导致这些对象无法被垃圾回收。"
    },
    {
      title: "React 组件的清理",
      description: "在 componentWillUnmount 或 useEffect 的返回函数中，必须清理所有添加的事件监听器。"
    },
    {
      title: "事件委托的优势",
      description: "使用事件委托可以减少事件监听器的数量，降低内存泄漏的风险，特别是在处理大量动态元素时。"
    }
  ];

  const performanceTips = [
    "录制 Performance 时观察 Listeners 数量的变化",
    "在 Memory 标签页中查找 'Closure' 对象",
    "使用 getEventListeners() 检查元素的监听器",
    "观察 JS Heap 中的 'system / EventListener' 增长",
    "检查 Bottom-Up 面板中的事件处理函数耗时"
  ];

  return (
    <ScenarioPage
      title="事件监听器泄漏"
      icon="🎯"
      description="学习识别和修复未清理的事件监听器导致的内存泄漏"
      difficulty="初级"
      leakStatus={leakStatus}
      onCreateLeak={createEventLeak}
      onFixLeak={fixEventLeak}
      codeExample={codeExample}
      keyPoints={keyPoints}
      performanceTips={performanceTips}
      nextScenario={{
        path: '/timer-leak',
        icon: '⏰',
        title: '定时器泄漏',
        description: '学习定时器未清理导致的内存泄漏'
      }}
    >
      <div className="event-leak-demo">
        <h3>事件监听器状态</h3>
        {eventElements.length === 0 ? (
          <div className="empty-state">
            <p>🟢 当前没有泄漏的事件监听器</p>
            <p>点击"创建泄漏"按钮开始演示</p>
          </div>
        ) : (
          <div className="event-demo-active">
            <p>🔴 已创建 {eventElements.length} 个带有内存泄漏的事件监听器</p>
            <p>点击计数: {clickCount}</p>
            
            <div className="event-buttons">
              {eventElements.slice(0, 5).map((element) => (
                <button
                  key={element.id}
                  className="demo-button"
                  onClick={() => element.handler({ target: { id: element.id } })}
                >
                  {element.text}
                </button>
              ))}
            </div>
            
            <div className="leak-info">
              <h4>🔍 泄漏分析：</h4>
              <ul>
                <li>每个按钮的事件处理器都持有 50,000 项数据的引用</li>
                <li>即使按钮被移除，document 上的监听器仍然存在</li>
                <li>闭包导致大量数据无法被垃圾回收</li>
                <li>总计约 {(eventElements.length * 50000 * 20 / 1024 / 1024).toFixed(1)} MB 的泄漏数据</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="demo-info">
          <h4>🛠️ DevTools 检测方法：</h4>
          <ol>
            <li><strong>Console 检查</strong>: <code>getEventListeners(document)</code></li>
            <li><strong>Performance 面板</strong>: 观察 Listeners 计数增长</li>
            <li><strong>Memory 面板</strong>: 搜索 'EventListener' 和 'Closure'</li>
            <li><strong>Elements 面板</strong>: 选中元素查看 Event Listeners</li>
          </ol>
        </div>
      </div>
    </ScenarioPage>
  );
};
