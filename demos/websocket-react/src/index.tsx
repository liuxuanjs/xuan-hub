import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import App from './App';
import { StoreContext, rootStore } from '@/stores/RootStore';
import './styles/global.css';

// 配置 MobX
configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: true,
});

// 创建根元素
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// 渲染应用
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <StoreContext.Provider value={rootStore}>
        <App />
      </StoreContext.Provider>
    </React.StrictMode>
  );
};

renderApp();

// 热更新支持
if ((module as any).hot) {
  (module as any).hot.accept('./App', () => {
    renderApp();
  });
}

// 开发模式下的全局调试
if (process.env.NODE_ENV === 'development') {
  (window as any).stores = rootStore;
}
