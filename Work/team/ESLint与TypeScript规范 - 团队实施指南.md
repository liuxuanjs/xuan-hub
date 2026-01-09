## 🎯 目标

通过统一的ESLint和TypeScript配置，实现：

- ✅ 统一的代码风格和格式
- ✅ 严格的类型检查，提前发现bug
- ✅ 自动化的代码质量检查
- ✅ 提升代码可维护性和团队协作效率

---

## 📦 核心工具包

### @be-link/eslint-config

**用途**：统一的ESLint、Prettier和TypeScript配置包

**功能**：

- 提供React和Vue两套配置
- 集成TypeScript严格类型检查
- 集成Prettier代码格式化
- 集成多个知名规则包（import、unicorn、promise等）
- 提供标准的tsconfig.json模板

**支持的技术栈**：

- ✅ React + TypeScript + Vite
- ✅ Vue 3 + TypeScript + Vite
- ✅ Node 18.x+（推荐使用volta管理）
- ✅ ESLint 8.x（稳定可靠）
- ✅ Prettier 3.x

---

## 🔧 子项目接入步骤

### 前置条件

- ✅ 项目使用Git版本管理
- ✅ Node 18.x+（推荐使用volta）
- ✅ 使用pnpm作为包管理器
- ✅ 已安装VSCode编辑器

### 步骤1️⃣：安装依赖

```bash
# 进入项目目录
cd /path/to/your/project

# 安装配置包和peer dependencies
pnpm add -D @be-link/eslint-config
pnpm add -D eslint@^8 prettier@^3 typescript@^5
```

---

### 步骤2️⃣：创建配置文件

#### React 项目

**1. 创建 `.eslintrc.js`**：

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

**2. 创建 `tsconfig.json`**：

```json
{
  "extends": "@be-link/eslint-config/tsconfigs/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**3. 创建 `.prettierrc.js`**：

```javascript
// .prettierrc.js
module.exports = {
  ...require('@be-link/eslint-config/.prettierrc'),
}
```

#### Vue 项目

**1. 创建 `.eslintrc.js`**：

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/vue'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

**2. 创建 `tsconfig.json`**：

```json
{
  "extends": "@be-link/eslint-config/tsconfigs/vue.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**3. 创建 `.prettierrc.js`**：

```javascript
// .prettierrc.js
module.exports = {
  ...require('@be-link/eslint-config/.prettierrc'),
}
```

#### 项目特定配置（可选）

**如果需要覆盖某些规则**：

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
  },
  
  // 覆盖特定规则
  rules: {
    'no-console': 'off',  // 允许console
  },
  
  // 忽略特定文件
  ignorePatterns: [
    'generated/**',
    'vendor/**',
  ],
}
```

---

### 步骤3️⃣：配置package.json

**添加lint相关脚本**：

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,vue,css,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

**配置lint-staged**：

```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

---

### 步骤4️⃣：配置VSCode

**创建 `.vscode/settings.json`**：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**创建 `.vscode/extensions.json`**：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar"
  ]
}
```

---

### 步骤5️⃣：验证配置

**运行检查**：

```bash
# 类型检查
pnpm type-check

# ESLint检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

**测试VSCode集成**：

1. 打开一个`.ts`或`.tsx`文件
2. 写一些不规范的代码
3. 按`Ctrl+S`（Mac: `Cmd+S`）保存
4. ✅ 代码应该自动格式化

---

### 🎉 完成自检

```bash
echo "=== ✅ ESLint配置检查 ==="
echo ""
echo "1. .eslintrc.js存在: $(test -f .eslintrc.js && echo '✅' || echo '❌')"
echo "2. tsconfig.json存在: $(test -f tsconfig.json && echo '✅' || echo '❌')"
echo "3. .prettierrc.js存在: $(test -f .prettierrc.js && echo '✅' || echo '❌')"
echo "4. .vscode/settings.json存在: $(test -f .vscode/settings.json && echo '✅' || echo '❌')"
echo "5. lint脚本配置: $(grep -q '\"lint\"' package.json && echo '✅' || echo '❌')"
echo ""
echo "⚠️  接下来请运行 pnpm lint 和 pnpm type-check 测试"
```

---

## ⚠️ 注意事项

### 1. 渐进式修复策略

**老项目迁移时，不要一次性修复所有问题**：

```bash
# ❌ 错误做法
pnpm lint:fix  # 修复所有文件
git commit -m "fix: 修复所有lint问题"  # 改动太大，难以review

# ✅ 正确做法 - 按模块逐步修复
pnpm lint src/pages/user
pnpm lint:fix src/pages/user
git commit -m "refactor(user): 修复用户模块的lint问题"
```

**推荐策略**：

- ✅ **新增代码**：严格遵守规范
- ✅ **修改代码**：只修复当前修改的文件
- ✅ **专项重构**：逐个模块修复

### 2. any 类型的处理

**配置说明**：

- `@typescript-eslint/no-explicit-any` 设置为 `warn`（警告，不阻止提交）
- 老项目存在大量any类型，**不强制要求立即修复**
- 鼓励团队成员在修改代码时**自驱地逐步改善**

**处理建议**：

```typescript
// 情况1：确实不知道类型（临时方案）
const data: any = await api.get('/unknown')  // ⚠️ 会有warning，但不会报错

// 情况2：优先使用unknown（推荐）
const data: unknown = await api.get('/unknown')
if (typeof data === 'object' && data !== null) {
  // 使用类型守卫
}

// 情况3：定义具体类型（最佳实践）
interface UserData {
  id: number
  name: string
}
const data: UserData = await api.get('/user')
```

**原则**：

- ⚠️ any类型会有warning提示，但不会阻止开发
- ✅ 新代码尽量避免使用any
- ✅ 修改老代码时，顺手把any改成具体类型
- ❌ 不需要专门花时间批量修复any

