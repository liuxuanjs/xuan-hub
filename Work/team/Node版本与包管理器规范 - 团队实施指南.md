
## 🎯 实施目标

完成后，整个团队将：

- ✅ 统一使用 Node 20.x LTS + pnpm 10.x 稳定版
- ✅ 所有项目自动切换到正确版本
- ✅ 安装速度提升3倍，磁盘节省70%
- ✅ 消除"在我电脑上能跑"的问题

### 💡 核心理念

**我们使用 Node 20 和 pnpm 10 的指定稳定版本**

```
当前指定版本（2025-12-17）：
  Node: 20.19.6
  pnpm: 10.26.0

⚠️ 注意：团队统一使用指定版本，升级时需同步更新所有项目配置
```

**版本控制策略**：

```
┌─────────────────────────────────────────┐
│  volta: 管理本地 Node 和 pnpm 版本         │
│  命令: volta install node@20 (安装最新20.x)│
│  配置: package.json 中必须写完整版本号      │
│  → 团队统一使用相同的完整版本              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  engines: 约束版本范围                    │
│  node: >=20.19.6 <21                    │
│  pnpm: >=10.26.0 <11                    │
│  → 设定最低版本要求，拒绝大版本跳跃          │
└─────────────────────────────────────────┘
```

**好处**：

- 🔒 **版本统一**：团队都使用相同版本（20.19.6 和 10.26.0）
- 🚫 **风险可控**：大版本更新（21、11）需显式升级
- ⚡ **pnpm 10 新特性**：自带 Node.js 运行时，更稳定

---

## 第一阶段：个人环境准备（⏱️ 预计15分钟）

### 📌 开始前自检

在终端执行以下命令，记录你当前的状态：

```bash
# 复制这段代码，粘贴到终端一次性执行
echo "=== 当前环境检查 ==="
echo "Node版本: $(node -v 2>/dev/null || echo '未安装')"
echo "npm版本: $(npm -v 2>/dev/null || echo '未安装')"
echo "是否安装nvm: $(which nvm 2>/dev/null || echo '未安装')"
echo "是否安装volta: $(which volta 2>/dev/null || echo '未安装')"
```

**预期输出示例**：

```
=== 当前环境检查 ===
Node版本: v16.14.0
npm版本: 8.3.1
是否安装nvm: /Users/xxx/.nvm/nvm.sh
是否安装volta: 未安装
```

📸 **截图保存**，如果后续出问题可以恢复

---

### 步骤1️⃣：安装 Volta（Node版本管理工具）

**版本管理策略**：

- `volta install node@20` → 安装20.x的最新稳定版
- `volta install pnpm@10` → 安装10.x的最新稳定版
- 配合package.json的volta字段（**必须写完整版本号**），实现团队环境统一

#### 🖥️ macOS/Linux 用户

```bash
# 1. 安装 volta（必须使用官方脚本）
curl https://get.volta.sh | bash

# ⚠️ 不要使用 brew install volta！
# brew 安装会导致 pnpm 版本管理失效

# 2. 让配置生效（根据你的 shell 选择一个）
source ~/.bashrc   # bash 用户
source ~/.zshrc    # zsh 用户
source ~/.config/fish/config.fish  # fish 用户
```

**✅ 验证是否成功**：

```bash
volta --version
# 预期输出：2.0.1 或更高版本
```

---

#### ⚠️ 如果之前用 Homebrew 安装过 volta

**问题**：brew 安装的 volta 会导致 pnpm 版本被锁死，无法正常切换。

**检查是否是 brew 安装**：

```bash
# 查看 volta 路径
which volta

# 如果输出包含 /opt/homebrew 或 /usr/local/Cellar，说明是 brew 安装的
# ❌ brew 安装：/opt/homebrew/bin/volta
# ✅ 官方安装：/Users/xxx/.volta/bin/volta
```

**卸载 brew 版本并重新安装**：

