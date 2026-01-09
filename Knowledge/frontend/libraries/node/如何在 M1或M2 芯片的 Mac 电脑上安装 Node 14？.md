
```shell
nvm install 14
```

当我尝试使用我的 M2 芯片 Mac 在项目上安装node 14 时，出现了以下错误：

```shell
 command sh -c node installArchSpecificPackage
npm ERR! npm ERR! code ETARGET
npm ERR! npm ERR! notarget No matching version found for node-darwin-arm64@14.17.3.
npm ERR! npm ERR! notarget In most cases you or one of your dependencies are requesting
npm ERR! npm ERR! notarget a package version that doesn't exist.
npm ERR! 
npm ERR! npm ERR! A complete log of this run can be found in:
npm ERR! npm ERR!     /Users/enzo/.npm/_logs/2023-02-04T02_37_49_054Z-debug-0.log
npm ERR! node:internal/modules/cjs/loader:1050
npm ERR!   throw err;
npm ERR!   ^
npm ERR! 
npm ERR! Error: Cannot find module 'node-bin-darwin-arm64/package.json'
npm ERR! Require stack:
npm ERR! - /Users/liuxuan/Documents/Project/frontend/node_modules/node/installArchSpecificPackage.js
npm ERR!     at Module._resolveFilename (node:internal/modules/cjs/loader:1047:15)
npm ERR!     at Function.resolve (node:internal/modules/cjs/helpers:109:19)
npm ERR!     at ChildProcess.<anonymous> (/Users/enzo/Documents/TeCambio/frontend/node_modules/node-bin-setup/index.js:19:27)
npm ERR!     at ChildProcess.emit (node:events:513:28)
npm ERR!     at maybeClose (node:internal/child_process:1091:16)
npm ERR!     at ChildProcess._handle.onexit (node:internal/child_process:302:5) {
npm ERR!   code: 'MODULE_NOT_FOUND',
npm ERR!   requireStack: [
npm ERR!     '/Users/liuxuan/Documents/Project/frontend/node_modules/node/installArchSpecificPackage.js'
npm ERR!   ]
npm ERR! }
npm ERR! 
npm ERR! Node.js v18.14.0
```


## 解决方案

>需要说明的是，在安装 Node.js 时，它会尝试下载 darwin arm64 版本，该版本只有 Node.js 16 以后的版本可用。如果您使用的是 M1/M2 Mac，则需要使用 Rosetta shell 安装 Node.js 16 之前的版本。


下面介绍如何使用 Rosetta 启动终端：

1. 在 Finder 中导航至 "应用程序 "文件夹。
2. 使用搜索图标查找并输入 "终端"。
3. 右键单击出现的终端图标，选择 "显示简介"。
4. 在 "显示简介 "窗口中，勾选 "使用 Rosetta 打开 "复选框。
5. 关闭所有当前打开的终端窗口，并退出应用程序。然后，重新打开终端。
6. 按照这些步骤操作后，您应该可以使用 NVM 安装 16 之前的 Node 版本，而且安装应该会成功。

![[Pasted image 20240429134918.png]]
![[Pasted image 20240429135115.png]]