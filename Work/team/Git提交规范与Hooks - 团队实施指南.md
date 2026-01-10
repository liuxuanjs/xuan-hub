---
aliases: ["Git规范", "Commit规范", "Husky配置", "commitlint"]
title: "操作手册：Git提交规范与Hooks"
tags: ["操作手册", "Git", "Husky", "commitlint", "lint-staged"]
updated: 2025-01-10
---

## 概览

| 项目 | 说明 |
|------|------|
| **目标** | 统一 Commit Message 格式，规范分支命名，自动化代码检查 |
| **预计时长** | 10 分钟 |
| **风险等级** | 低 |
| **回滚难度** | 简单（删除 .husky 目录即可） |

### 前提条件

- [ ] 项目使用 Git 版本管理
- [ ] Node 18.x（必须）
- [ ] 使用 pnpm 作为包管理器

## 执行清单

- [ ] 步骤1：安装 @be-link/be-link-husky
- [ ] 步骤2：配置 package.json prepare 脚本
- [ ] 步骤3：执行 pnpm install 触发初始化
- [ ] 步骤4：配置 lint-staged（可选）
- [ ] 步骤5：验证分支命名和提交规范

## 规范说明

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

| 字段 | 说明 | 必填 |
|------|------|------|
| type | 提交类型 | 是 |
| scope | 影响范围 | 否 |
| subject | 简短描述（不超过200字符） | 是 |
| body | 详细描述 | 否 |
| footer | 关闭的 issue 等 | 否 |

### 提交类型（type）

| Type | 说明 | 示例 |
|------|------|------|
| feature | 新功能 | `feature(user): 添加用户积分功能` |
| fix | 修复 bug | `fix(order): 修复订单金额计算错误` |
| docs | 文档更新 | `docs(readme): 更新安装说明` |
| style | 代码格式 | `style(button): 调整按钮样式` |
| refactor | 重构 | `refactor(api): 重构用户API` |
| perf | 性能优化 | `perf(list): 优化列表渲染性能` |
| test | 测试相关 | `test(utils): 添加工具函数测试` |
| chore | 构建/工具 | `chore(deps): 升级依赖版本` |
| revert | 回滚 | `revert: 回滚feature(user)提交` |

### 分支命名格式

```
<花名>/<type>-<branch-name>
```

| 分支类型 | 示例 |
|----------|------|
| feature | `zhangsan/feature-user-login` |
| fix | `lisi/fix-payment-error` |
| hotfix | `wangwu/hotfix-critical-bug` |
| refactor | `zhangsan/refactor-api-structure` |

特殊分支（无需花名前缀）：`develop`、`release`、`main`、`master`

命名规则：
- 花名和分支名全小写
- 使用中划线 `-` 连接单词
- type 使用完整单词（feature 而非 feat）

## 操作步骤

### 阶段一：安装依赖

```bash
cd /path/to/your/project

# 安装 husky 初始化工具
pnpm add -D @be-link/be-link-husky
```

### 阶段二：配置 package.json

```json
{
  "scripts": {
    "prepare": "be-link-husky"
  }
}
```

### 阶段三：执行初始化

```bash
# 触发 prepare 脚本
pnpm install
```

**预期输出**：

```
> be-link-husky

Installing dependencies...
Husky installed
Created .husky/commit-msg
Created .husky/pre-commit
Created commitlint.config.js
```

工具会自动：
1. 安装依赖（husky、lint-staged、@commitlint/cli、@be-link/commitlint-config）
2. 创建 `.husky` 目录和钩子文件
3. 创建 `commitlint.config.js`

### 阶段四：配置 lint-staged（可选）

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,less}": ["prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 验证检查表

| 检查项 | 预期结果 | 实际结果 | 状态 |
|--------|----------|----------|------|
| `.husky` 目录存在 | 存在 | | |
| `commit-msg` 钩子存在 | 存在 | | |
| `pre-commit` 钩子存在 | 存在 | | |
| 不规范提交被拦截 | 报错提示 | | |
| 规范提交成功 | 提交成功 | | |

