# 刘煊

- 前端开发工程师 | 9 年开发经验 | 本科 | 32 岁
- 联系方式：15927000280 ｜ 15927000280@163.com
- 技术擅长：React/Vue 全家桶、小程序、微前端架构、组件库建设、可视化平台

# 个人优势

- 熟练掌握React/Vue技术栈，具备9年前端开发经验，参与15+企业级Web系统从0到1构建
- 具备微前端架构实践经验，熟悉single-spa实现方案，有大型系统模块化开发经验
- 参与多个组件库建设与维护，熟悉模块化管理，在团队协作中提升开发效率
- 具备前端工程化实践经验，熟悉质量保障工具集成，有效降低项目维护成本
- 具备良好的跨团队协作能力，有指导新人经验，积极推动团队技术规范建设
- 善于利用 AI 编程工具（Cursor）构建高效开发工作流，提升代码质量与交付效率

# 技术能力

**前端技术栈**：React、Vue2、Vue3、TypeScript、JavaScript ES6+、React Hooks、Redux、MobX、Vuex
**构建工具**：Webpack、Vite、Rollup、Nx、Lerna
**UI框架**：Ant Design、Ant Design Vue、Element UI、Shopify Polaris、TailwindCSS、CSS-in-JS(Emotion) 
**移动端**：微信小程序、响应式设计、Canvas
**工程化**：ESLint、Prettier、Stylelint、Husky、Sentry、MSW
**可视化**：ECharts、G2、Viser、高德地图SDK
**架构设计**：微前端(single-spa)、SSR/SSG(Remix)、组件化设计、状态管理


# 工作经历

## 杭州数云信息技术有限公司上海分公司（2022 年 3 月 ~ 至今）

### 麒麟系统微前端平台 | 项目核心开发 | 2022.03-至今

**背景**：公司核心营销平台需要支撑多业务线快速扩展，原有单体架构难以满足团队并行开发需求

**技术栈**：React + MobX + single-spa + Kylin Design + TypeScript + Webpack

**微前端架构实现**：
- 基于single-spa构建微前端脚手架，通过`registerApplication`实现子应用动态注册与按需加载
- 设计主应用路由守卫，使用`navigateToUrl`实现应用间无感切换，解决应用状态隔离问题
- 构建shared依赖管理策略，通过`SystemJS`统一管理React、MobX等公共依赖，减少重复加载40%
- 实现子应用热更新：Webpack HMR + single-spa生命周期钩子，支持开发态实时预览

**复杂业务逻辑建模**：
- 卡券互斥规则：实现基于有向无环图(DAG)的冲突检测算法，支持复杂的卡券组合约束验证
- 动态表单渲染：基于JSON Schema设计表单配置协议，通过递归组件 + `React.createElement`实现动态渲染
- 属性集合配置：使用`Proxy` + `Reflect`实现响应式数据绑定，支持嵌套属性的实时同步

**工程化与性能优化**：
- 构建代码分割策略：路由级别懒加载，首屏加载时间优化30%
- 接入Webpack Bundle Analyzer优化打包产物，通过externals配置和CDN优化，包体积减少35%
- 建立ESLint自定义规则集，通过pre-commit hooks强制代码质量检查

**业务结果**：服务于公司全营销业务线，支撑15+子系统模块化开发，开发效率提升50%，无P3以上事故

### Shuyun AI Platform 前端组件库 | 架构设计 | 2023.01-2024.06

**背景**：为支持公司各产品线接入 AI 能力，构建统一的前端组件库，提供基础设施以提升研发效率和界面一致性

**技术栈**：React + TypeScript + Emotion + Rollup + Nx + Lerna + Docusaurus

**Monorepo架构设计**：
- 使用Nx Workspace构建多包管理，通过依赖图谱实现增量构建和并行执行
- Lerna管理包版本发布，通过语义化版本控制支持independent模式独立发布
- 设计Package依赖关系：core(基础工具) -> components(业务组件) -> pro-components(高级组件)

**多主题动态切换实现**：
- 基于Emotion CSS-in-JS，使用`ThemeProvider`实现运行时主题切换
- 设计Token系统：通过`createTheme`函数生成主题变量，支持色彩、间距、字体等系统化配置
- 实现主题算法：基于Ant Design色彩算法，通过`TinyColor`库实现主色调自动生成衍生色

**构建优化与按需加载**：
- Rollup多格式输出：配置生成ESM/CJS/UMD三种格式，支持不同场景使用
- Tree Shaking优化：通过`sideEffects: false`标记无副作用模块，配合ES Modules实现精确摇树
- 开发babel-plugin-import插件，自动转换`import { Button } from 'lib'`为路径导入

**业务结果**：落地公司全产品线，服务90+前端开发，组件复用率提升60%，新项目搭建效率提升80%

### Kylin i18n Copilot VSCode插件 | 项目Owner | 2023.06-2024.03

