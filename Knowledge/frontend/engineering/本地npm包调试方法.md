# 本地 npm 包调试方法

在前端开发过程中，经常需要开发和调试本地的 npm 包。本文详细介绍各种本地包调试方法和最佳实践。

## 📋 目录

- [调试方法概览](#调试方法概览)
- [npm link 方法](#npm-link-方法)
- [本地文件路径](#本地文件路径)
- [yarn workspaces](#yarn-workspaces)
- [pnpm workspaces](#pnpm-workspaces)
- [Lerna 管理](#lerna-管理)
- [Verdaccio 私有仓库](#verdaccio-私有仓库)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

## 调试方法概览

| 方法 | 适用场景 | 优点 | 缺点 | 推荐度 |
|------|----------|------|------|--------|
| npm link | 简单包调试 | 简单易用 | 符号链接问题 | ⭐⭐⭐ |
| 本地路径 | 快速测试 | 直接引用 | 版本管理困难 | ⭐⭐ |
| yarn workspaces | 单仓库管理 | 统一管理 | 学习成本 | ⭐⭐⭐⭐⭐ |
| pnpm workspaces | 性能优化 | 节省空间 | 生态兼容性 | ⭐⭐⭐⭐ |
| Lerna | 复杂项目 | 功能完整 | 配置复杂 | ⭐⭐⭐⭐ |
| Verdaccio | 团队协作 | 接近真实环境 | 部署复杂 | ⭐⭐⭐ |

## npm link 方法

### 基础用法

```bash
# 在包项目根目录下创建全局链接
cd /path/to/your-package
npm link

# 在使用该包的项目中链接
cd /path/to/your-project
npm link your-package-name

# 取消链接
npm unlink your-package-name

# 在包目录中取消全局链接
cd /path/to/your-package
npm unlink
```

### 实际操作示例

```bash
# 1. 开发一个工具包
mkdir my-utils
cd my-utils
npm init -y

# package.json
{
  "name": "my-utils",
  "version": "1.0.0",
  "main": "index.js"
}

# index.js
exports.add = (a, b) => a + b;
exports.multiply = (a, b) => a * b;

# 创建全局链接
npm link

# 2. 在另一个项目中使用
cd ../my-project
npm link my-utils

# 现在可以在代码中使用
const { add, multiply } = require('my-utils');
console.log(add(2, 3)); // 5
```

### npm link 脚本化

```json
// package.json scripts
{
  "scripts": {
    "link:install": "npm link",
    "link:clean": "npm unlink",
    "dev:link": "npm run build && npm link",
    "test:linked": "cd ../test-project && npm link my-package && npm test"
  }
}
```

### 处理 npm link 常见问题

```bash
# 问题1: 权限错误
sudo npm link  # 使用 sudo (不推荐)

# 更好的解决方案：配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH=~/.npm-global/bin:$PATH

# 问题2: 符号链接问题
# 在 Windows 上可能需要管理员权限
# 或者使用 --preserve-symlinks
node --preserve-symlinks index.js

# 问题3: 版本冲突
npm ls  # 查看依赖树
npm link --only=production  # 只链接生产依赖
```

## 本地文件路径

### 直接路径引用

```json
// package.json
{
  "dependencies": {
    "my-utils": "file:../my-utils",
    "local-component": "file:./packages/component"
  }
}
```

### 相对路径和绝对路径

```json
{
  "dependencies": {
    // 相对路径（推荐）
    "utils": "file:../utils",
    "components": "file:./src/components",
    
    // 绝对路径（不推荐）
    "shared": "file:/Users/username/projects/shared"
  }
}
```

### 监听文件变化

```bash
# 使用 nodemon 监听本地包变化
npm install --save-dev nodemon

# package.json
{
  "scripts": {
    "dev": "nodemon --watch ../my-utils --exec 'npm run test'"
  }
}
```

### 自动同步脚本

```javascript
// sync-local-packages.js
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class LocalPackageSync {
  constructor(config) {
    this.packages = config.packages;
    this.watchers = [];
  }
  
  start() {
    this.packages.forEach(pkg => {
      const watcher = chokidar.watch(pkg.source, {
        ignored: /node_modules/,
        persistent: true,
      });
      
      watcher.on('change', (filePath) => {
        this.syncFile(filePath, pkg);
      });
      
      this.watchers.push(watcher);
    });
    
    console.log('本地包同步已启动');
  }
  
  syncFile(filePath, pkg) {
    const relativePath = path.relative(pkg.source, filePath);
    const targetPath = path.join(pkg.target, relativePath);
    
    fs.copyFileSync(filePath, targetPath);
    console.log(`已同步: ${relativePath}`);
  }
  
  stop() {
    this.watchers.forEach(watcher => watcher.close());
    console.log('本地包同步已停止');
  }
}

// 使用示例
const sync = new LocalPackageSync({
  packages: [
    {
      source: '../my-utils',
      target: './node_modules/my-utils',
    },
  ],
});

sync.start();
```

## yarn workspaces

### 基础配置

```json
// 根目录 package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "devDependencies": {
    "@babel/core": "^7.0.0"
  }
}
```

### 项目结构

```
my-monorepo/
├── package.json
├── packages/
│   ├── utils/
│   │   ├── package.json
│   │   └── index.js
│   ├── components/
│   │   ├── package.json
│   │   └── index.js
│   └── shared/
│       ├── package.json
│       └── index.js
└── apps/
    ├── web/
    │   ├── package.json
    │   └── src/
    └── mobile/
        ├── package.json
        └── src/
```

### 包配置示例

```json
// packages/utils/package.json
{
  "name": "@my-org/utils",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "lodash": "^4.17.0"
  }
}

// packages/components/package.json
{
  "name": "@my-org/components",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@my-org/utils": "^1.0.0",
    "react": "^18.0.0"
  }
}

// apps/web/package.json
{
  "name": "web-app",
  "version": "1.0.0",
  "dependencies": {
    "@my-org/components": "^1.0.0",
    "@my-org/utils": "^1.0.0"
  }
}
```

### yarn workspaces 命令

```bash
# 安装所有依赖
yarn install

# 在特定工作区运行命令
yarn workspace @my-org/utils add lodash
yarn workspace web-app start

# 在所有工作区运行命令
yarn workspaces run build
yarn workspaces run test

# 添加依赖到根目录
yarn add -W typescript

# 查看工作区信息
yarn workspaces info
```

### 开发脚本

```json
// 根目录 package.json
{
  "scripts": {
    "dev": "yarn workspaces run dev",
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test",
    "clean": "yarn workspaces run clean",
    
    "dev:utils": "yarn workspace @my-org/utils dev",
    "dev:components": "yarn workspace @my-org/components dev",
    "dev:web": "yarn workspace web-app start",
    
    "build:packages": "yarn workspace @my-org/utils build && yarn workspace @my-org/components build",
    "dev:all": "concurrently \"yarn dev:utils\" \"yarn dev:components\" \"yarn dev:web\""
  },
  "devDependencies": {
    "concurrently": "^7.0.0"
  }
}
```

## pnpm workspaces

### 配置文件

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
```

```json
// package.json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r run dev",
    "build": "pnpm -r run build"
  }
}
```

### pnpm 特有功能

```bash
# 递归安装所有依赖
pnpm install -r

# 在特定包中添加依赖
pnpm add react --filter @my-org/components

# 过滤执行命令
pnpm build --filter @my-org/utils
pnpm test --filter "@my-org/*"

# 查看依赖关系
pnpm list -r --depth=0

# 更新所有包
pnpm update -r

# 发布所有包
pnpm publish -r
```

### 依赖管理策略

```json
// .npmrc
# 使用 workspace 协议
auto-install-peers=true
shamefully-hoist=true

# package.json 中使用 workspace 协议
{
  "dependencies": {
    "@my-org/utils": "workspace:*",
    "@my-org/components": "workspace:^1.0.0"
  }
}
```

## Lerna 管理

### 初始化 Lerna

```bash
# 安装 Lerna
npm install -g lerna

# 初始化项目
lerna init

# 或者使用独立版本模式
lerna init --independent
```

### Lerna 配置

```json
// lerna.json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "packages": [
    "packages/*"
  ],
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish",
      "registry": "https://registry.npmjs.org/"
    },
    "bootstrap": {
      "hoist": true,
      "npmClientArgs": ["--no-package-lock"]
    }
  }
}
```

### Lerna 常用命令

```bash
# 安装依赖
lerna bootstrap

# 清理 node_modules
lerna clean

# 运行命令
lerna run build
lerna run test --scope=@my-org/utils

# 执行命令
lerna exec -- rm -rf dist
lerna exec --scope=@my-org/* -- ls -la

# 添加依赖
lerna add lodash --scope=@my-org/utils
lerna add @my-org/utils --scope=@my-org/components

# 版本管理
lerna version
lerna version prerelease --preid=beta

# 发布
lerna publish
lerna publish from-git
```

### 自动化脚本

```json
// package.json
{
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "clean": "lerna clean --yes",
    "build": "lerna run build --stream",
    "test": "lerna run test --stream",
    "lint": "lerna run lint --stream",
    
    "dev": "lerna run dev --parallel",
    "changed": "lerna changed",
    "diff": "lerna diff",
    
    "version:patch": "lerna version patch",
    "version:minor": "lerna version minor",
    "version:major": "lerna version major",
    
    "publish:ci": "lerna publish from-git --yes",
    "release": "npm run build && npm run test && lerna version && lerna publish from-git"
  }
}
```

## Verdaccio 私有仓库

### 安装和配置

```bash
# 全局安装 Verdaccio
npm install -g verdaccio

# 启动服务
verdaccio

# 或者使用 Docker
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

### 配置文件

```yaml
# ~/.config/verdaccio/config.yaml
storage: ./storage

auth:
  htpasswd:
    file: ./htpasswd

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@my-org/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

server:
  keepAliveTimeout: 60

middlewares:
  audit:
    enabled: true

logs:
  - { type: stdout, format: pretty, level: http }
```

### 使用 Verdaccio

```bash
# 设置 registry
npm set registry http://localhost:4873

# 创建用户
npm adduser --registry http://localhost:4873

# 发布包到私有仓库
npm publish --registry http://localhost:4873

# 安装私有包
npm install @my-org/utils --registry http://localhost:4873

# 恢复官方 registry
npm set registry https://registry.npmjs.org
```

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-config:/verdaccio/conf
    environment:
      - VERDACCIO_USER_UID=1000
      - VERDACCIO_USER_GID=1000

volumes:
  verdaccio-storage:
  verdaccio-config:
```

## 调试技巧

### 源码映射

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  }
}

// webpack.config.js
module.exports = {
  devtool: 'source-map',
  resolve: {
    alias: {
      '@my-org/utils': path.resolve(__dirname, '../utils/src')
    }
  }
};
```

### 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Local Package",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/test.js",
      "env": {
        "NODE_PATH": "${workspaceFolder}/node_modules:${workspaceFolder}/../my-utils"
      },
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

### 热重载设置

```javascript
// webpack.config.js for local package development
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'MyUtils',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
};
```

### 测试环境配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleNameMapping: {
    '^@my-org/(.*)$': '<rootDir>/../$1/src',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
};
```

## 常见问题

### 1. 符号链接问题

```bash
# 问题：Windows 下符号链接权限问题
# 解决方案1：启用开发者模式
# 解决方案2：使用 Git Bash 或 WSL
# 解决方案3：使用 --preserve-symlinks

# Node.js 启动参数
node --preserve-symlinks index.js

# npm 配置
npm config set preserve-symlinks true
```

### 2. 版本冲突

```bash
# 检查依赖版本
npm ls --depth=0
yarn why package-name

# 解决步骤
npm dedupe  # 去重依赖
rm -rf node_modules package-lock.json
npm install

# 使用 resolutions 强制版本
# package.json
{
  "resolutions": {
    "react": "^18.0.0"
  }
}
```

### 3. 模块解析问题

```javascript
// 自定义模块解析
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@my-org/utils': path.resolve(__dirname, '../utils/src'),
    },
    symlinks: false, // 禁用符号链接解析
  },
};

// Node.js 模块路径
// 在代码中添加模块路径
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  if (args[0] === '@my-org/utils') {
    args[0] = path.resolve(__dirname, '../utils');
  }
  return originalRequire.apply(this, args);
};
```

### 4. TypeScript 类型问题

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@my-org/*": ["../packages/*/src"]
    },
    "preserveSymlinks": true
  }
}