**验证命令**

```bash
# 测试分支命名校验（使用你的花名）
git checkout -b zhangsan/feature-test-feature
# 预期：成功

git checkout -b feature/test
# 预期：被拦截

# 测试 Commit Message 校验
echo "test" > test.txt && git add test.txt

git commit -m "update"
# 预期：被拦截

git commit -m "feature: 添加测试功能"
# 预期：成功
```

**自检脚本**

```bash
echo "=== Git Hooks 配置检查 ==="
echo "1. .husky目录存在: $(test -d .husky && echo 'OK' || echo 'FAIL')"
echo "2. commit-msg钩子存在: $(test -f .husky/commit-msg && echo 'OK' || echo 'FAIL')"
echo "3. pre-commit钩子存在: $(test -f .husky/pre-commit && echo 'OK' || echo 'FAIL')"
echo "4. commitlint.config.js存在: $(test -f commitlint.config.js && echo 'OK' || echo 'FAIL')"
echo "5. prepare脚本配置: $(grep -q '\"prepare\"' package.json && echo 'OK' || echo 'FAIL')"
```

## 回滚方案

### 触发条件

- Git Hooks 与项目流程冲突
- 紧急情况需要跳过检查

### 回滚步骤

```bash
# 1. 删除 husky 配置
rm -rf .husky

# 2. 删除 commitlint 配置
rm commitlint.config.js

# 3. 移除 prepare 脚本
# 编辑 package.json，删除 "prepare": "be-link-husky"
```

### 临时跳过（紧急情况）

```bash
# 跳过所有钩子
git commit --no-verify -m "feature: 紧急修复"

# 禁用 husky（单次命令）
HUSKY=0 git commit -m "feature: xxx"
```

## 常见问题

### Q1: 为什么我的 commit 被拦截了

**解决**：检查 commit message 格式

```bash
# 常见错误
# type may not be empty → 缺少 type
# subject may not be empty → 缺少描述
# type must be one of [type-enum] → type 不在允许列表中

# 正确格式
git commit -m "feature: 添加用户登录功能"
```

### Q2: 分支命名不规范怎么办

**解决**：重命名分支

```bash
# 重命名当前分支
git branch -m zhangsan/feature-correct-name

# 如果已推送到远程
git push origin :old-branch-name
git push origin zhangsan/feature-correct-name
git push origin -u zhangsan/feature-correct-name
```

### Q3: Husky 没有安装

**解决**：

```bash
# 确保依赖已安装
pnpm install

# 手动运行
pnpm prepare

# 检查 package.json 中是否有 prepare 脚本
```

### Q4: CI/CD 环境报错

**解决**：在 CI 环境禁用 Husky

```bash
HUSKY=0 pnpm install
```

或在 package.json 中配置：

```json
{
  "scripts": {
    "prepare": "test -n \"$CI\" || be-link-husky"
  }
}
```

### Q5: 多个 type 怎么写

**解决**：一个 commit 只能有一个 type，拆分为多个 commit

```bash
# 错误
git commit -m "feature,fix: 添加功能并修复bug"

# 正确
git commit -m "feature: 添加新功能"
git add .
git commit -m "fix: 修复相关bug"
```

## 使用示例

### 日常开发流程

```bash
# 1. 创建功能分支
git checkout -b zhangsan/feature-user-profile

# 2. 开发功能
# ...

# 3. 提交代码
git add .
git commit -m "feature(user): 添加用户资料页面

- 新增用户信息展示
- 新增编辑功能
- 优化页面布局"

# 4. 推送到远程
git push origin zhangsan/feature-user-profile
```

### Bug 修复流程

```bash
git checkout -b lisi/fix-login-error
# 修复...
git add .
git commit -m "fix(auth): 修复登录失败的问题

修复了token过期时的错误处理逻辑

Closes #123"
```

## 参考资料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [commitlint 文档](https://commitlint.js.org/)
- [[ESLint与TypeScript规范 - 团队实施指南]]
