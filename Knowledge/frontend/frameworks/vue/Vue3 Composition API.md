---
aliases: ["Composition API", "组合式API", "setup"]
title: "Vue3 Composition API"
tags: ["Vue3", "Composition API", "面试高频"]
updated: 2025-01-09
---

## 核心概念

**Composition API**：Vue3 新增的代码组织方式，按功能组织代码，而非按选项（data/methods/computed）。

**核心优势**：
- 逻辑复用更灵活（组合式函数）
- 更好的 TypeScript 支持
- 代码组织更清晰

## Options API vs Composition API

### 代码组织对比

```
Options API（按选项分散）        Composition API（按功能聚合）
┌────────────────────┐         ┌────────────────────┐
│ data() {           │         │ // 功能A：用户相关  │
│   return {         │         │ const user = ref() │
│     user: null,    │         │ const fetchUser = ()│
│     posts: [],     │         │ watchEffect(...)   │
│     count: 0       │         │                    │
│   }                │         │ // 功能B：帖子相关  │
│ }                  │         │ const posts = ref()│
│                    │         │ const loadPosts = ()│
│ methods: {         │         │                    │
│   fetchUser(),     │         │ // 功能C：计数器    │
│   loadPosts(),     │         │ const count = ref()│
│   increment()      │         │ const increment = ()│
│ }                  │         │                    │
│                    │         │                    │
│ computed: {...}    │         │                    │
│ watch: {...}       │         │                    │
└────────────────────┘         └────────────────────┘
```

### 代码示例对比

```javascript
// Options API
export default {
  data() {
    return {
      count: 0,
      doubleCount: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  watch: {
    count(newVal) {
      console.log('count changed:', newVal);
    }
  },
  mounted() {
    console.log('mounted');
  }
};

// Composition API
import { ref, computed, watch, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);

    const doubleCount = computed(() => count.value * 2);

    const increment = () => {
      count.value++;
    };

    watch(count, (newVal) => {
      console.log('count changed:', newVal);
    });

    onMounted(() => {
      console.log('mounted');
    });

    return { count, doubleCount, increment };
  }
};
```

---

## setup 函数

### 基本用法

```javascript
export default {
  props: ['title'],
  setup(props, context) {
    // props 是响应式的，不能解构
    console.log(props.title);

    // context 包含 attrs、slots、emit、expose
    const { attrs, slots, emit, expose } = context;

    // 返回值暴露给模板
    return {
      // ...
    };
  }
};
```

### setup 语法糖（`<script setup>`）

```vue
<script setup>
import { ref, computed } from 'vue';

// 直接声明，自动暴露给模板
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

// props
const props = defineProps({
  title: String
});

// emit
const emit = defineEmits(['update', 'delete']);

// 暴露给父组件（ref 调用）
defineExpose({
  reset: () => count.value = 0
});
</script>

<template>
  <div>{{ count }} - {{ doubleCount }}</div>
</template>
```

---

## 响应式 API

### ref

```javascript
import { ref, isRef, unref } from 'vue';

// 创建响应式引用
const count = ref(0);
const user = ref({ name: 'test' });

// 访问/修改需要 .value
count.value++;
user.value.name = 'new';

// 模板中自动解包
// <div>{{ count }}</div>  无需 .value

// 工具函数
isRef(count);  // true
unref(count);  // 0（如果是 ref 返回 .value，否则返回自身）
```

### reactive

```javascript
import { reactive, isReactive, toRaw } from 'vue';

// 创建响应式对象
const state = reactive({
  count: 0,
  user: { name: 'test' }
});

// 直接访问/修改
state.count++;
state.user.name = 'new';

// 工具函数
isReactive(state);  // true
toRaw(state);       // 返回原始对象（非响应式）
```

### toRef / toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue';

const state = reactive({ count: 0, name: 'test' });

// toRef：为单个属性创建 ref
const countRef = toRef(state, 'count');
countRef.value++;  // state.count 也会变

// toRefs：为所有属性创建 ref
const { count, name } = toRefs(state);
count.value++;  // state.count 也会变
```

### shallowRef / shallowReactive

```javascript
import { shallowRef, shallowReactive } from 'vue';

// 浅层响应式：只有顶层是响应式的
const state = shallowReactive({
  nested: { count: 0 }
});

