## 🎯 目标

通过Git Hooks自动化工具，实现：

- ✅ 统一的提交信息格式（Commit Message）
- ✅ 规范的分支命名
- ✅ 代码提交前的自动检查
- ✅ 提升代码质量和团队协作效率

---

## 📦 核心工具包

### @be-link/commitlint-config

**用途**：统一的commitlint配置包

**功能**：

- 定义commit message格式规范
- 支持9种提交类型（feat、fix、docs等）
- 自动校验提交信息格式

### @be-link/be-link-husky

**用途**：Husky初始化工具包

**功能**：

- 自动安装和配置Husky
- 配置pre-commit和commit-msg钩子
- 校验分支命名规范

**支持的Node版本**：

- ✅ Node 18.x（必须）

---

## 🏷️ 规范说明

### 1. Commit Message 规范

**格式**：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**字段说明**：

- `type`：提交类型（必填）
- `scope`：影响范围（可选）
- `subject`：简短描述（必填，不超过200字符）
- `body`：详细描述（可选）
- `footer`：备注信息（可选，如关闭的issue）

**提交类型（type）**：

|Type|说明|示例|
|---|---|---|
|**feature**|新功能|feature(user): 添加用户积分功能|
|**fix**|修复bug|fix(order): 修复订单金额计算错误|
|**docs**|文档更新|docs(readme): 更新安装说明|
|**style**|代码格式调整|style(button): 调整按钮样式|
|**refactor**|重构|refactor(api): 重构用户API|
|**perf**|性能优化|perf(list): 优化列表渲染性能|
|**test**|测试相关|test(utils): 添加工具函数测试|
|**chore**|构建/工具/依赖|chore(deps): 升级依赖版本|
|**revert**|回滚|revert: 回滚feature(user)提交|

**规则**：

- ✅ type和scope必须小写
- ✅ subject不能以句号结尾
- ✅ subject不能为空
- ✅ header（第一行）不超过200字符
- ✅ body和footer每行不超过200字符

### 2. 分支命名规范

**格式**：

```
<花名>/<type>-<branch-name>
```

**示例**：

```
zhangsan/feature-user-login
lisi/fix-payment-bug
wangwu/refactor-api-layer
```

**说明**：

- `花名`：开发者的花名（拼音小写）
- `type`：分支类型（feature、fix、hotfix等）
- `branch-name`：分支描述（小写，用中划线连接）

**支持的分支类型（type）**：

|分支类型|说明|示例|
|---|---|---|
|`feature`|新功能分支|zhangsan/feature-user-points|
|`fix`|Bug修复分支|lisi/fix-payment-error|
|`hotfix`|紧急修复分支|wangwu/hotfix-critical-bug|
|`refactor`|重构分支|zhangsan/refactor-api-structure|
|`perf`|性能优化分支|lisi/perf-list-render|
|`style`|样式调整分支|wangwu/style-button-color|
|`test`|测试分支|zhangsan/test-unit-tests|
|`docs`|文档分支|lisi/docs-api-guide|
|`chore`|构建/工具分支|wangwu/chore-upgrade-deps|

**特殊分支**：

- `develop` - 开发主分支（无需花名前缀）
- `release` - 发布分支（无需花名前缀）
- `main` / `master` - 生产主分支（无需花名前缀）

**命名规则**：

- ✅ 花名和分支名全小写
- ✅ 花名使用拼音（如：zhangsan、lisi）
- ✅ 使用中划线`-`连接单词
- ✅ type使用完整单词（feature而非feat）
- ✅ 语义化，见名知意
- ❌ 不使用大写字母
- ❌ 不使用下划线（除非特殊需要）
- ❌ 花名后必须用`/`分隔，type和分支名之间用`-`连接

**关键格式说明**：

```
花名/type-branch-name
 ↓   ↓   ↓
 |   |   └── 分支描述（用-连接）
 |   └────── 分支类型（feature、fix等）
 └────────── 开发者花名

示例：zhangsan/feature-user-login
     ↓        ↓       ↓
     花名      类型    描述
```

**正确示例**：

```bash
✅ zhangsan/feature-user-login
✅ lisi/fix-order-calculation
✅ wangwu/hotfix-security-issue
✅ zhangsan/refactor-api-v2
✅ develop
✅ release
```

**错误示例**：

