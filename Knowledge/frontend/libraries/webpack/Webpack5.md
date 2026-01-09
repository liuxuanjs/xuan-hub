## Webpack5 使用指南

首先从 [Guides](https://webpack.js.org/guides/) 开始看起，看一遍 Guides，对如何配置 webpack 也就知道的差不多了。

后面对 webpack 更细化的配置，以及各个 API、配置、loaders 的了解，可以从相关文档深入了解。

## 相关插件（plugins）

[官网插件列表](https://webpack.js.org/plugins/)

## FAQ

### ts类型的webpack配置，在使用tsconfig-paths-webpack-plugin时，报：tsconfig-paths-webpack-plugin: Found no baseUrl in tsconfig.json, not applying tsconfig-paths-webpack-plugin

![[Pasted image 20250807144447.png]]

解决方式：需要在如`webpack.config.ts`配置文件中增加`delete process.env.TS_NODE_PROJECT;`，[相关issue](https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32#issuecomment-478042178)

### React热更新，使用React.lazy时，热更新失效

首先`@pmmmwh/react-refresh-webpack-plugin`和`react-refresh`都已安装且在webpack中配置。

项目为single-spa的子项目，html是通过代理的方式，代理到node_modules中的portal的index.html的。


❌ ==经排查== ，发现使用了`const Home = lazy(() => import('./home/index'))` 写法的情况下，热更新则失效。

#### 解决过程 ✅ 

首先vite有一个相关的[issue](https://github.com/vitejs/vite/issues/4298) ，其中的一个留言：`I'm using @loadable/component and Function components its worked fine for me.

✅ 然后我将代码改为以下形式，HMR可以正常工作

```tsx
import loadable from '@loadable/component';

const Home = loadable(() => import('./home/index'))
```

### 前端微服务项目中webpack 热更新失效

问题描述：前端single-spa 架构的前端微服务子模块，本地开发时，本地子模块代理到本地portal（本地启动子模块和portal两个服务）。结果通过子模块启动的端口访问项目时，子模块更改后无法触发热更新。

#### 解决方式 ✅

最后排查，如果子模块代理的是线上的portal地址，就会触发热更新。猜测，有可能是本地开发模式下的portal会与子模块互相影响的原因。

### Module not found: Error: Can't resolve 'react/jsx-runtime'

```bash
Module not found: Error: Can't resolve 'react/jsx-runtime' in '/Users/xxx/syyy/node_modules/.pnpm/react-dnd@16.0.1_7u6mpky5dbb5b3hgdescs5ficq/node_modules/react-dnd/dist/core'
Did you mean 'jsx-runtime.js'?
```

#### 解决方式✅

在 `webpack` 配置 `resolve.fallback`  中增加如下配置：

```js
export default {
	resolve: {
	    // ...,
	    fallback: {
	      'react/jsx-runtime': 'react/jsx-runtime.js',
	      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
	    },
	},
}

```