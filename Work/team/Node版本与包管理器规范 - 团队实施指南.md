---
aliases: ["Node版本管理", "pnpm迁移", "volta配置"]
title: "操作手册：Node版本与包管理器规范"
tags: ["操作手册", "Node.js", "pnpm", "volta", "版本管理"]
updated: 2025-01-10
---

## 概览

| 项目 | 说明 |
|------|------|
| **目标** | 统一使用 Node 20.x LTS + pnpm 10.x，通过 volta 管理版本 |
| **预计时长** | 个人环境 15 分钟，项目配置 10 分钟 |
| **风险等级** | 中（涉及依赖重装） |
| **回滚难度** | 中等（需恢复 package-lock.json） |

### 前提条件

- [ ] 有项目的写权限
- [ ] 当前项目代码已提交（无未保存的修改）

### 当前指定版本（2025-01-10）

| 工具 | 版本 |
|------|------|
| Node | 20.19.6 |
| pnpm | 10.26.0 |

## 执行清单

**第一阶段：个人环境**
- [ ] 安装 volta
- [ ] 安装 Node 20 和 pnpm 10
- [ ] 处理旧版本管理工具（nvm）

**第二阶段：项目配置**
- [ ] 修改 package.json（engines + volta）
- [ ] 创建 .npmrc 配置
- [ ] 清理并重新安装依赖
- [ ] 验证项目运行

**第三阶段：提交代码**
- [ ] 提交配置变更

## 第一阶段：个人环境准备

### 环境自检

```bash
echo "=== 当前环境检查 ==="
echo "Node版本: $(node -v 2>/dev/null || echo '未安装')"
echo "npm版本: $(npm -v 2>/dev/null || echo '未安装')"
echo "是否安装nvm: $(which nvm 2>/dev/null || echo '未安装')"
echo "是否安装volta: $(which volta 2>/dev/null || echo '未安装')"
```

### 步骤1：安装 Volta

**macOS/Linux**

```bash
# 安装 volta（必须使用官方脚本）
curl https://get.volta.sh | bash

# 不要使用 brew install volta，会导致 pnpm 版本管理失效

# 让配置生效
source ~/.zshrc   # zsh 用户
source ~/.bashrc  # bash 用户
```

**验证**

```bash
volta --version
# 预期：2.0.1 或更高版本

which volta
# 预期：/Users/xxx/.volta/bin/volta
```

**如果之前用 Homebrew 安装过 volta**

```bash
# 卸载 brew 版本
brew uninstall volta
rm -rf ~/.volta

# 重新用官方脚本安装
curl https://get.volta.sh | bash
source ~/.zshrc
```

### 步骤2：安装 Node 20 和 pnpm 10

```bash
# 安装 Node 20.x 最新稳定版
volta install node@20

# 安装 pnpm 10.x 最新稳定版
volta install pnpm@10
```

**验证**

```bash
node --version   # 预期：v20.x.x
pnpm --version   # 预期：10.x.x

# 确认由 volta 管理
which node       # 预期：/Users/xxx/.volta/bin/node
which pnpm       # 预期：/Users/xxx/.volta/bin/pnpm
```

### 步骤3：处理 nvm（如有）

volta 和 nvm 会冲突，建议移除 nvm：

```bash
# 从 shell 配置中移除 nvm
sed -i.bak '/nvm/d' ~/.zshrc 2>/dev/null
source ~/.zshrc

# 验证
which node
# 应该输出 volta 路径，而非 nvm 路径
```

### 第一阶段完成自检

```bash
NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
PNPM_MAJOR=$(pnpm --version 2>/dev/null | cut -d. -f1)
NODE_PATH=$(which node 2>/dev/null)
IS_VOLTA=$(echo $NODE_PATH | grep -q "volta" && echo "true" || echo "false")

if [ "$NODE_MAJOR" = "20" ] && [ "$PNPM_MAJOR" = "10" ] && [ "$IS_VOLTA" = "true" ]; then
  echo "环境配置成功，可以进入第二阶段"
else
  echo "版本不符合要求，请检查安装步骤"
fi
```

## 第二阶段：项目配置迁移

### 步骤4：修改 package.json

添加以下配置：

```json
{
  "engines": {
    "node": ">=20.19.6 <21",
    "pnpm": ">=10.26.0 <11"
  },
  "volta": {
    "node": "20.19.6",
    "pnpm": "10.26.0"
  },
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

配置说明：
- **engines**：约束版本范围，防止跨大版本
- **volta**：进入项目时自动切换版本（必须使用完整版本号）
- **preinstall**：阻止使用 npm/yarn 安装依赖

### 步骤5：创建 .npmrc

```bash
# .npmrc
enable-pre-post-scripts=true
strict-peer-dependencies=false
auto-install-peers=false
```

### 步骤6：清理并重新安装依赖

```bash
# 删除旧依赖和 npm 锁文件
rm -rf node_modules
rm -f package-lock.json

