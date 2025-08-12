---
name: "accessibility-standards"
description: "无障碍访问规范和WCAG 2.1指南"
globs: 
  - "**/*.tsx"
  - "**/*.jsx"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "components/**/*.tsx"
  - "components/**/*.jsx"
priority: 600
---

# 无障碍访问规范 (A11y)

你是一个无障碍访问专家。请严格遵循WCAG 2.1 AA标准，确保所有用户都能平等地访问和使用我们的组件。

## 🎯 核心原则 (POUR)

### 可感知 (Perceivable)
- 为非文本内容提供替代文本
- 为多媒体提供字幕和替代方案
- 确保内容可以以不同方式呈现而不丢失信息
- 让用户更容易看到和听到内容

### 可操作 (Operable)
- 所有功能都可以通过键盘访问
- 给用户足够的时间阅读和使用内容
- 不要使用会引起癫痫的内容
- 帮助用户导航和找到内容

### 可理解 (Understandable)
- 让文本可读且可理解
- 让内容以可预测的方式出现和运作
- 帮助用户避免和纠正错误

### 健壮 (Robust)
- 最大化与辅助技术的兼容性
- 使用有效的、语义化的HTML

## 🏷️ 语义化HTML和ARIA

### 语义化标签使用
```typescript
// ✅ 使用语义化HTML标签
function Navigation() {
  return (
    <nav aria-label="主导航">
      <ul>
        <li><a href="/home">首页</a></li>
        <li><a href="/about">关于我们</a></li>
        <li><a href="/contact">联系我们</a></li>
      </ul>
    </nav>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article>
      <header>
        <h2>{article.title}</h2>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </header>
      <main>
        <p>{article.excerpt}</p>
      </main>
      <footer>
        <a href={`/articles/${article.id}`}>阅读全文</a>
      </footer>
    </article>
  );
}

// ✅ 表单语义化
function ContactForm() {
  return (
    <form>
      <fieldset>
        <legend>联系信息</legend>
        
        <div>
          <label htmlFor="name">姓名 *</label>
          <input
            id="name"
            type="text"
            required
            aria-describedby="name-help"
          />
          <div id="name-help">请输入您的真实姓名</div>
        </div>

        <div>
          <label htmlFor="email">邮箱 *</label>
          <input
            id="email"
            type="email"
            required
            aria-describedby="email-help"
            aria-invalid={emailError ? 'true' : 'false'}
          />
          <div id="email-help">我们不会分享您的邮箱地址</div>
          {emailError && (
            <div role="alert" id="email-error">
              {emailError}
            </div>
          )}
        </div>
      </fieldset>
    </form>
  );
}
```