```bash
❌ ZhangSan/feature-user-login    # 花名不能大写
❌ zhangsan/Feature-UserLogin     # type和分支名不能大写
❌ feature/user-login             # 缺少花名前缀
❌ zhangsan-feature-user-login    # 应该用 / 分隔花名和type
❌ zhangsan/feat-user-login       # 应该用完整的feature而非feat
❌ my-branch                      # 缺少花名和type
```

---

## 🔧 实施步骤

### 核心机制

通过 `prepare` 脚本实现自动化：

- 📦 安装 `@be-link/be-link-husky`
- 📝 在 `package.json` 中配置 `"prepare": "be-link-husky"`
- 🚀 每次 `pnpm install` 自动初始化所有配置

**优势**：

- ✅ 新成员无需手动配置
- ✅ 确保所有人配置一致
- ✅ 避免遗漏步骤

### 前置条件

- ✅ 项目使用Git版本管理
- ✅ Node 18.x（必须）
- ✅ 使用pnpm作为包管理器

### 步骤1️⃣：安装依赖

```bash
# 进入项目目录
cd /path/to/your/project

# 安装husky初始化工具
pnpm add -D @be-link/be-link-husky
```

---

### 步骤2️⃣：配置 package.json

**编辑 `package.json`，添加 prepare 脚本**：

```json
{
  "scripts": {
    "prepare": "be-link-husky"
  },
  "devDependencies": {
    "@be-link/be-link-husky": "^x.x.x"
  }
}
```

**执行初始化**：

```bash
# 触发prepare脚本
pnpm install
```

你会看到类似的输出：

```
> be-link-husky

✅ Installing dependencies...
✅ Husky installed
✅ Created .husky/commit-msg
✅ Created .husky/pre-commit  
✅ Created commitlint.config.js
```

**工具会自动**：

1. 安装必要依赖（husky、lint-staged、@commitlint/cli、@be-link/commitlint-config）
2. 创建 `.husky` 目录和钩子文件
3. 创建 `commitlint.config.js`

**📝 重要提示**：

- **首次配置**：技术负责人执行上述步骤，提交 `package.json` 到Git
- **团队成员**：直接 `git pull` + `pnpm install`，自动完成所有配置

---

### 步骤3️⃣：验证安装

**检查文件是否生成**：

```bash
# 检查husky目录
ls -la .husky

# 应该看到：
# .husky/
#   ├── _/              # husky内部文件
#   ├── commit-msg      # commit信息校验钩子
#   └── pre-commit      # 代码检查钩子

# 检查commitlint配置
cat commitlint.config.js

# 应该看到：
# module.exports = {
#   extends: ['@be-link/commitlint-config']
# }
```

**生成的文件内容**：

**`.husky/commit-msg`**：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# commit message 校验
echo "commit-msg 校验" && npx --no-install commitlint --edit $1
```

**`.husky/pre-commit`**：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 获取当前分支名称
export GIT_CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# 校验分支名称 + 运行lint-staged
npx --no-install @be-link/be-link-husky verify-branch && FORCE_COLOR=1 npx --no-install lint-staged
```

**`commitlint.config.js`**：

```javascript
module.exports = {
  extends: ['@be-link/commitlint-config'],
};
```

**说明**：

- `commit-msg`：在commit时校验message格式
- `pre-commit`：在commit前校验分支名 + 运行代码检查
- `commitlint.config.js`：继承团队统一的commitlint配置

**检查package.json**：

```bash
cat package.json | grep -A 10 "devDependencies"

# 应该包含：
# "devDependencies": {
#   "husky": "^8.0.3",
#   "@commitlint/cli": "^17.6.6",
#   "lint-staged": "^13.2.2",
#   "@be-link/commitlint-config": "^x.x.x"
# }
```

---

### 步骤4️⃣：配置 lint-staged

如果需要在提交前自动执行代码检查和格式化：

**编辑 `package.json`**：

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**说明**：

- `eslint --fix`：自动修复ESLint问题
- `prettier --write`：自动格式化代码
- 只检查暂存区的文件，速度快

---

### 步骤5️⃣：测试Git Hooks

#### 测试1：分支命名校验

```bash
# 创建规范的分支（应该成功）
# 注意：将zhangsan替换为你的花名
git checkout -b zhangsan/feature-test-feature
# ✅ 成功

# 创建不规范的分支（会被拦截）
git checkout -b feature/test
# ❌ 会看到错误提示：分支名不符合规范

git checkout -b MyFeature
# ❌ 会看到错误提示：分支名不符合规范

# 切回规范分支
git checkout zhangsan/feature-test-feature
```

