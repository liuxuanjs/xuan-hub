---
aliases: ["组件通信", "props", "emit", "provide/inject"]
title: "Vue组件通信"
tags: ["Vue", "组件通信", "面试高频"]
updated: 2025-01-09
---

## 核心结论

| 通信方式 | 适用场景 | Vue2 | Vue3 |
|---------|---------|------|------|
| **props / emit** | 父子通信 | ✅ | ✅ |
| **v-model** | 双向绑定 | ✅ | ✅（支持多个） |
| **provide / inject** | 跨层级 | ✅ | ✅（支持响应式） |
| **ref / expose** | 父访问子 | ✅ | ✅ |
| **$attrs / $listeners** | 属性透传 | ✅ | ✅（合并） |
| **EventBus** | 兄弟/跨组件 | ✅ | ❌（推荐 mitt） |
| **Vuex / Pinia** | 全局状态 | Vuex | Pinia |

## props / emit（父子通信）

### 父传子：props

```vue
<!-- 父组件 -->
<template>
  <Child :message="msg" :count="10" />
</template>

<script setup>
import { ref } from 'vue';
const msg = ref('Hello');
</script>

<!-- 子组件 Child.vue -->
<script setup>
// 声明 props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

console.log(props.message);  // 'Hello'
</script>
```

### 子传父：emit

```vue
<!-- 子组件 -->
<template>
  <button @click="handleClick">点击</button>
</template>

<script setup>
// 声明事件
const emit = defineEmits(['update', 'delete']);

const handleClick = () => {
  emit('update', { id: 1, name: 'test' });
};
</script>

<!-- 父组件 -->
<template>
  <Child @update="handleUpdate" />
</template>

<script setup>
const handleUpdate = (data) => {
  console.log(data);  // { id: 1, name: 'test' }
};
</script>
```

### props 单向数据流

```javascript
// ❌ 直接修改 props
const props = defineProps(['count']);
props.count++;  // 警告：不要修改 props

// ✅ 通知父组件修改
const emit = defineEmits(['update:count']);
emit('update:count', props.count + 1);

// ✅ 使用本地副本
const localCount = ref(props.count);
```

---

## v-model（双向绑定）

### Vue3 v-model

```vue
<!-- 父组件 -->
<template>
  <!-- 单个 v-model -->
  <Child v-model="value" />

  <!-- 等价于 -->
  <Child :modelValue="value" @update:modelValue="value = $event" />

  <!-- 多个 v-model -->
  <Child v-model:title="title" v-model:content="content" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps(['modelValue', 'title', 'content']);
const emit = defineEmits(['update:modelValue', 'update:title', 'update:content']);

// 更新值
const updateValue = (newVal) => {
  emit('update:modelValue', newVal);
};
</script>
```

### Vue2 vs Vue3 对比

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 默认 prop | `value` | `modelValue` |
| 默认事件 | `input` | `update:modelValue` |
| 多个绑定 | 需要 `.sync` | 原生支持 |

```vue
<!-- Vue2 -->
<Child :value="val" @input="val = $event" />
<Child :title.sync="title" />  <!-- .sync 修饰符 -->

<!-- Vue3 -->
<Child v-model="val" />
<Child v-model:title="title" />  <!-- 命名 v-model -->
```

---

## provide / inject（跨层级通信）

### 基本用法

```
组件树结构：
App (provide)
 └─ Parent
     └─ Child
         └─ GrandChild (inject)
```

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue';

const theme = ref('dark');
const updateTheme = (val) => { theme.value = val; };

// 提供数据和方法
provide('theme', theme);           // 响应式
provide('updateTheme', updateTheme);
</script>

<!-- 后代组件（任意层级） -->
<script setup>
import { inject } from 'vue';

// 注入
const theme = inject('theme');              // 响应式 ref
const updateTheme = inject('updateTheme');  // 方法
const config = inject('config', 'default'); // 带默认值