// 类型声明文件
// types/my-org__utils.d.ts
declare module '@my-org/utils' {
  export function add(a: number, b: number): number;
}
```

## 最佳实践

### 1. 项目结构规范

```
monorepo/
├── packages/          # 可发布的包
│   ├── utils/
│   ├── components/
│   └── shared/
├── apps/             # 应用程序
│   ├── web/
│   └── mobile/
├── tools/            # 工具脚本
│   ├── build/
│   └── deploy/
├── docs/             # 文档
├── .github/          # CI/CD 配置
├── package.json
└── lerna.json
```

### 2. 命名约定

```json
{
  "name": "@org-name/package-name",
  "version": "1.0.0",
  "description": "Clear and concise description",
  "keywords": ["react", "component", "ui"],
  "repository": {
    "type": "git",
    "url": "https://github.com/org/repo",
    "directory": "packages/package-name"
  }
}
```

### 3. 发布流程自动化

```json
// package.json
{
  "scripts": {
    "preversion": "npm run test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags",
    
    "prepublishOnly": "npm run build && npm run test",
    "publish:beta": "npm publish --tag beta",
    "publish:latest": "npm publish --tag latest"
  }
}
```

### 4. 开发环境配置

```javascript
// tools/dev-env.js
const fs = require('fs');
const path = require('path');

