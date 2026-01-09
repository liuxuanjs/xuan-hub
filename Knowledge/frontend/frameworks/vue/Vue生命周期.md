---
aliases: ["生命周期", "lifecycle", "钩子函数"]
title: "Vue生命周期"
tags: ["Vue", "生命周期", "面试高频"]
updated: 2025-01-09
---

## 核心结论

| 阶段 | Vue2 | Vue3 Composition API |
|------|------|---------------------|
| 创建前 | beforeCreate | setup() |
| 创建后 | created | setup() |
| 挂载前 | beforeMount | onBeforeMount |
| 挂载后 | mounted | onMounted |
| 更新前 | beforeUpdate | onBeforeUpdate |
| 更新后 | updated | onUpdated |
| 卸载前 | beforeDestroy | onBeforeUnmount |
| 卸载后 | destroyed | onUnmounted |

## 生命周期图示

```
                        ┌────────────────────────────────────┐
                        │           new Vue() / setup()       │
                        └─────────────────┬──────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │         beforeCreate / setup        │
                        │   (初始化事件和生命周期)              │
                        └─────────────────┬──────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │         created / setup             │
                        │   (初始化注入和响应式)               │
                        │   ✅ 可访问 data、methods            │
                        │   ❌ 无法访问 DOM                    │
                        └─────────────────┬──────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │           编译模板                   │
                        └─────────────────┬──────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │       beforeMount / onBeforeMount   │
                        │   (虚拟 DOM 已创建，未挂载)          │
                        └─────────────────┬──────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │         mounted / onMounted         │
                        │   ✅ 可访问 DOM                      │
                        │   ✅ 发起请求、绑定事件              │
                        └─────────────────┬──────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
          ┌─────────▼─────────┐                     ┌───────────▼───────────┐
          │    数据更新时      │                     │      组件卸载时        │
          │                   │                     │                       │
          │ beforeUpdate      │                     │ beforeUnmount        │
          │ onBeforeUpdate    │                     │ onBeforeUnmount      │
          │                   │                     │ (清理定时器、取消订阅)  │
          │       ↓           │                     │                       │
          │                   │                     │         ↓             │
          │ 虚拟DOM重新渲染    │                     │                       │
          │                   │                     │ unmounted             │
          │       ↓           │                     │ onUnmounted           │
          │                   │                     │                       │
          │ updated           │                     └───────────────────────┘
          │ onUpdated         │
          │                   │
          └───────────────────┘
```

---

## Vue2 生命周期

### Options API 写法

```javascript
export default {
  data() {
    return { count: 0 };
  },

  beforeCreate() {
    // ❌ 无法访问 data、methods
    console.log(this.count);  // undefined
  },

  created() {
    // ✅ 可访问 data、methods、computed
    // ❌ 无法访问 DOM（$el、$refs）
    console.log(this.count);  // 0
    // 适合：发起数据请求
    this.fetchData();
  },

  beforeMount() {
    // 虚拟 DOM 已生成，未挂载到页面
    console.log(this.$el);  // undefined
  },

  mounted() {
    // ✅ 可访问 DOM
    console.log(this.$el);  // <div>...</div>
    console.log(this.$refs.myRef);  // DOM 元素
    // 适合：操作 DOM、初始化第三方库
  },

  beforeUpdate() {
    // 数据已变，DOM 未更新
    // 可在此获取更新前的 DOM 状态
  },

  updated() {
    // DOM 已更新
    // ⚠️ 避免在此修改数据，可能导致无限循环
  },

  beforeDestroy() {
    // 组件即将销毁
    // 适合：清理定时器、取消事件监听
    clearInterval(this.timer);
    window.removeEventListener('resize', this.handleResize);
  },

  destroyed() {
    // 组件已销毁
    // 所有子组件也已销毁
  }
};
```

---

## Vue3 生命周期

### Composition API 写法

```javascript
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured
} from 'vue';

export default {
  setup() {
    const count = ref(0);

    // setup 本身 = beforeCreate + created
    console.log(count.value);  // 0
    fetchData();  // 可在此发请求

    onBeforeMount(() => {
      console.log('DOM 即将挂载');
    });

    onMounted(() => {
      console.log('DOM 已挂载');
      // 操作 DOM、初始化第三方库
    });

    onBeforeUpdate(() => {
      console.log('数据变化，DOM 即将更新');
    });

    onUpdated(() => {
      console.log('DOM 已更新');
    });

    onBeforeUnmount(() => {
      console.log('组件即将卸载');
      // 清理工作
    });

    onUnmounted(() => {
      console.log('组件已卸载');
    });

    onErrorCaptured((err, instance, info) => {
      console.error('捕获子组件错误:', err);
      return false;  // 阻止错误继续传播
    });

    return { count };
  }
};
```

### `<script setup>` 写法

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0);

// setup 执行时 = created
fetchData();

onMounted(() => {
  console.log('mounted');
});

onUnmounted(() => {
  console.log('unmounted');
});
</script>
```

---

## 父子组件生命周期顺序

### 挂载阶段

```
父 beforeCreate
父 created
父 beforeMount
  │
  ├── 子 beforeCreate
  ├── 子 created
  ├── 子 beforeMount
  └── 子 mounted
  │