#### 测试2：Commit Message校验

```bash
# 创建一个测试文件
echo "test" > test.txt
git add test.txt

# 尝试不规范的提交（会被拦截）
git commit -m "update"
# ❌ 会看到错误提示：
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]

# 使用规范的提交（应该成功）
git commit -m "feature: 添加测试功能"
# ✅ 成功

# 查看提交历史
git log --oneline
```

---

### 🎉 完成自检

```bash
echo "=== ✅ Git Hooks 配置检查 ==="
echo ""
echo "1. .husky目录存在: $(test -d .husky && echo '✅' || echo '❌')"
echo "2. commit-msg钩子存在: $(test -f .husky/commit-msg && echo '✅' || echo '❌')"
echo "3. pre-commit钩子存在: $(test -f .husky/pre-commit && echo '✅' || echo '❌')"
echo "4. commitlint.config.js存在: $(test -f commitlint.config.js && echo '✅' || echo '❌')"
echo "5. prepare脚本配置: $(grep -q '\"prepare\"' package.json && echo '✅' || echo '❌')"
echo ""
echo "⚠️  接下来请手动测试分支命名和commit规范"
```

**预期输出**：

```
=== ✅ Git Hooks 配置检查 ===

1. .husky目录存在: ✅
2. commit-msg钩子存在: ✅
3. pre-commit钩子存在: ✅
4. commitlint.config.js存在: ✅
5. prepare脚本配置: ✅

⚠️  接下来请手动测试分支命名和commit规范
```

---

## 📝 使用示例

### 示例1：日常开发流程

```bash
# 1. 创建功能分支（使用你的花名）
git checkout -b zhangsan/feature-user-profile

# 2. 开发功能，修改文件
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

### 示例2：Bug修复流程

```bash
# 1. 创建修复分支
git checkout -b lisi/fix-login-error

# 2. 修复bug
# ...

# 3. 提交代码
git add .
git commit -m "fix(auth): 修复登录失败的问题

修复了token过期时的错误处理逻辑

Closes #123"

# 4. 推送
git push origin lisi/fix-login-error
```

### 示例3：紧急修复流程

```bash
# 1. 从主分支创建hotfix分支
git checkout main
git checkout -b wangwu/hotfix-security-patch

# 2. 修复问题
# ...

# 3. 提交
git commit -m "hotfix(security): 修复XSS安全漏洞"

# 4. 合并到主分支
git checkout main
git merge wangwu/hotfix-security-patch
```

---

## ⚠️ 注意事项

### 1. 分支命名

**创建分支时就要符合规范**：

```bash
# ✅ 正确（使用你的花名）
git checkout -b zhangsan/feature-my-feature

# ❌ 错误：缺少花名前缀
git checkout -b feature/my-feature

# ❌ 错误：格式不对
git checkout -b MyFeature
```

**重命名分支**：

```bash
# 重命名当前分支
git branch -m zhangsan/feature-correct-name

# 如果已推送到远程
git push origin :old-branch-name
git push origin zhangsan/feature-correct-name
git push origin -u zhangsan/feature-correct-name
```

### 2. Commit Message

**必须包含type**：

```bash
# ❌ 错误
git commit -m "添加新功能"

# ✅ 正确
git commit -m "feature: 添加新功能"
```

### 3. 绕过检查（谨慎使用）

```bash
# 仅在紧急情况使用
git commit --no-verify -m "feature: 紧急修复"
```

⚠️ **警告**：绕过检查可能导致不规范代码提交，仅紧急情况使用。

---

**新成员加入**：

1. 克隆仓库
2. 执行 `pnpm install`
3. **自动完成**：prepare脚本会自动初始化Husky和所有配置
4. 无需任何额外操作

**工作原理**：

```bash
# 新成员执行
git clone <repository>
cd <project>
pnpm install

# pnpm install 会自动触发 prepare 脚本
# → 运行 be-link-husky
# → 自动安装husky
# → 自动创建.husky目录和钩子文件
# → 自动创建commitlint.config.js
# ✅ 完成！可以直接开始开发
```

**CI/CD环境**：

```bash
# CI环境可以跳过husky安装
HUSKY=0 pnpm install

# 或者在package.json中配置
{
  "scripts": {
    "prepare": "test -n \"$CI\" || be-link-husky"
  }
}
```

---

## 🆘 常见问题

### Q1: 为什么我的commit被拦截了？

**A**: 检查commit message格式

```bash
# 查看具体错误
git commit -m "your message"

