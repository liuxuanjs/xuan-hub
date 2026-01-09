## 🎯 目标

在生产环境构建时**完全移除所有console**（包括 log、info、debug、warn、error 等）。

---

## 📌 版本说明

**如何查看项目版本**：

```bash
# 查看Vite版本
cat package.json | grep "vite"
# "vite": "^6.0.0"  → Vite 6
# "vite": "^5.0.0"  → Vite 5
# "vite": "^4.0.0"  → Vite 4

# 查看Webpack版本
cat package.json | grep "webpack"
# "webpack": "^5.0.0"  → Webpack 5
# "webpack": "^4.0.0"  → Webpack 4
```

**依赖对照**：

|项目版本|需要安装的包|说明|
|---|---|---|
|Vite 6|无|✅ 内置terser|
|Vite 4/5|`terser`|需手动安装|
|Webpack 5|无|✅ 内置terser-webpack-plugin|
|Webpack 4|`uglifyjs-webpack-plugin`|需手动安装|

---

## Vite 项目配置

### Vite 6 (推荐)

**无需安装额外依赖**（Vite 6内置terser）

**配置 vite.config.ts**：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Vite 6默认使用esbuild，指定使用terser
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // 生产环境完全移除console
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
      },
    },
  },
})
```

---

### Vite 4/5

**安装依赖**：

```bash
pnpm add -D terser
```

**配置 vite.config.ts**：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    // 使用terser进行压缩
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // 生产环境完全移除console
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
      },
    },
  },
})
```

**说明**：

- Vite 6 内置terser，无需安装
- Vite 4/5 需要手动安装 `terser`
- `drop_console: true` 会移除所有console（log、info、warn、error、debug等）
- 只在 `build` 时生效，`dev` 模式不影响

---

## Webpack 项目配置

### Webpack 5

**无需安装依赖**（Webpack 5内置terser-webpack-plugin）

**配置 webpack.config.js**：

```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  // ... 其他配置
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            // 完全移除console
            drop_console: true,
            // 移除debugger
            drop_debugger: true,
          },
        },
      }),
    ],
  },
}
```

---

### Webpack 4

**安装依赖**：

```bash
pnpm add -D uglifyjs-webpack-plugin
```

**配置 webpack.config.js**：

```javascript
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  // ... 其他配置
  
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            // 完全移除console
            drop_console: true,
            // 移除debugger
            drop_debugger: true,
          },
          warnings: false,
        },
      }),
    ],
  },
}
```

**说明**：

- Webpack 5 内置 `terser-webpack-plugin`，无需安装
- Webpack 4 使用 `uglifyjs-webpack-plugin`，需要手动安装
- `drop_console: true` 会移除所有console
- 只在生产环境构建时生效

---

## 验证

```bash
# 构建生产版本
pnpm build

# 检查打包后的代码是否还有console
cat dist/assets/*.js | grep "console"
# 应该没有输出（已被完全移除）
```