state.nested = { count: 1 };  // 触发更新
state.nested.count++;          // 不触发更新！

// shallowRef：只有 .value 的赋值触发更新
const obj = shallowRef({ count: 0 });
obj.value.count++;              // 不触发更新！
obj.value = { count: 1 };       // 触发更新
```

---

## computed

```javascript
import { ref, computed } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

// 只读 computed
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// 可写 computed
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`;
  },
  set(value) {
    const [first, last] = value.split(' ');
    firstName.value = first;
    lastName.value = last;
  }
});

fullNameWritable.value = 'Jane Smith';  // 会更新 firstName 和 lastName
```

---

## watch / watchEffect

### watch

```javascript
import { ref, watch } from 'vue';

const count = ref(0);
const user = ref({ name: 'test' });

// 监听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`);
});

// 监听多个源
watch([count, user], ([newCount, newUser], [oldCount, oldUser]) => {
  // ...
});

// 监听 getter
watch(
  () => user.value.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} → ${newName}`);
  }
);

// 深度监听
watch(user, (newVal, oldVal) => {
  // ...
}, { deep: true });

// 立即执行
watch(count, callback, { immediate: true });
```

### watchEffect

```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);
const name = ref('test');

// 自动追踪依赖，立即执行
const stop = watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`);
});

// 停止监听
stop();

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {}, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });
});
```

### watch vs watchEffect

| 对比 | watch | watchEffect |
|------|-------|-------------|
| 依赖声明 | 显式指定 | 自动收集 |
| 立即执行 | 默认否（可配置） | 默认是 |
| 访问旧值 | 可以 | 不可以 |
| 适用场景 | 精确控制 | 简单副作用 |

---

## 生命周期

```javascript
import {
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
    onBeforeMount(() => {
      console.log('before mount');
    });

    onMounted(() => {
      console.log('mounted');
    });

    onBeforeUpdate(() => {
      console.log('before update');
    });

    onUpdated(() => {
      console.log('updated');
    });

    onBeforeUnmount(() => {
      console.log('before unmount');
    });

    onUnmounted(() => {
      console.log('unmounted');
    });

    onErrorCaptured((err, instance, info) => {
      console.error(err);
      return false;  // 阻止错误继续传播
    });
  }
};
```

### 生命周期对应关系

| Options API | Composition API |
|-------------|-----------------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |

---

## 组合式函数（Composables）

### 基本示例

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const doubleCount = computed(() => count.value * 2);

  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = initialValue;

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  };
}

// 使用
import { useCounter } from './useCounter';

export default {
  setup() {
    const { count, doubleCount, increment } = useCounter(10);

    return { count, doubleCount, increment };
  }
};
```

### 实用组合式函数

```javascript
// useMouse.js - 鼠标位置
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  const update = (e) => {
    x.value = e.pageX;
    y.value = e.pageY;
  };

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// useFetch.js - 数据获取
import { ref, watchEffect } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  watchEffect(async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(url.value);
      data.value = await res.json();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
```

---

## 常见面试题

### Q1：Composition API 的优势？

1. **逻辑复用**：组合式函数比 mixins 更灵活，无命名冲突
2. **代码组织**：相关逻辑放在一起，不再分散在各个选项中
3. **TypeScript**：更好的类型推断
4. **Tree-shaking**：按需引入，打包体积更小

### Q2：setup 的执行时机？

在 `beforeCreate` 之前执行，此时：
- 没有 `this`（无法访问组件实例）
- props 已解析
- 可以访问 props 和 context

### Q3：ref 和 reactive 怎么选？

| 场景 | 推荐 |
|------|------|
| 基本类型 | ref |
| 对象（不解构） | reactive |
| 对象（需解构） | ref 或 reactive + toRefs |
| 组合式函数返回 | ref（更灵活） |

### Q4：watch 和 watchEffect 怎么选？

- **watchEffect**：简单场景，自动追踪依赖
- **watch**：需要旧值、惰性执行、精确控制依赖

### Q5：如何在 setup 中访问路由？

```javascript
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const goHome = () => router.push('/');
    const currentPath = route.path;

    return { goHome, currentPath };
  }
};
```

## 相关文档

- [[Vue响应式原理]]
- [[Vue组件通信]]
- [[Vue生命周期]]