```bash
# 1. 卸载 brew 版本的 volta
brew uninstall volta

# 2. 清理残留配置（如果有）
rm -rf ~/.volta

# 3. 从 shell 配置中移除旧的 volta 配置（如果有）
# 检查 ~/.zshrc 或 ~/.bashrc，删除包含 volta 的行

# 4. 使用官方脚本重新安装
curl https://get.volta.sh | bash

# 5. 重新加载 shell 配置
source ~/.zshrc  # 或 source ~/.bashrc

# 6. 验证安装路径
which volta
# 预期输出：/Users/xxx/.volta/bin/volta
```

---

#### 🔍 检查工具路径

安装完成后，可以通过以下命令检查各工具的路径：

```bash
# 查看 volta 路径
which volta
# 预期：/Users/xxx/.volta/bin/volta

# 查看 node 路径
which node
# 预期：/Users/xxx/.volta/bin/node

# 查看 pnpm 路径
which pnpm
# 预期：/Users/xxx/.volta/bin/pnpm

# 一次性检查所有路径
echo "volta: $(which volta)"
echo "node:  $(which node)"
echo "pnpm:  $(which pnpm)"
```

**正确的路径应该都在 `~/.volta/bin/` 目录下**，如果路径指向其他位置（如 `/opt/homebrew/`、`/usr/local/`、`~/.nvm/`），说明版本管理工具有冲突，需要清理。

---

#### ❌ 如果报错 "command not found"

```bash
# 检查 PATH 是否配置正确
echo $PATH | grep -o ".volta"

# 如果没有输出，手动添加到你的 shell 配置文件
# bash 用户：
echo 'export VOLTA_HOME="$HOME/.volta"' >> ~/.bashrc
echo 'export PATH="$VOLTA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# zsh 用户：
echo 'export VOLTA_HOME="$HOME/.volta"' >> ~/.zshrc
echo 'export PATH="$VOLTA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 🪟 Windows 用户

https://docs.volta.sh/guide/getting-started

**✅ 验证是否成功**：

```powershell
volta --version
```

---

### 步骤2️⃣：使用 Volta 安装 Node 20 和 pnpm 10

**🔑 关键：使用主版本号安装最新稳定版**

```bash
# 安装 Node 20.x 的最新稳定版
volta install node@20

# 安装 pnpm 10.x 的最新稳定版
volta install pnpm@10
```

**为什么这样安装？**

- ✅ volta 会自动选择 20.x 和 10.x 的最新稳定版
- ✅ 当前会安装 20.19.6 和 10.26.0（截至 2025-12-17）
- ✅ 后续有新版本发布时，重新执行命令会自动更新
- ✅ 团队成员都使用相同的主版本策略

**✅ 验证是否成功**：

```bash
# 检查 Node 版本
node --version
# 预期输出：v20.x.x（如 v20.19.6 或更新）

# 检查 pnpm 版本
pnpm --version
# 预期输出：10.x.x（如 10.26.0 或更新）

# 检查是否由 volta 管理
which node
# macOS/Linux 预期：/Users/你的用户名/.volta/bin/node
# Windows 预期：C:\Users\你的用户名\.volta\bin\node.exe
```

**如果需要更新到最新版本**：

```bash
# 重新执行安装命令即可
volta install node@20
volta install pnpm@10
```

---

### 步骤3️⃣：处理旧的版本管理工具（可选但建议）

**如果你之前装了 nvm**：

⚠️ **重要**：volta 和 nvm 会冲突，建议移除 nvm

```bash
# 1. 备份你的 nvm 配置
cp ~/.nvm/alias/default ~/nvm-backup.txt 2>/dev/null

# 2. 从 shell 配置中移除 nvm
# bash 用户
sed -i.bak '/nvm/d' ~/.bashrc 2>/dev/null
source ~/.bashrc

# zsh 用户
sed -i.bak '/nvm/d' ~/.zshrc 2>/dev/null
source ~/.zshrc

