---
name: "testing-guidelines"
description: "测试规范和最佳实践指南"
globs: 
  - "**/*.test.tsx"
  - "**/*.test.ts"
  - "**/*.spec.tsx"
  - "**/*.spec.ts"
  - "src/**/*.test.*"
  - "src/**/*.spec.*"
  - "__tests__/**/*"
priority: 700
---

# 测试规范和最佳实践

你是一个测试专家。请严格遵循以下规范，编写全面、可靠、可维护的测试代码。

## 🎯 测试原则

### 测试金字塔
- **单元测试 (70%)**：测试单个函数和组件
- **集成测试 (20%)**：测试组件间的交互
- **端到端测试 (10%)**：测试完整的用户流程

### 测试质量标准
- **可读性**：测试代码应该清晰易懂
- **可靠性**：测试结果应该一致且可重复
- **快速执行**：单元测试应该快速运行
- **独立性**：测试之间不应该相互依赖

## 🧪 单元测试规范

### React 组件测试
```typescript
// ✅ 组件测试模板
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import type { ButtonProps } from './Button.types';

// 测试工具函数
const renderButton = (props: Partial<ButtonProps> = {}) => {
  const defaultProps: ButtonProps = {
    children: 'Test Button',
  };
  
  return render(<Button {...defaultProps} {...props} />);
};

describe('Button Component', () => {
  // 基础渲染测试
  describe('Rendering', () => {
    it('renders with correct text', () => {
      renderButton({ children: 'Click me' });
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderButton({ className: 'custom-class' });
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('applies variant styles correctly', () => {
      renderButton({ variant: 'primary' });
      expect(screen.getByRole('button')).toHaveClass('primary');
    });
  });

  // 交互测试
  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      renderButton({ onClick: handleClick });
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      renderButton({ onClick: handleClick, disabled: true });
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      renderButton({ onClick: handleClick });
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // 状态测试
  describe('States', () => {
    it('shows loading state correctly', () => {
      renderButton({ loading: true });
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('loading');
    });

    it('shows disabled state correctly', () => {
      renderButton({ disabled: true });
      
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('disabled');
    });
  });

  // 无障碍访问测试
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderButton({ loading: true });
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('maintains focus outline', () => {
      renderButton();
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });
  });

  // Ref 转发测试
  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      function TestComponent() {
        const ref = useRef<HTMLButtonElement>(null);
        
        useEffect(() => {
          if (ref.current) {
            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
            expect(ref.current).toHaveTextContent('Button');
          }
        });
        
        return <Button ref={ref}>Button</Button>;
      }
      
      render(<TestComponent />);
    });
  });
});
```

### Hook 测试
```typescript
// ✅ 自定义 Hook 测试
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('returns stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated-value');
    });

    expect(result.current[0]).toBe('updated-value');
    expect(localStorage.getItem('test-key')).toBe(
      JSON.stringify('updated-value')
    );
  });

  it('handles localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // 模拟 localStorage 错误
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('new-value');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error setting localStorage key')
    );
    
    consoleSpy.mockRestore();
  });
});
```

### 工具函数测试
```typescript
// ✅ 纯函数测试
import { formatCurrency, validateEmail, debounce } from './utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('handles different locales', () => {
      expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €');
    });

    it('throws error for invalid input', () => {
      expect(() => formatCurrency(NaN)).toThrow('Invalid number');
      expect(() => formatCurrency(Infinity)).toThrow('Invalid number');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });
});
```

## 🔗 集成测试规范