父 mounted
```

**规律**：父组件先创建，子组件先挂载完成

### 更新阶段

```
父 beforeUpdate
  │
  ├── 子 beforeUpdate
  └── 子 updated
  │
父 updated
```

### 卸载阶段

```
父 beforeUnmount
  │
  ├── 子 beforeUnmount
  └── 子 unmounted
  │
父 unmounted
```

### 代码验证

```javascript
// Parent.vue
export default {
  created() { console.log('Parent created'); },
  mounted() { console.log('Parent mounted'); }
};

// Child.vue
export default {
  created() { console.log('Child created'); },
  mounted() { console.log('Child mounted'); }
};

// 输出顺序：
// Parent created
// Child created
// Child mounted
// Parent mounted
```

---

## keep-alive 生命周期

### activated / deactivated

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

```javascript
// Vue2
export default {
  activated() {
    // 从缓存中激活时调用
    console.log('组件被激活');
    this.fetchLatestData();
  },

  deactivated() {
    // 进入缓存时调用
    console.log('组件被缓存');
  }
};

// Vue3 Composition API
import { onActivated, onDeactivated } from 'vue';

onActivated(() => {
  console.log('组件被激活');
});

onDeactivated(() => {
  console.log('组件被缓存');
});
```

### 完整生命周期流程

```
首次进入：
beforeCreate → created → beforeMount → mounted → activated

离开（被缓存）：
deactivated

再次进入：
activated  ← 直接激活，不会重新创建

组件销毁：
deactivated → beforeUnmount → unmounted
```

---

## 各阶段适合做什么

| 生命周期 | 适合做什么 | 不适合做什么 |
|---------|-----------|-------------|
| **created / setup** | 发起请求、初始化数据 | 操作 DOM |
| **mounted** | 操作 DOM、初始化第三方库 | 发起太多请求（影响首屏） |
| **beforeUpdate** | 获取更新前 DOM 状态 | 修改数据 |
| **updated** | 获取更新后 DOM 状态 | 修改数据（死循环） |
| **beforeUnmount** | 清理定时器、取消订阅 | - |
| **activated** | 刷新数据、恢复滚动位置 | - |

### 数据请求放哪里？

```javascript
// ✅ 推荐：created / setup
// 原因：更早发起请求，不依赖 DOM

// Vue2
created() {
  this.fetchData();
}

// Vue3
setup() {
  fetchData();
}

// ⚠️ 如果请求依赖 DOM 尺寸等信息
onMounted(() => {
  const width = container.value.offsetWidth;
  fetchDataByWidth(width);
});
```

---

## 错误处理钩子

### errorCaptured

```javascript
// Vue2
export default {
  errorCaptured(err, component, info) {
    console.error('捕获错误:', err);
    console.log('错误组件:', component);
    console.log('错误信息:', info);

    // 返回 false 阻止错误继续传播
    return false;
  }
};

// Vue3
onErrorCaptured((err, instance, info) => {
  console.error(err);
  return false;
});
```

### 错误传播机制

```
子组件抛出错误
      │
      ▼
父组件 errorCaptured
      │
      ├── return false → 停止传播
      │
      └── return true 或 不返回 → 继续向上传播
            │
            ▼
      祖先组件 errorCaptured
            │
            ▼
      app.config.errorHandler（全局）
```

---

## 常见面试题

### Q1：created 和 mounted 的区别？

| 对比 | created | mounted |
|------|---------|---------|
| DOM | ❌ 无法访问 | ✅ 可以访问 |
| 数据 | ✅ 可以访问 | ✅ 可以访问 |
| 请求 | ✅ 推荐（更早） | 可以但不推荐 |
| 第三方库 | ❌ 不适合 | ✅ 适合 |

### Q2：父子组件 created 和 mounted 的执行顺序？

```
父 created → 子 created → 子 mounted → 父 mounted
```

父组件的 mounted 要等所有子组件都挂载完成。

### Q3：Vue3 移除了哪些生命周期？

- `beforeDestroy` → `onBeforeUnmount`
- `destroyed` → `onUnmounted`

Vue3 认为 "unmount"（卸载）比 "destroy"（销毁）更准确。

### Q4：setup 什么时候执行？

在 `beforeCreate` 之前执行。此时：
- ✅ props 已解析
- ❌ 无法访问 this（没有组件实例）
- ✅ 可以使用 Composition API

### Q5：keep-alive 的生命周期？

- **首次**：正常生命周期 + `activated`
- **离开**：`deactivated`（不触发卸载）
- **再次进入**：只触发 `activated`

### Q6：在哪个生命周期清理定时器？

```javascript
// Vue2
beforeDestroy() {
  clearInterval(this.timer);
}

// Vue3
onBeforeUnmount(() => {
  clearInterval(timer);
});

// 或使用 onUnmounted，效果类似
```

## 相关文档

- [[Vue响应式原理]]
- [[Vue3 Composition API]]
- [[Vue组件通信]]