### ARIA 属性规范
```typescript
// ✅ 按钮组件的ARIA属性
interface ButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

function Button({
  children,
  loading = false,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-busy={loading}
      {...props}
    >
      {loading && <span aria-hidden="true">⏳</span>}
      {children}
    </button>
  );
};

// ✅ 模态框的ARIA属性
function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭对话框"
            className="modal-close"
          >
            ×
          </button>
        </header>
        <main className="modal-body">
          {children}
        </main>
      </div>
    </div>
  );
}

// ✅ 标签页组件的ARIA属性
function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      <div role="tablist" aria-label="内容标签页">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## ⌨️ 键盘导航支持

### 键盘事件处理
```typescript
// ✅ 键盘导航支持
function DropdownMenu({ items, onSelect }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="dropdown">
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        菜单 <span aria-hidden="true">▼</span>
      </button>
      
      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          aria-labelledby="menu-button"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              className={focusedIndex === index ? 'focused' : ''}
              onClick={() => onSelect(item)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ✅ 焦点管理
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}
```

### 自定义键盘快捷键
```typescript
// ✅ 键盘快捷键Hook
function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      const handler = shortcuts[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 使用示例
function TextEditor() {
  const [content, setContent] = useState('');

  useKeyboardShortcuts({
    'ctrl+s': () => saveContent(content),
    'ctrl+z': () => undo(),
    'ctrl+y': () => redo(),
    'ctrl+b': () => toggleBold(),
  });

  return (
    <div>
      <div role="toolbar" aria-label="文本格式工具栏">
        <button
          onClick={toggleBold}
          aria-label="粗体 (Ctrl+B)"
          title="粗体 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        aria-label="文本编辑器"
      />
    </div>
  );
}
```

## 🎨 视觉和颜色可访问性

### 颜色对比度
```scss
// ✅ WCAG AA 标准颜色对比度
:root {
  // 正常文本需要 4.5:1 的对比度
  --color-text-primary: #212529;     // 对比度 16.75:1
  --color-text-secondary: #6c757d;   // 对比度 4.54:1
  --color-background: #ffffff;
  
  // 大文本需要 3:1 的对比度
  --color-text-large: #495057;       // 对比度 7.00:1
  
  // 交互元素的对比度
  --color-link: #0d6efd;             // 对比度 5.64:1
  --color-link-hover: #0a58ca;       // 对比度 7.00:1
  
  // 错误和警告颜色
  --color-error: #dc3545;            // 对比度 5.14:1
  --color-warning: #fd7e14;          // 对比度 3.76:1
  --color-success: #198754;          // 对比度 4.68:1
}

// ✅ 焦点指示器
.focusable {
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: 4px;
  }
}

// ✅ 高对比度模式支持
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --color-text-primary: #000000;
    --color-background: #ffffff;
  }
}
```

### 不依赖颜色传达信息
```typescript
// ✅ 状态指示不仅依赖颜色
function StatusIndicator({ status }: { status: 'success' | 'warning' | 'error' }) {
  const statusConfig = {
    success: {
      icon: '✓',
      text: '成功',
      ariaLabel: '操作成功'
    },
    warning: {
      icon: '⚠',
      text: '警告',
      ariaLabel: '需要注意'
    },
    error: {
      icon: '✗',
      text: '错误',
      ariaLabel: '操作失败'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`status-indicator status-${status}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

// ✅ 表单验证不仅依赖颜色
function FormField({ label, error, required, children }: FormFieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={fieldId}>
        {label}
        {required && (
          <span className="required" aria-label="必填项">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? errorId : undefined,
      })}
      
      {error && (
        <div id={errorId} role="alert" className="error-message">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}
    </div>
  );
}
```

## 🔊 屏幕阅读器支持

### 动态内容通知
```typescript
// ✅ 实时区域 (Live Regions)
function LiveRegion({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive' | 'off' 
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// ✅ 通知Hook
function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // 清空以确保重新读取
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  return {
    announce,
    LiveRegion: () => (
      <LiveRegion message={announcement} politeness="polite" />
    )
  };
}

// ✅ 加载状态通知
function DataLoader() {
  const [loading, setLoading] = useState(false);
  const { announce, LiveRegion } = useAnnouncement();

  const loadData = async () => {
    setLoading(true);
    announce('正在加载数据');
    
    try {
      const data = await fetchData();
      announce(`数据加载完成，共 ${data.length} 项`);
    } catch (error) {
      announce('数据加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={loadData} disabled={loading}>
        {loading ? '加载中...' : '加载数据'}
      </button>
      <LiveRegion />
    </div>
  );
}
```

### 屏幕阅读器专用内容
```typescript
// ✅ 屏幕阅读器专用样式
const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span style={srOnlyStyles}>{children}</span>;
}

// ✅ 数据表格的无障碍访问
function AccessibleTable({ data, columns }: TableProps) {
  return (
    <table role="table" aria-label="用户数据表">
      <caption>
        用户列表，共 {data.length} 条记录
        <ScreenReaderOnly>
          使用箭头键导航表格，按回车键排序列
        </ScreenReaderOnly>
      </caption>
      
      <thead>
        <tr role="row">
          {columns.map(column => (
            <th
              key={column.key}
              role="columnheader"
              scope="col"
              aria-sort={getSortDirection(column.key)}
            >
              <button onClick={() => handleSort(column.key)}>
                {column.title}
                <ScreenReaderOnly>
                  {getSortDirection(column.key) === 'none' 
                    ? '点击排序' 
                    : `当前${getSortDirection(column.key) === 'ascending' ? '升序' : '降序'}排列`
                  }
                </ScreenReaderOnly>
              </button>
            </th>
          ))}
        </tr>
      </thead>
      
      <tbody>
        {data.map((row, index) => (
          <tr key={row.id} role="row">
            {columns.map(column => (
              <td key={column.key} role="gridcell">
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 📱 响应式和移动端无障碍访问

### 触摸目标大小
```scss
// ✅ 最小触摸目标大小 44x44px
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  // 确保触摸区域足够大
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-height: 44px;
    min-width: 44px;
  }
}

// ✅ 响应式字体大小
@media (max-width: 768px) {
  body {
    font-size: 16px; // 防止移动端缩放
  }
  
  .small-text {
    font-size: 14px; // 最小可读字体大小
  }
}
```

### 移动端手势支持
```typescript
// ✅ 移动端无障碍访问
function SwipeableCard({ onSwipeLeft, onSwipeRight, children }: SwipeableCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onSwipeLeft?.();
    } else if (isRightSwipe) {
      onSwipeRight?.();
    }
  };

  return (
    <div
      className="swipeable-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // 提供键盘替代方案
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') onSwipeLeft?.();
        if (e.key === 'ArrowRight') onSwipeRight?.();
      }}
      tabIndex={0}
      role="button"
      aria-label="可滑动卡片，使用左右箭头键或滑动手势操作"
    >
      {children}
      
      {/* 为屏幕阅读器提供操作按钮 */}
      <div className="sr-only">
        <button onClick={onSwipeLeft}>向左操作</button>
        <button onClick={onSwipeRight}>向右操作</button>
      </div>
    </div>
  );
}
```

## 🧪 无障碍访问测试

### 自动化测试
```typescript
// ✅ 使用 jest-axe 进行无障碍访问测试
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(<Button loading aria-label="Save document">Save</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-label', 'Save document');
  });
});
```

### 手动测试清单
```typescript
// ✅ 无障碍访问测试清单组件
function A11yTestingChecklist({ component }: { component: string }) {
  const [checklist, setChecklist] = useState([
    { id: 'keyboard', label: '键盘导航测试', checked: false },
    { id: 'screenReader', label: '屏幕阅读器测试', checked: false },
    { id: 'colorContrast', label: '颜色对比度检查', checked: false },
    { id: 'focusManagement', label: '焦点管理测试', checked: false },
    { id: 'ariaLabels', label: 'ARIA 标签检查', checked: false },
    { id: 'semanticHTML', label: '语义化 HTML 检查', checked: false },
  ]);

  const updateChecklist = (id: string, checked: boolean) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked } : item
      )
    );
  };

  return (
    <div className="a11y-checklist">
      <h3>无障碍访问测试清单 - {component}</h3>
      <ul role="list">
        {checklist.map(item => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => updateChecklist(item.id, e.target.checked)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
      
      <div role="status" aria-live="polite">
        已完成 {checklist.filter(item => item.checked).length} / {checklist.length} 项测试
      </div>
    </div>
  );
}
```

## 📋 无障碍访问检查清单

### 开发时检查清单
- [ ] 使用语义化HTML标签
- [ ] 所有交互元素可键盘访问
- [ ] 提供合适的ARIA标签和属性
- [ ] 颜色对比度符合WCAG AA标准
- [ ] 不仅依赖颜色传达信息
- [ ] 提供替代文本和描述
- [ ] 表单有正确的标签关联
- [ ] 错误消息使用role="alert"
- [ ] 动态内容使用live regions
- [ ] 焦点管理正确实现

### 测试检查清单
- [ ] 使用屏幕阅读器测试
- [ ] 仅使用键盘导航测试
- [ ] 高对比度模式测试
- [ ] 缩放到200%测试
- [ ] 移动端触摸测试
- [ ] 自动化无障碍访问测试
- [ ] 真实用户测试

### 工具推荐
- **开发工具**: axe DevTools, Lighthouse, WAVE
- **测试工具**: jest-axe, @testing-library/jest-dom
- **屏幕阅读器**: NVDA (Windows), VoiceOver (Mac), TalkBack (Android)
- **颜色工具**: WebAIM Contrast Checker, Colour Contrast Analyser
