import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '🏠 首页', description: '项目概览和使用说明' },
    { path: '/global-leak', label: '🌍 全局变量泄漏', description: '意外创建的全局变量' },
    { path: '/event-leak', label: '🎯 事件监听器泄漏', description: '未清理的事件监听器' },
    { path: '/timer-leak', label: '⏰ 定时器泄漏', description: '未清理的定时器' },
    { path: '/closure-leak', label: '🔒 闭包泄漏', description: '闭包引用大对象' },
    { path: '/dom-leak', label: '📄 DOM引用泄漏', description: '已移除DOM的引用' },
    { path: '/memory-monitor', label: '📊 内存监控', description: '实时内存监控工具' }
  ];

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>🔍 内存泄漏演示</h2>
          <p>Chrome DevTools Performance 实战</p>
        </div>
        
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path} className="nav-link">
                <div className="nav-label">{item.label}</div>
                <div className="nav-description">{item.description}</div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="performance-tips">
            <h4>💡 Performance 面板使用提示</h4>
            <ul>
              <li>✅ 勾选 Memory 选项</li>
              <li>🎬 录制前清理缓存</li>
              <li>👀 观察 JS Heap 变化</li>
              <li>🔍 使用 Memory 标签页对比快照</li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