// 使用
console.log(theme.value);  // 'dark'
updateTheme('light');      // 更新祖先的数据
</script>
```

### 使用 Symbol 避免命名冲突

```javascript
// keys.js
export const ThemeKey = Symbol('theme');
export const UserKey = Symbol('user');

// 提供
import { ThemeKey } from './keys';
provide(ThemeKey, theme);

// 注入
import { ThemeKey } from './keys';
const theme = inject(ThemeKey);
```

### Vue2 vs Vue3

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 响应式 | ❌ 默认非响应式 | ✅ 支持响应式 |
| 写法 | Options API | Composition API |

```javascript
// Vue2（非响应式）
export default {
  provide() {
    return {
      theme: this.theme  // 传值，非响应式
    };
  }
};

// Vue3（响应式）
provide('theme', ref('dark'));  // 传 ref，响应式
```

---

## ref / expose（父访问子）

### 获取子组件实例

```vue
<!-- 父组件 -->
<template>
  <Child ref="childRef" />
  <button @click="callChild">调用子组件方法</button>
</template>

<script setup>
import { ref } from 'vue';

const childRef = ref(null);

const callChild = () => {
  // 访问子组件暴露的内容
  childRef.value.reset();
  console.log(childRef.value.count);
};
</script>

<!-- 子组件 -->
<script setup>
import { ref } from 'vue';

const count = ref(0);
const reset = () => { count.value = 0; };

// 选择性暴露（默认不暴露任何内容）
defineExpose({
  count,
  reset
});
</script>
```

### Vue2 vs Vue3

```javascript
// Vue2：默认暴露所有
this.$refs.child.anyMethod();
this.$refs.child.anyData;

// Vue3：默认不暴露，需要 defineExpose
// 更安全，更明确的组件边界
```

---

## EventBus（兄弟通信）

### Vue2 EventBus

```javascript
// eventBus.js
import Vue from 'vue';
export const EventBus = new Vue();

// 组件 A：发送
EventBus.$emit('userLogin', { id: 1, name: 'test' });

// 组件 B：监听
EventBus.$on('userLogin', (user) => {
  console.log(user);
});

// 组件销毁时移除监听
beforeDestroy() {
  EventBus.$off('userLogin');
}
```

### Vue3 使用 mitt

```javascript
// eventBus.js
import mitt from 'mitt';
export const emitter = mitt();

// 组件 A：发送
import { emitter } from './eventBus';
emitter.emit('userLogin', { id: 1, name: 'test' });

// 组件 B：监听
import { emitter } from './eventBus';
import { onMounted, onUnmounted } from 'vue';

const handler = (user) => {
  console.log(user);
};

onMounted(() => {
  emitter.on('userLogin', handler);
});

onUnmounted(() => {
  emitter.off('userLogin', handler);
});
```

---

## $attrs / $listeners（属性透传）

### 基本概念

```
组件树：
GrandParent
  └─ Parent（透传层，不使用这些属性）
      └─ Child（实际使用属性）
```

`$attrs`：父组件传递但子组件未声明为 props 的属性
`$listeners`：父组件绑定的事件监听器（Vue2）

### Vue2 写法

```vue
<!-- GrandParent.vue -->
<template>
  <Parent :title="title" :count="count" @click="handleClick" />
</template>

<!-- Parent.vue（透传层） -->
<template>
  <!-- 透传所有属性和事件给 Child -->
  <Child v-bind="$attrs" v-on="$listeners" />
</template>

<script>
export default {
  // 默认 $attrs 会作为 DOM 属性渲染到根元素
  // 设为 false 可以手动控制绑定位置
  inheritAttrs: false
};
</script>

<!-- Child.vue -->
<script>
export default {
  props: ['title'],  // 只声明 title
  mounted() {
    // count 在 $attrs 中（因为没声明为 prop）
    console.log(this.$attrs);  // { count: 10 }
  }
};
</script>
```

### Vue3 写法

```vue
<!-- Parent.vue（透传层） -->
<template>
  <!-- Vue3：$listeners 合并到 $attrs 中 -->
  <Child v-bind="$attrs" />
</template>