# 常见错误：
# ✖ type may not be empty [type-empty]
# → 缺少type，应该是 feat: xxx

# ✖ subject may not be empty [subject-empty]  
# → subject为空，应该有描述

# ✖ type must be one of [type-enum]
# → type不在允许的列表中
```

**解决方法**：

```bash
# 使用规范的格式重新提交
git commit -m "feat: 添加用户登录功能"
```

### Q2: 分支命名不规范怎么办？

**A**: 重命名分支

```bash
# 重命名当前分支（使用你的花名）
git branch -m zhangsan/feature-correct-name

# 如果已经推送到远程
git push origin :old-branch-name                    # 删除远程旧分支
git push origin zhangsan/feature-correct-name       # 推送新分支名
git push origin -u zhangsan/feature-correct-name    # 设置上游分支
```

**常见错误**：

```bash
# ❌ 缺少花名前缀
feature/user-login  → zhangsan/feature-user-login

# ❌ 使用了大写
ZhangSan/Feature-Login → zhangsan/feature-login

# ❌ 使用了feat而非feature
zhangsan/feat-login → zhangsan/feature-login
```

### Q3: Husky没有安装怎么办？

**A**: 重新执行安装

```bash
# 1. 确保依赖已安装
pnpm install

# prepare脚本会自动运行，初始化husky

# 2. 如果还是不行，手动运行
pnpm prepare

# 3. 检查package.json中是否有prepare脚本
cat package.json | grep -A 2 "scripts"
# 应该看到：
# "scripts": {
#   "prepare": "be-link-husky"
# }
```

### Q4: 如何临时禁用Git Hooks？

**A**: 使用环境变量

```bash
# 临时禁用（单次命令）
HUSKY=0 git commit -m "feature: xxx"

# 或使用--no-verify
git commit --no-verify -m "feature: xxx"
```

### Q5: 多个type怎么写？

**A**: 一个commit只能有一个type

```bash
# ❌ 错误：不能写多个type
git commit -m "feature,fix: 添加功能并修复bug"

# ✅ 正确：拆分成多个commit
git commit -m "feature: 添加新功能"
git add .
git commit -m "fix: 修复相关bug"

# 或者选择主要的type
git commit -m "feature: 添加新功能并修复已知问题"
```

### Q6: scope应该写什么？

**A**: scope表示影响的范围

**推荐按模块/功能划分**：

```bash
feature(user): 添加用户功能        # user模块
fix(order): 修复订单问题          # order模块
style(button): 调整按钮样式       # button组件
refactor(api): 重构API层          # api层
```

**可以是**：

- 功能模块名：user、order、product
- 组件名：button、dialog、table
- 文件名：readme、config
- 架构层：api、utils、components

**也可以不写**：

```bash
feature: 添加新功能  # 不写scope也可以
```

**注意**：

- Scope与分支名无关
- 分支名是：`zhangsan/feature-user-login`
- Commit是：`feature(user): 添加登录功能` 或 `feature: 添加登录功能`

### Q7: CI/CD环境下Husky报错？

**A**: 在CI环境禁用Husky

```bash
HUSKY=0 pnpm install
```

⚠️ 详见"注意事项 > 4. 团队协作 > CI/CD环境"。

---

## ✅ 验收标准

**配置完成**：

- [ ] `@be-link/be-link-husky` 已安装
- [ ] `package.json` 中包含 `"prepare": "be-link-husky"` 脚本
- [ ] `.husky` 目录存在
- [ ] `commit-msg` 钩子可执行
- [ ] `pre-commit` 钩子可执行
- [ ] `commitlint.config.js` 存在
- [ ] package.json 包含相关依赖（husky、lint-staged、@commitlint/cli）

**功能验证**：

- [ ] `pnpm install` 能自动初始化husky
- [ ] 不规范的分支名被拦截（如：`feature/xxx`、`MyFeature`）
- [ ] 规范的分支名能创建成功（如：`zhangsan/feature-xxx`）
- [ ] 不规范的commit message被拦截
- [ ] 规范的分支和commit能正常使用
- [ ] 代码格式化自动执行（如果配置了lint-staged）

**团队使用**：

- [ ] 新成员clone后执行 `pnpm install` 自动完成所有配置
- [ ] 团队成员都能理解规范
- [ ] 提交历史清晰规范