class DevEnvironment {
  constructor() {
    this.packages = this.findPackages();
    this.setupWatchers();
  }
  
  findPackages() {
    const packagesDir = path.join(process.cwd(), 'packages');
    return fs.readdirSync(packagesDir).map(name => ({
      name,
      path: path.join(packagesDir, name),
      packageJson: require(path.join(packagesDir, name, 'package.json')),
    }));
  }
  
  setupWatchers() {
    // 设置文件监听和自动构建
  }
  
  linkPackages() {
    // 自动链接所有本地包
    this.packages.forEach(pkg => {
      console.log(`Linking ${pkg.name}...`);
      // 执行 npm link 逻辑
    });
  }
}

// 启动开发环境
const devEnv = new DevEnvironment();
devEnv.linkPackages();
```

### 5. 持续集成配置

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn build
      - run: yarn test
      - run: yarn lint
```

## 总结

本地 npm 包调试有多种方法，选择合适的方法能够显著提高开发效率：

### 推荐方案

1. **小型项目**：使用 `npm link` 或本地文件路径
2. **中型项目**：使用 `yarn workspaces` 或 `pnpm workspaces`
3. **大型项目**：使用 `Lerna` + `yarn workspaces`
4. **团队协作**：使用 `Verdaccio` 私有仓库

### 关键原则

- **简单优先**：从最简单的方法开始
- **自动化**：使用脚本自动化重复操作
- **版本管理**：明确依赖版本和发布策略
- **测试覆盖**：确保本地包的质量
- **文档完善**：为团队成员提供清晰的指导

选择合适的调试方法，建立完善的开发流程，能够让本地包的开发和维护更加高效和可靠。

---

*持续更新中，欢迎补充更多实践经验...*