<script setup>
// Vue3 <script setup> 中默认 inheritAttrs: true
// 如需关闭，需要额外的 <script> 块
</script>

<script>
export default {
  inheritAttrs: false
};
</script>

<!-- 或使用 defineOptions（Vue 3.3+） -->
<script setup>
defineOptions({
  inheritAttrs: false
});
</script>
```

### useAttrs（Vue3 Composition API）

```vue
<script setup>
import { useAttrs } from 'vue';

const attrs = useAttrs();

// 访问透传的属性
console.log(attrs.count);
console.log(attrs.onClick);  // 事件也在 attrs 中
</script>
```

### Vue2 vs Vue3 对比

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 属性 | `$attrs` | `$attrs` |
| 事件 | `$listeners` | 合并到 `$attrs` |
| class/style | 不在 `$attrs` 中 | 在 `$attrs` 中 |
| Composition API | - | `useAttrs()` |

### 使用场景

```javascript
// 1. 高阶组件（HOC）：包装组件透传所有属性
// 2. 封装第三方组件：保留原组件的所有 props
// 3. 多层组件：避免逐层传递 props
```

---

## Vuex / Pinia（全局状态）

### Pinia（Vue3 推荐）

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'test'
  }),

  getters: {
    doubleCount: (state) => state.count * 2
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchData() {
      const res = await api.getData();
      this.name = res.name;
    }
  }
});

// 组件中使用
<script setup>
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();

// 解构需要 storeToRefs 保持响应式
const { count, name, doubleCount } = storeToRefs(store);

// actions 可以直接解构
const { increment, fetchData } = store;
</script>
```

### Vuex vs Pinia

| 特性 | Vuex | Pinia |
|------|------|-------|
| mutations | 必须 | ❌ 移除 |
| modules | 需要配置 | 天然模块化 |
| TypeScript | 支持较弱 | 完整支持 |
| 体积 | 较大 | ~1KB |
| Devtools | 支持 | 支持 |

---

## 通信方式选择

```
                    ┌─────────────────────────────────┐
                    │         如何选择通信方式？        │
                    └─────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              父子通信？       跨层级通信？      全局状态？
                    │               │               │
            ┌───────┴───────┐       │               │
            ▼               ▼       ▼               ▼
        简单传值         双向绑定   provide      Pinia
            │               │      /inject
            ▼               ▼
      props/emit        v-model
```

### 最佳实践

| 场景 | 推荐方案 |
|------|---------|
| 父→子传数据 | props |
| 子→父传数据 | emit |
| 表单双向绑定 | v-model |
| 跨多层组件 | provide/inject |
| 全局状态 | Pinia |
| 兄弟组件 | 状态提升 或 Pinia |
| 父调用子方法 | ref + expose |

---

## 常见面试题

### Q1：Vue 组件通信有哪些方式？

1. **props / emit**：父子通信
2. **v-model**：双向绑定
3. **provide / inject**：跨层级
4. **ref / expose**：父访问子
5. **EventBus / mitt**：任意组件
6. **Vuex / Pinia**：全局状态
7. **$attrs / $listeners**：属性透传

### Q2：provide/inject 是响应式的吗？

- **Vue2**：默认非响应式
- **Vue3**：传入 ref/reactive 就是响应式

### Q3：为什么 Pinia 取代了 Vuex？

1. **更简洁**：移除 mutations，直接修改
2. **更好的 TS 支持**：完整类型推断
3. **更轻量**：体积约 1KB
4. **模块化**：每个 store 独立，无需嵌套

### Q4：props 为什么是单向数据流？

1. **可预测性**：数据流向清晰
2. **易于调试**：变化来源明确
3. **解耦**：子组件不依赖父组件实现

### Q5：什么时候用 EventBus，什么时候用 Pinia？

- **EventBus**：简单的事件通知，不需要持久化状态
- **Pinia**：需要共享状态、持久化、或复杂的状态逻辑

## 相关文档

- [[Vue响应式原理]]
- [[Vue3 Composition API]]
- [[Vue生命周期]]
