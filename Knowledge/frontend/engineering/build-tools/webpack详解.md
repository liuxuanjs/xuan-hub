# webpack 详解

> webpack 是一个模块打包器，能够分析项目结构，找到 JavaScript 模块以及其它的一些浏览器不能直接运行的扩展语言，并将其转换和打包为合适的格式供浏览器使用。

## 📚 核心概念

### 入口（Entry）
入口指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js'
};

// 多入口配置
module.exports = {
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  }
};
```

### 输出（Output）
output 属性告诉 webpack 在哪里输出它所创建的 bundles。

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true // webpack 5+ 清理输出目录
  }
};
```

### 加载器（Loaders）
loader 让 webpack 能够去处理那些非 JavaScript 文件。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### 插件（Plugins）
插件用于执行范围更广的任务，如打包优化、资源管理和注入环境变量。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

## 🔧 配置文件详解

### 基础配置
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 模式：development、production、none
  mode: 'development',
  
  // 入口文件
  entry: './src/index.js',
  
  // 输出配置
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  
  // 开发服务器
  devServer: {
    static: './dist',
    hot: true,
    port: 3000
  },
  
  // 模块配置
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  
  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

### 环境分离配置

#### webpack.common.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  }
};
```

#### webpack.dev.js
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true
  }
});
```

#### webpack.prod.js
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map'
});
```

## 🎯 常用 Loaders

### CSS 处理
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
};
```

### 文件处理
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(csv|tsv)$/i,
        use: 'csv-loader'
      },
      {
        test: /\.xml$/i,
        use: 'xml-loader'
      }
    ]
  }
};
```

### TypeScript 支持
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
```

## 🔌 常用插件

### 基础插件
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    // 清理输出目录
    new CleanWebpackPlugin(),
    
    // 生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    
    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

### 性能优化插件
```javascript
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    // 提供全局变量
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    
    // 忽略某些模块
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    
    // 包分析
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
};
```

## 🚀 性能优化

### 代码分割
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### Tree Shaking
```javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};

// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 缓存优化
```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash].js'
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 压缩优化
```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
};
```

## 🔧 开发体验优化

### 热模块替换（HMR）
```javascript
module.exports = {
  devServer: {
    hot: true,
    liveReload: false
  }
};

// 在入口文件中
if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
    printMe();
  });
}
```

### Source Map 配置
```javascript
module.exports = {
  // 开发环境
  devtool: 'eval-cheap-module-source-map',
  
  // 生产环境
  devtool: 'source-map'
};
```

### 别名配置
```javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
```

## 📊 Webpack 5 新特性

### 模块联邦
```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        mfApp: 'mfApp@http://localhost:3001/remoteEntry.js'
      }
    })
  ]
};
```

### 资源模块
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.png/,
        type: 'asset/resource'
      },
      {
        test: /\.svg/,
        type: 'asset/inline'
      },
      {
        test: /\.txt/,
        type: 'asset/source'
      },
      {
        test: /\.jpg/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb
          }
        }
      }
    ]
  }
};
```

### 持久化缓存
```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

## 🎯 最佳实践

### 1. 配置组织
```javascript
// 使用函数返回配置
module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    mode: argv.mode,
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
    // ...其他配置
  };
};
```

### 2. 环境变量管理
```javascript
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify(process.env.API_URL)
    })
  ]
};
```

### 3. 多页面应用配置
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    contact: './src/contact.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ['about']
    })
  ]
};
```

### 4. 性能监控
```javascript
// 构建分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
});
```

## 🚨 常见问题与解决

### 1. 内存溢出
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 node_modules/.bin/webpack
```

### 2. 构建速度慢
```javascript
module.exports = {
  // 使用缓存
  cache: {
    type: 'filesystem'
  },
  
  // 减少解析范围
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  
  // 使用 thread-loader
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader',
          'babel-loader'
        ]
      }
    ]
  }
};
```

### 3. 样式闪烁问题
```javascript
// 使用 MiniCssExtractPlugin 而不是 style-loader
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  }
};
```

## 📈 webpack 发展趋势

### 特点分析
- **成熟稳定**：生态完善，社区活跃
- **功能强大**：支持各种复杂的构建需求
- **配置复杂**：学习曲线陡峭，配置繁琐
- **性能改进**：webpack 5 带来显著性能提升

### 适用场景
- **大型项目**：复杂的构建需求
- **企业级应用**：需要稳定可靠的构建工具
- **传统项目**：已有 webpack 配置的项目
- **多页面应用**：需要复杂的构建配置

---

> **总结**：webpack 是功能最强大、生态最完善的构建工具，适合复杂项目和企业级应用，但配置复杂，学习成本较高。
