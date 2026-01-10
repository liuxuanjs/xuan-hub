---
aliases: ["移除console", "console配置", "terser配置"]
title: "生产环境移除Console配置"
tags: ["Vite", "Webpack", "构建优化", "terser"]
updated: 2025-01-10
---

## 定义

通过构建工具配置 terser 的 `drop_console` 选项，在生产环境构建时完全移除所有 console 语句（log、info、debug、warn、error）。

## 核心要点

- **Vite 6**：内置 terser，无需安装依赖
- **Vite 4/5**：需手动安装 `terser` 包
- **Webpack 5**：内置 `terser-webpack-plugin`，无需安装
- **Webpack 4**：需安装 `uglifyjs-webpack-plugin`
- **作用范围**：仅在 `build` 时生效，`dev` 模式不受影响

## 示例代码

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

### Webpack 5 配置

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],
  },
}
```

## 速查命令

```bash
# 查看项目构建工具版本
cat package.json | grep -E "(vite|webpack)"

# Vite 4/5 安装 terser
pnpm add -D terser

# Webpack 4 安装压缩插件
pnpm add -D uglifyjs-webpack-plugin

# 构建并验证 console 已移除
pnpm build && cat dist/assets/*.js | grep "console" | head -5
# 无输出表示配置成功
```

## 相关链接

- [Vite 构建配置文档](https://vitejs.dev/config/build-options.html)
- [terser 压缩选项](https://terser.org/docs/api-reference#compress-options)
- [[环境变量统一管理规范]]