**背景**：面向公司多产品线的国际化开发插件，提升多语言研发效率与文案管理质量

**技术栈**：VSCode Extension API + TypeScript + Node.js

**VSCode插件架构实现**：
- 基于VSCode Extension API构建插件主体，通过`vscode.extensions.registerCommand`注册自定义命令
- 设计Language Server Protocol：基于`vscode-languageserver`实现语言服务，提供智能提示和语法检查
- 使用`vscode.workspace.onDidChangeTextDocument`监听文件变化，实时更新语言key索引

**智能提示与跳转**：
- Hover Provider：通过`vscode.languages.registerHoverProvider`实现key悬浮显示翻译文案
- Definition Provider：使用AST解析(基于`@babel/parser`)定位语言key定义位置，支持Ctrl+Click跳转
- 通过`vscode.window.showQuickPick`提供key选择面板，支持模糊搜索和自动完成

**自动化提取与转换**：
- 中文文案识别：使用正则表达式`/[\u4e00-\u9fa5]+/g`匹配中文字符，结合AST分析确定提取范围
- Key生成算法：基于文案内容生成语义化key，通过`pinyin`库转换拼音，避免key冲突
- 使用`vscode.WorkspaceEdit`API实现代码批量修改，支持撤销重做

**性能优化**：
- 增量更新：使用文件MD5缓存，仅处理变更文件，减少不必要的解析开销
- 异步处理：使用`Worker Threads`处理大文件解析，避免阻塞主线程
- 实现LRU缓存策略，控制语言文件索引的内存占用

**业务结果**：已在麒麟全业务线落地使用，翻译效率提升70%，文案错误率下降85%

### 睿翼SEO系统 | 架构设计 | 2023.08-2024.02

**背景**：公司需要为Shopify商家提供SEO优化服务，需兼容独立站与Shopify App双平台部署

**技术栈**：Remix + React + TypeScript + TailwindCSS + Shopify Polaris + MSW

**双平台兼容架构**：
- 主导双平台兼容架构设计，使用Remix SSR提升首屏性能，符合Shopify官方审核标准
- TailwindCSS原子化CSS方案，降低构建体积与运行时开销50%
- 集成MSW实现前后端解耦开发，支持多人并行开发与联调测试

**业务结果**：成功通过Shopify官方审核，服务于200+独立站商家

## 一兆韦德健身管理有限公司（2021 年 1 月 ~ 2022 年 3 月）

### 一兆韦德数字化平台 | 项目核心开发 | 2021.01-2022.03

**背景**：传统健身行业数字化转型需求，需要构建完整的会员管理与运营体系

**技术栈**：Vue3 + Vite + TypeScript + Ant Design Vue + 微信小程序 + Sentry

**核心功能实现**：
- 主导Vue3 + Vite现代化架构搭建，配置模块化开发规范
- 引入Sentry完善异常监控体系，使用ECharts实现业务数据可视化
- 负责会员信息、门店管理、活动设置等核心业务模块开发与维护

**小程序端优化**：
- 使用Canvas封装海报绘制组件，支持活动转发裂变场景
- 配置强制版本更新机制，解决冷启动缓存导致的内容不一致问题
- 接入Sentry小程序端监控SDK，完善异常上报机制

**工程化实践**：
- 建立Prettier + ESLint + Stylelint统一代码规范
- 封装Node.js OSS上传工具，优化文件管理流程

**业务结果**：支撑全国200+门店数字化运营，会员活跃度提升35%

## 追月科技（2020 年 7 月 ~ 2020 年 12 月）

### 商户数据平台 | 前端开发 | 2020.07-2020.12

**技术栈**：React + DVA + Viser + Ant Design

- 负责可视化模块开发，使用Viser封装折线图、柱状图等图表组件
- 接入DVA改造全局状态管理，优化数据流管理逻辑
- 主导CMS平台搭建与组件抽象，建立可复用组件库

## 饿了么（上海得逸信息技术有限公司，2019 年 4 月 ~ 2020 年 7 月）

### 饿了么M站导购平台 | 前端开发 | 2019.04-2020.07

**技术栈**：React + React Hooks + Redux + 高德地图SDK

- 参与M站核心链路开发：订单列表、订单详情、个人中心、卡券系统等关键页面
- 集成高德地图SDK，实现商家/用户/骑手位置实时同步功能
- 参与大促活动开发，基于阿里斑马平台搭建双11、生活周等营销会场

## 武汉米色信息科技有限公司（2016 年 3 月 ~ 2019 年 3 月）

### 企业管理系统 | 前端开发 | 2016.03-2019.03

**技术栈**：Vue + Vuex + Element-UI + JavaScript

- 参与北科大教务管理系统开发，完成学生信息管理、教务管理等核心功能
- 参与太以赔保险后台系统UI交互还原，搭建异常兜底与统一弹窗组件
- 实现axios请求统一封装，推行代码规范标准化(Prettier + ESLint + Stylelint)