# 3.（可选）删除 nvm 目录
# rm -rf ~/.nvm  # 谨慎操作！
```

**✅ 验证是否成功**：

```bash
which node
# 应该输出 volta 的路径，而不是 nvm 的路径
```

---

### 🎉 第一阶段完成自检

复制以下命令，全部执行：

```bash
echo "=== ✅ 环境配置完成检查 ==="
echo ""
echo "1. Volta版本: $(volta --version 2>/dev/null || echo '❌ 未安装')"
echo "2. Node版本: $(node --version 2>/dev/null || echo '❌ 未安装')"
echo "3. pnpm版本: $(pnpm --version 2>/dev/null || echo '❌ 未安装')"
echo "4. Node管理工具: $(which node 2>/dev/null || echo '❌ 未找到')"
echo ""

# 获取版本号
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
PNPM_VERSION=$(pnpm --version 2>/dev/null)

# 检查版本的主版本号
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
PNPM_MAJOR=$(echo $PNPM_VERSION | cut -d. -f1)

# 检查是否由volta管理
NODE_PATH=$(which node 2>/dev/null)
IS_VOLTA=$(echo $NODE_PATH | grep -q "volta" && echo "true" || echo "false")

# 版本检查
if [ "$NODE_MAJOR" = "20" ] && [ "$PNPM_MAJOR" = "10" ] && [ "$IS_VOLTA" = "true" ]; then
  echo "✅ Node版本正确: $NODE_VERSION (Node 20.x LTS)"
  echo "✅ pnpm版本正确: $PNPM_VERSION (pnpm 10.x)"
  echo "✅ 由volta管理: $NODE_PATH"
  echo ""
  echo "🎉 恭喜！环境配置成功！"
  echo "👉 可以进入第二阶段了"
elif [ "$NODE_MAJOR" = "20" ] && [ "$PNPM_MAJOR" = "10" ]; then
  echo "⚠️  Node和pnpm版本正确，但不是由volta管理"
  echo "   当前Node路径: $NODE_PATH"
  echo "   建议使用volta管理以确保团队统一"
  echo ""
  echo "👉 可以继续，但建议配置volta"
else
  echo "❌ 版本不符合要求："
  echo ""

  if [ "$NODE_MAJOR" != "20" ]; then
    echo "   Node: 当前 $NODE_VERSION，要求 20.x"
    echo "   修复：volta install node@20"
  fi

  if [ "$PNPM_MAJOR" != "10" ]; then
    echo "   pnpm: 当前 $PNPM_VERSION，要求 10.x"
    echo "   修复：volta install pnpm@10"
  fi

  echo ""
  echo "请重新执行步骤1-3或在团队群里@技术负责人求助"
fi
```

**预期成功输出**：

```
=== ✅ 环境配置完成检查 ===

1. Volta版本: 2.0.1
2. Node版本: v20.19.6
3. pnpm版本: 10.26.0
4. Node管理工具: /Users/xxx/.volta/bin/node

✅ Node版本正确: 20.19.6 (Node 20.x LTS)
✅ pnpm版本正确: 10.26.0 (pnpm 10.x)
✅ 由volta管理: /Users/xxx/.volta/bin/node

🎉 恭喜！环境配置成功！
👉 可以进入第二阶段了
```

**如果看到 ❌**：

- 重新执行步骤1-3
- 或者在团队群里@技术负责人求助

---

## 第二阶段：项目配置迁移

### 前置条件

- ✅ 第一阶段已完成
- ✅ 你有项目的写权限
- ✅ 当前项目代码已提交（无未保存的修改）

### 步骤4️⃣：暂存当前修改

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 确保代码已提交
git status
# 如果有未提交的，先提交：
# git add .
# git commit -m "chore: 迁移到pnpm前的备份"

# 3. 暂存修改
git add .
git stash
# 如果后面需要取出修改
git stash pop
```

---

### 步骤5️⃣：修改 package.json