# 使用 pnpm 安装
pnpm install
```

**可能遇到的问题**

| 问题 | 解决方案 |
|------|----------|
| `ERR_PNPM_PEER_DEP_ISSUES` | `pnpm add <缺失的包>` |
| `Cannot find module 'xxx'` | `pnpm add xxx`（幽灵依赖问题） |

### 步骤7：验证项目运行

```bash
# 启动开发服务器
pnpm dev

# 测试构建
pnpm build

# 检查 dist 目录
ls dist
```

### 第二阶段完成自检

```bash
echo "=== 项目迁移检查 ==="
echo "1. engines配置: $(grep -q '\"engines\"' package.json && echo 'OK' || echo 'FAIL')"
echo "2. volta配置: $(grep -q '\"volta\"' package.json && echo 'OK' || echo 'FAIL')"
echo "3. .npmrc存在: $(test -f .npmrc && echo 'OK' || echo 'FAIL')"
echo "4. package-lock.json已删除: $(test ! -f package-lock.json && echo 'OK' || echo 'FAIL')"
echo "5. pnpm-lock.yaml存在: $(test -f pnpm-lock.yaml && echo 'OK' || echo 'FAIL')"
```

## 第三阶段：提交代码

```bash
git add .
git commit -m "chore: 迁移到pnpm + volta

- 添加 engines 和 volta 配置到 package.json
- 创建 .npmrc 配置文件
- 删除 package-lock.json
- 更新 pnpm-lock.yaml"

git push
```

## 验证检查表

| 检查项 | 预期结果 | 实际结果 | 状态 |
|--------|----------|----------|------|
| `volta --version` | 有输出 | | |
| `node --version` | v20.x.x | | |
| `pnpm --version` | 10.x.x | | |
| `which node` | volta 路径 | | |
| `pnpm install` | 正常安装 | | |
| `pnpm dev` | 正常启动 | | |
| `pnpm build` | 正常构建 | | |

## 回滚方案

### 触发条件

- pnpm 安装失败且无法解决
- 项目无法正常运行

### 回滚步骤

```bash
# 1. 恢复 package.json
git checkout package.json

# 2. 删除 pnpm 相关文件
rm -f pnpm-lock.yaml .npmrc

# 3. 恢复 npm 安装
npm install
```

## 常见问题

### Q1: 其他成员拉代码后会怎样

**A**：
- 如果装了 volta：进入项目自动切换到指定版本
- 如果没装 volta：看到提示 `Use "pnpm install" to install packages`，需要按第一阶段步骤安装

### Q2: CI/CD 怎么配置

**GitHub Actions**

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '20'

- uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Q3: pnpm 命令和 npm 的区别

| npm | pnpm | 说明 |
|-----|------|------|
| `npm install` | `pnpm install` | 安装依赖 |
| `npm install xxx` | `pnpm add xxx` | 添加依赖 |
| `npm uninstall xxx` | `pnpm remove xxx` | 删除依赖 |
| `npm run dev` | `pnpm dev` | 运行脚本（可省略 run） |

### Q4: 为什么 volta 配置必须用完整版本号

volta 的 package.json 配置只支持完整版本号：

```json
// 正确
"volta": { "node": "20.19.6" }

// 错误（不支持）
"volta": { "node": "20" }
```

主版本号语法只在 `volta install node@20` 命令中有效。

### Q5: 如何让不同项目自动切换版本

在每个项目的 package.json 中配置 volta 字段：

```json
// 项目 A
{ "volta": { "node": "20.19.6", "pnpm": "10.26.0" } }

// 项目 B（旧项目）
{ "volta": { "node": "18.20.8", "pnpm": "9.15.0" } }
```

切换目录时 volta 自动切换版本。

### Q6: 如何更新到最新稳定版

```bash
# 更新 volta 管理的版本
volta install node@20
volta install pnpm@10

# 更新 package.json 的 volta 配置
volta pin node
volta pin pnpm

# 提交更新
git add package.json
git commit -m "chore: 更新 Node/pnpm 版本"
```

## 参考资料

- [Volta 官方文档](https://docs.volta.sh/)
- [pnpm 官方文档](https://pnpm.io/)
- [[环境变量统一管理规范]]