### 组件集成测试
```typescript
// ✅ 表单集成测试
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from './UserForm';
import { ApiProvider } from '../contexts/ApiContext';

// 模拟 API
const mockApiClient = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
};

const renderUserForm = (props = {}) => {
  return render(
    <ApiProvider client={mockApiClient}>
      <UserForm {...props} />
    </ApiProvider>
  );
};

describe('UserForm Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    
    mockApiClient.createUser.mockResolvedValue({ id: '1', name: 'John Doe' });
    
    renderUserForm({ onSuccess });

    // 填写表单
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // 验证 API 调用
    await waitFor(() => {
      expect(mockApiClient.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    // 验证成功回调
    expect(onSuccess).toHaveBeenCalledWith({ id: '1', name: 'John Doe' });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    
    renderUserForm();

    // 提交空表单
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // 验证错误消息
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    
    mockApiClient.createUser.mockRejectedValue(
      new Error('Email already exists')
    );
    
    renderUserForm();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
```

## 🎭 Mock 和测试替身

### API Mock
```typescript
// ✅ MSW (Mock Service Worker) 设置
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  }),

  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...req.body })
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'not-found') {
      return res(ctx.status(404));
    }
    
    return res(
      ctx.json({ id, name: 'User Name', email: 'user@example.com' })
    );
  }),
];

export const server = setupServer(...handlers);

// 测试设置
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 组件 Mock
```typescript
// ✅ 模拟复杂组件
jest.mock('./ComplexChart', () => {
  return {
    ComplexChart: ({ data, onDataSelect }: any) => (
      <div data-testid="mock-chart">
        <span>Chart with {data.length} items</span>
        <button onClick={() => onDataSelect(data[0])}>
          Select First Item
        </button>
      </div>
    ),
  };
});

// ✅ 模拟 Hook
jest.mock('./useApi', () => ({
  useApi: jest.fn(),
}));

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;

describe('Dashboard Component', () => {
  it('renders loading state', () => {
    mockUseApi.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

## 📊 测试覆盖率和质量

### 覆盖率配置
```json
// jest.config.js
{
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/index.tsx"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "coverageReporters": ["text", "lcov", "html"]
}
```

### 质量指标
```typescript
// ✅ 测试质量检查清单
describe('Component Quality Tests', () => {
  // 1. 边界条件测试
  it('handles empty data', () => {
    render(<DataList data={[]} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  // 2. 错误状态测试
  it('handles error state', () => {
    render(<DataList data={null} error="Failed to load" />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  // 3. 异步操作测试
  it('handles async operations', async () => {
    const promise = Promise.resolve({ data: 'test' });
    
    render(<AsyncComponent promise={promise} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  // 4. 竞态条件测试
  it('handles race conditions', async () => {
    const slowPromise = new Promise(resolve => 
      setTimeout(() => resolve('slow'), 1000)
    );
    const fastPromise = Promise.resolve('fast');

    const { rerender } = render(<AsyncComponent promise={slowPromise} />);
    rerender(<AsyncComponent promise={fastPromise} />);

    await waitFor(() => {
      expect(screen.getByText('fast')).toBeInTheDocument();
    });
  });
});
```

## 🔧 测试工具和配置

### Jest 配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
};
```

### 测试设置文件
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// MSW 设置
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 全局模拟
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 抑制控制台警告
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

## 📋 测试最佳实践清单

### 编写测试时的检查清单
- [ ] 测试名称清晰描述测试内容
- [ ] 使用 AAA 模式（Arrange, Act, Assert）
- [ ] 每个测试只验证一个行为
- [ ] 测试覆盖正常路径和边界情况
- [ ] 使用合适的断言方法
- [ ] 清理副作用和模拟
- [ ] 避免测试实现细节
- [ ] 优先测试用户行为
- [ ] 使用语义化查询方法
- [ ] 异步测试使用 waitFor

### 性能测试原则
- [ ] 单元测试运行时间 < 100ms
- [ ] 避免不必要的渲染
- [ ] 合理使用测试替身
- [ ] 并行运行测试
- [ ] 优化测试设置和清理

### 维护性原则
- [ ] 测试代码遵循相同的代码质量标准
- [ ] 提取通用的测试工具函数
- [ ] 使用工厂函数创建测试数据
- [ ] 保持测试独立性
- [ ] 定期重构测试代码