**打开 `package.json`**，添加以下内容：

```json
{
  "name": "your-project",
  "version": "1.0.0",

  // ✅ 新增：约束版本范围
  "engines": {
    "node": ">=20.19.6 <21",
    "pnpm": ">=10.26.0 <11"
  },

  // ✅ 新增：volta 管理（必须使用完整版本号）
  "volta": {
    "node": "20.19.6",
    "pnpm": "10.26.0"
  },

  "scripts": {
    // ✅ 新增：阻止使用npm/yarn
    "preinstall": "npx only-allow pnpm",

    // 原有的scripts保持不变
    "dev": "vite",
    "build": "vite build"
  }
}
```

**📝 配置说明**：

1. **engines - 版本范围约束**

```json
"engines": {
  "node": ">=20.19.6 <21",   // 最低20.19.6，最高不超过21
  "pnpm": ">=10.26.0 <11"    // 最低10.26.0，最高不超过11
}
```

- 设定最低版本要求（基于当前指定稳定版）
- 防止使用过低版本（可能有bug或缺少功能）
- 防止跨大版本（避免breaking changes）

2. **volta - 完整版本号管理**

```json
"volta": {
  "node": "20.19.6",  // ⚠️ 必须使用完整版本号
  "pnpm": "10.26.0"   // ⚠️ 必须使用完整版本号
}
```

- 团队成员进入项目时，volta 自动切换到指定版本
- **注意**：volta 的 package.json 配置不支持主版本号（如 "20"），必须写完整版本号
- 确保团队都使用完全相同的版本


---

### 步骤6️⃣：创建 .npmrc 配置

**创建 `.npmrc` 文件**（项目根目录）：

```bash
# .npmrc
# 如果后期有私有镜像源时
# registry=私有镜像源

# 启用 npm 脚本的 pre 和 post 钩子，package.json 中有 preinstall 或 postinstall 脚本，这个设置会让它们被执行
enable-pre-post-scripts=true

# 禁用严格的 peer dependencies 检查，不会因为 peer dependencies 版本不匹配而报错或阻止安装
strict-peer-dependencies=false

# 禁用自动安装 peer dependencies，避免自动安装可能冲突的依赖
auto-install-peers=false
```

**✅ 验证是否创建成功**：

```bash
cat .npmrc
# 应该能看到上面的内容
```

---

### 步骤7️⃣：清理并重新安装依赖

**⚠️ 重要**：这一步会删除 `node_modules`，请确保代码已提交！

```bash
# 1. 删除旧依赖和npm锁文件
rm -rf node_modules
rm -f package-lock.json

# 2. 使用pnpm安装（第一次会比较慢）
pnpm install
```

**可能遇到的情况**：

#### 情况1：安装很顺利 ✅

```
Progress: resolved 234, reused 234, downloaded 0, added 234, done
```

恭喜，继续下一步！

#### 情况2：提示缺少依赖 ⚠️

```
ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies

react@18.0.0
└── ✕ missing peer react-dom@"^18.0.0"
```

**解决方法**：

```bash
# 手动安装缺失的依赖
pnpm add react-dom@^18.0.0
```

#### 情况3：某个包安装失败 ❌

```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/xxx: Not Found
```

**解决方法**：

```bash
# 1. 检查package.json中是否有拼写错误的包名
# 2. 或者该包已被删除，需要找替代品
# 3. 在团队群里求助
```

**✅ 验证安装是否成功**：

```bash
# 1. 检查node_modules是否生成
ls node_modules | wc -l
# 应该输出一个大于0的数字（比如234）

# 2. 检查pnpm-lock.yaml是否更新
ls -lh pnpm-lock.yaml
# 应该显示文件存在，且修改时间是刚才

# 3. 检查package-lock.json是否被删除
test ! -f package-lock.json && echo "✅ 已删除package-lock文件" || echo "⚠️  package-lock文件仍存在"
```

---