### 3. 禁用规则（谨慎使用）

**仅在必要时禁用**：

```typescript
// 行级禁用（需要说明原因）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyFunction()  // 遗留代码，计划后续重构

// 块级禁用
/* eslint-disable @typescript-eslint/no-explicit-any */
// 一段遗留代码
const data: any = ...
/* eslint-enable @typescript-eslint/no-explicit-any */
```

**禁用规则的场景**：

- ✅ 与第三方库集成，确实无法定义类型
- ✅ 遗留代码，计划后续重构
- ❌ 不要因为懒惰而禁用规则

### 4. 路径别名配置

**确保tsconfig.json和vite.config.ts配置一致**：

**tsconfig.json**：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts**：

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 5. 忽略特定文件

**项目特定的忽略规则**：

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  
  // 忽略特定文件或目录
  ignorePatterns: [
    'generated/**',      // 自动生成的代码
    'vendor/**',         // 第三方代码
    '*.config.js',       // 配置文件（如果不需要检查）
  ],
}
```

**或创建 `.eslintignore` 文件**：

```bash
# .eslintignore
node_modules
dist
build
generated
vendor
*.min.js
```

### 6. CI/CD集成

**在CI中运行检查**：

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
```

### 7. 团队协作

**新成员加入流程**：

```bash
# 1. 克隆项目
git clone <repository>
cd <project>

# 2. 安装依赖
pnpm install

# 3. VSCode会提示安装推荐扩展，点击"Install All"

# 4. 开始开发
pnpm dev
```

**注意**：

- VSCode保存时会自动格式化和修复
- Git提交时会自动运行lint-staged（需要配合Husky）
- 遇到问题先查看"常见问题"部分

---

## 🆘 常见问题

### Q1: ESLint报错"Parsing error"怎么办？

**错误信息**：

```
Parsing error: Cannot read file 'tsconfig.json'
```

**解决方法**：

```javascript
// .eslintrc.js - 明确指定tsconfig路径
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
```

### Q2: VSCode保存时没有自动格式化？

**检查清单**：

```bash
# 1. 检查扩展是否安装
code --list-extensions | grep -E "eslint|prettier"

# 2. 如果没有，安装扩展
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# 3. 检查 .vscode/settings.json 是否配置正确
cat .vscode/settings.json

# 4. 重启VSCode
```

### Q3: 类型检查报错太多怎么办？

**处理策略**：

```bash
# 1. 先统计错误类型
pnpm type-check 2>&1 | grep "error TS" | awk '{print $4}' | sort | uniq -c | sort -rn

# 2. 按模块逐个修复
pnpm type-check | grep "src/pages/user"

# 3. 不要一次性修复所有错误
```

### Q4: 导入路径别名不生效？

**解决方法**：

1. 检查`tsconfig.json`中的`baseUrl`和`paths`配置
2. 检查`vite.config.ts`中的`resolve.alias`配置
3. 重启TypeScript服务：`VSCode命令面板 -> TypeScript: Restart TS Server`

### Q5: React Hooks依赖检查太严格？

**错误示例**：

```typescript
useEffect(() => {
  fetchData()
}, [])
// ⚠️ React Hook useEffect has a missing dependency: 'fetchData'
```

**推荐解决方法**：

```typescript
const fetchData = useCallback(() => {
  // fetch logic
}, [/* dependencies */])

useEffect(() => {
  fetchData()
}, [fetchData])
```

**确实不需要依赖时**：

```typescript
useEffect(() => {
  fetchData()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])  // 只在mount时执行
```

### Q6: Prettier和ESLint冲突怎么办？

**不会冲突**：

配置包已经集成了`eslint-config-prettier`，会自动关闭冲突的规则。

如果还是遇到冲突，检查是否正确继承了配置：

```bash
cat .eslintrc.js
# 应该包含：extends: ['@be-link/eslint-config/react']
```

### Q7: 如何在开发时临时禁用ESLint？

**方法**：

```bash
# 跳过lint检查（仅开发调试时）
ESLINT_NO_DEV_ERRORS=true pnpm dev

# 提交时跳过检查（不推荐）
git commit --no-verify
```

⚠️ **不推荐**：应该修复问题而不是绕过检查

### Q8: 如何覆盖配置包的某些规则？

**在项目的 `.eslintrc.js` 中覆盖**：

```javascript
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  
  // 覆盖规则
  rules: {
    'no-console': 'off',                              // 允许console
    '@typescript-eslint/no-unused-vars': 'warn',     // 改为警告
    'import/order': 'off',                           // 关闭导入排序
  },
}
```

---

## ✅ 验收标准

**配置完成**：

- [ ] `@be-link/eslint-config` 已安装
- [ ] `.eslintrc.js` 已创建（React或Vue配置）
- [ ] `tsconfig.json` 已创建并extends正确的模板
- [ ] `.prettierrc.js` 已创建
- [ ] `.vscode/settings.json` 已配置
- [ ] `package.json` 中包含lint相关脚本
- [ ] `lint-staged` 已配置

**功能验证**：

- [ ] `pnpm lint` 能正常运行
- [ ] `pnpm lint:fix` 能自动修复问题
- [ ] `pnpm type-check` 能进行类型检查
- [ ] `pnpm format` 能格式化代码
- [ ] VSCode保存时自动格式化代码
- [ ] Git提交时自动运行lint-staged

**代码质量**：

- [ ] 导入语句自动排序
- [ ] 代码格式统一（缩进、引号、分号等）
- [ ] 没有未使用的变量
- [ ] 新代码尽量避免使用any类型

**团队使用**：

- [ ] 所有成员VSCode配置一致
- [ ] 所有成员理解规范
- [ ] 新成员能快速上手