### 步骤8️⃣：验证项目能正常运行

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 打开浏览器访问（通常是 http://localhost:5173）
# 3. 检查是否有报错

# 4. 测试构建
pnpm build

# 5. 检查dist目录是否生成
ls dist
```

**✅ 成功标准**：

- `pnpm dev` 能正常启动
- 页面能正常访问，无报错
- `pnpm build` 能成功构建
- 构建产物正常

**❌ 如果遇到报错**：

**报错类型1：模块找不到**

```
Error: Cannot find module 'xxx'
```

**解决**：这是幽灵依赖问题，手动安装该模块

```bash
pnpm add xxx
```

**报错类型2：类型错误**

```
TS2307: Cannot find module 'xxx' or its corresponding type declarations
```

**解决**：安装类型定义

```bash
pnpm add -D @types/xxx
```

---

### 🎉 第二阶段完成自检

```bash
echo "=== ✅ 项目迁移完成检查 ==="
echo ""
echo "1. package.json包含engines: $(grep -q '"engines"' package.json && echo '✅' || echo '❌')"
echo "2. package.json包含volta: $(grep -q '"volta"' package.json && echo '✅' || echo '❌')"
echo "3. volta配置使用完整版本号: $(grep -q '"node": "20\.' package.json && echo '✅' || echo '❌')"
echo "4. .npmrc文件存在: $(test -f .npmrc && echo '✅' || echo '❌')"
echo "5. package-lock.json已删除: $(test ! -f package-lock.json && echo '✅' || echo '❌')"
echo "6. pnpm-lock.yaml存在: $(test -f pnpm-lock.yaml && echo '✅' || echo '❌')"
echo "7. node_modules存在: $(test -d node_modules && echo '✅' || echo '❌')"
echo ""
echo "手动验证："
echo "  [ ] pnpm dev 能正常启动"
echo "  [ ] pnpm build 能正常构建"
```

---

## 第三阶段：提交代码

### 步骤9️⃣：提交改动

```bash
# 1. 查看改动
git status

# 2. 添加文件
git add .

# 4. 提交
git commit -m "chore: 迁移到pnpm + volta

- 添加 engines 和 volta 配置到 package.json
- 创建 .npmrc 配置文件
- 删除 package-lock.json
- 更新 pnpm-lock.yaml

✅ 已验证：项目可正常启动和构建"

# 5. 推送到远程
git push
```

---

## 📊 团队推进建议

### 方案1：渐进式推进（推荐）

**第1周：试点**

- 选1-2个活跃项目先迁移
- 技术负责人完成第一个，写实施记录
- 其他人参考记录完成剩余项目

**第2周：全面铺开**

- 所有开发环境完成迁移
- CI/CD流程更新

**第3周：总结优化**

- 收集问题和反馈
- 更新文档
- 分享经验

### 方案2：统一时间迁移

**适合场景**：团队较小（<5人），项目较少

**操作**：

1. 选择一个周五下午
2. 团队一起完成迁移
3. 相互帮助解决问题

---

## 🆘 常见问题 FAQ

### Q1: 迁移后，其他成员拉代码会怎样？

**A**: 如果他们还没装 volta：

```bash
# 他们会看到提示
npm install
# 输出: Use "pnpm install" to install packages in this project
```

他们需要：

1. 按照第一阶段安装 volta
2. 执行 `volta install node@20` 和 `volta install pnpm@10`
3. 执行 `pnpm install`

如果他们装了 volta：

- 进入项目目录会自动切换到 Node 20.19.6 和 pnpm 10.26.0
- 直接 `pnpm install` 即可

---

### Q2: CI/CD 怎么配置？

**GitHub Actions**:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 使用 Node 20.x

- uses: pnpm/action-setup@v4
  with:
    version: 10  # 使用 pnpm 10.x

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

**GitLab CI**:

```yaml
image: node:20  # 使用 Node 20.x 镜像

before_script:
  - npm install -g pnpm@10
  - pnpm install --frozen-lockfile
```

---

### Q3: pnpm 命令和 npm 有什么区别？

|npm|pnpm|说明|
|---|---|---|
|`npm install`|`pnpm install`|安装依赖|
|`npm install xxx`|`pnpm add xxx`|添加依赖|
|`npm uninstall xxx`|`pnpm remove xxx`|删除依赖|
|`npm run dev`|`pnpm dev`|运行脚本（可省略run）|

---

### Q4: 为什么选择 Node 20 和 pnpm 10？

**Node 20.x LTS**:

- ✅ 长期支持版本（LTS），支持到 2026年4月
- ✅ 性能提升（相比 v18）
- ✅ 更好的 ES Module 支持
- ✅ 稳定且经过充分测试
- ✅ 当前指定版本是 20.19.6

**pnpm 10.x**:

- ✅ 最新稳定的主版本
- ✅ 自带 Node.js 运行时，更稳定
- ✅ 安装速度快3倍
- ✅ 磁盘占用节省70%
- ✅ 严格的依赖管理，无幽灵依赖
- ✅ 当前指定版本是 10.26.0
- ⚠️ 不再支持 Node.js 18 和 19

---

### Q5: volta 配置为什么必须用完整版本号？

```json
"volta": {
  "node": "20.19.6",  // ✅ 正确：完整版本号
  "pnpm": "10.26.0"   // ✅ 正确：完整版本号
}
```

**vs 主版本号（不支持）**：

```json
"volta": {
  "node": "20",  // ❌ 错误：volta 不支持这种语法
  "pnpm": "10"   // ❌ 错误：无法正常工作
}
```

**原因**：

1. **volta 设计限制**
    - volta 的 package.json 配置**只支持完整版本号**
    - 主版本号语法只在 `volta install` 命令中有效

2. **安装命令 vs 配置文件**

    ```bash
    # 命令支持主版本号，安装最新的 20.x
    volta install node@20

    # 但 package.json 必须写完整版本号
    # volta 会自动将完整版本号写入 package.json
    ```

3. **版本更新流程**

    ```bash
    # 当需要更新版本时：
    # 1. 执行安装命令（安装最新 20.x）
    volta install node@20
    volta install pnpm@10

    # 2. 更新 package.json 中的 volta 配置
    # （手动或使用 volta pin 命令）
    volta pin node@20.19.6
    volta pin pnpm@10.26.0

    # 3. 提交更新后的 package.json
    git add package.json
    git commit -m "chore: 更新 volta 版本配置"
    ```

---

### Q6: engines 为什么要设置最低版本（>=20.19.6）？

```json
"engines": {
  "node": ">=20.19.6 <21",  // 为什么是 20.19.6 而不是 20.0.0？
  "pnpm": ">=10.26.0 <11"
}
```

**原因**：

1. **基于当前指定稳定版设定**

    - 20.19.6 和 10.26.0 是当前的指定稳定版（2025-12-17）
    - 确保团队使用的版本足够新，包含重要的 bug 修复和安全补丁
2. **防止使用过低版本**

    - 20.0.0 到 20.19.6 之间可能存在已知 bug
    - 统一最低版本标准，避免环境差异
3. **未来兼容**

    - 随着新版本发布，engines 的范围会自动包含它们
    - 20.20.0、20.21.0 等都会被自动接受
4. **与 volta 配合**

    - volta 确保本地是指定版本
    - engines 确保 CI/CD 也不低于最低要求

**如果想更宽松**：

```json
"engines": {
  "node": ">=20.0.0 <21",  // 接受任何 20.x 版本
  "pnpm": ">=10.0.0 <11"
}
```

但这样可能允许使用有 bug 的旧版本，不推荐。

---

### Q7: 如何更新到最新的稳定版？

```bash
# 更新 volta 管理的 Node 和 pnpm 到最新稳定版
volta install node@20
volta install pnpm@10

# 检查版本
node --version  # 输出最新的 20.x 版本
pnpm --version  # 输出最新的 10.x 版本
```

**何时需要更新**：

- 定期更新（如每月检查一次）
- 发现性能问题或 bug
- 需要新功能
- 安全公告发布后

**团队同步**：

- 更新后通知团队成员
- 大家各自执行 `volta install node@20` 和 `volta install pnpm@10`
- **更新 package.json 的 volta 配置**（必须同步更新完整版本号）

```bash
# 更新 package.json 中的 volta 配置
volta pin node
volta pin pnpm
# 或手动编辑 package.json

# 提交更新
git add package.json
git commit -m "chore: 更新 Node/pnpm 版本"
git push
```

---

### Q8: 如何让不同项目自动切换到不同的 Node/pnpm 版本？

**场景**：你有多个项目，需要不同的版本组合：
- 项目 A：Node 20 + pnpm 10
- 项目 B：Node 18 + pnpm 9（旧项目维护）

**解决方案**：在每个项目的 `package.json` 中配置 volta 字段

**项目 A（Node 20 + pnpm 10）**：

```json
{
  "volta": {
    "node": "20.19.6",
    "pnpm": "10.26.0"
  }
}
```

**项目 B（Node 18 + pnpm 9）**：

```json
{
  "volta": {
    "node": "18.20.8",
    "pnpm": "9.15.0"
  }
}
```

**使用流程**：

```bash
# 1. 先安装所有需要的版本（只需执行一次）
volta install node@20
volta install node@18
volta install pnpm@10
volta install pnpm@9

# 2. 之后切换项目时会自动切换版本
cd ~/projects/project-a
node --version  # 自动显示 v20.19.6
pnpm --version  # 自动显示 10.26.0

cd ~/projects/project-b
node --version  # 自动显示 v18.20.8
pnpm --version  # 自动显示 9.15.0
```

**工作原理**：

```
┌─────────────────────────────────────────────────┐
│  volta 读取当前目录的 package.json              │
│              ↓                                  │
│  找到 volta 字段中的版本配置                     │
│              ↓                                  │
│  自动切换到对应版本（无需手动操作）               │
└─────────────────────────────────────────────────┘
```

**注意事项**：

- volta 必须已安装对应版本（通过 `volta install` 命令）
- package.json 中必须使用**完整版本号**
- 切换是自动的，进入目录即生效
- 如果 package.json 没有 volta 字段，则使用全局默认版本

---

## ✅ 最终验收标准

**个人环境**：

- [ ] `volta --version` 有输出
- [ ] `node --version` 输出 `v20.x.x`
- [ ] `pnpm --version` 输出 `10.x.x`
- [ ] `which node` 输出 volta 路径

**项目配置**：

- [ ] `package.json` 包含 `engines` 和 `volta`
- [ ] `volta` 配置使用完整版本号（"20.19.6" 和 "10.26.0"）
- [ ] `.npmrc` 文件存在
- [ ] 只有 `pnpm-lock.yaml`，没有 `package-lock.json`

**功能验证**：

- [ ] `pnpm install` 能正常安装
- [ ] `pnpm dev` 能正常启动
- [ ] `pnpm build` 能正常构建
- [ ] 其他队员拉代码后也能正常运行

**如果以上全部打勾，恭喜🎉迁移成功！**

---

## 📞 需要帮助？

- 🐛 遇到问题：在团队群里 @技术负责人
- 📝 改进建议：提交 Issue 或 PR
- 💬 经验分享：周会时分享你的迁移经历

---

## 附录：完整配置文件示例

### package.json 完整示例

```json
{
  "name": "be-link-h5",
  "version": "1.0.0",
  "private": true,

  "engines": {
    "node": ">=20.19.6 <21",
    "pnpm": ">=10.26.0 <11"
  },

  "volta": {
    "node": "20.19.6",
    "pnpm": "10.26.0"
  },

  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx --fix"
  },

  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },

  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```