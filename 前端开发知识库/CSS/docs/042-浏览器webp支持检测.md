## 概述

WebP是Google开发的现代图片格式，具有更好的压缩率和质量。由于浏览器支持不一致，需要在使用前检测浏览器是否支持WebP格式，以便提供合适的回退方案。

## 检测方法

### 1. Canvas检测法（推荐）

```javascript
// 同步检测
function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 使用示例
if (supportsWebP()) {
    console.log('浏览器支持WebP');
} else {
    console.log('浏览器不支持WebP');
}
```

**优点：**
- 执行速度快，同步检测
- 不需要网络请求
- 兼容性好

### 2. 图片加载检测法

```javascript
// 异步检测
function checkWebPSupport() {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
            // 检查图片尺寸
            resolve(img.width === 1 && img.height === 1);
        };
        
        img.onerror = () => {
            resolve(false);
        };
        
        // 1x1像素的WebP图片（base64编码）
        img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
}

// 使用示例
checkWebPSupport().then(isSupported => {
    if (isSupported) {
        console.log('浏览器支持WebP');
    } else {
        console.log('浏览器不支持WebP');
    }
});
```

**优点：**
- 检测结果更准确
- 可以检测具体的WebP特性

**缺点：**
- 异步操作，需要等待
- 稍微复杂一些

### 3. 特性检测库

```javascript
// 使用Modernizr库
if (Modernizr.webp) {
    console.log('支持WebP');
} else {
    console.log('不支持WebP');
}

// 检测不同WebP特性
if (Modernizr.webp.lossless) {
    console.log('支持无损WebP');
}

if (Modernizr.webp.alpha) {
    console.log('支持透明WebP');
}

if (Modernizr.webp.animation) {
    console.log('支持动态WebP');
}
```

## 完整检测方案

### 检测不同WebP特性

```javascript
class WebPDetector {
    constructor() {
        this.cache = new Map();
    }
    
    // 检测基础WebP支持
    async checkBasic() {
        if (this.cache.has('basic')) {
            return this.cache.get('basic');
        }
        
        const result = await this.testImage(
            'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
        );
        
        this.cache.set('basic', result);
        return result;
    }
    
    // 检测无损WebP支持
    async checkLossless() {
        if (this.cache.has('lossless')) {
            return this.cache.get('lossless');
        }
        
        const result = await this.testImage(
            'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
        );
        
        this.cache.set('lossless', result);
        return result;
    }
    
    // 检测透明WebP支持
    async checkAlpha() {
        if (this.cache.has('alpha')) {
            return this.cache.get('alpha');
        }
        
        const result = await this.testImage(
            'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA=='
        );
        
        this.cache.set('alpha', result);
        return result;
    }
    
    // 检测动画WebP支持
    async checkAnimation() {
        if (this.cache.has('animation')) {
            return this.cache.get('animation');
        }
        
        const result = await this.testImage(
            'data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA'
        );
        
        this.cache.set('animation', result);
        return result;
    }
    
    // 测试图片加载
    testImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            
            img.src = src;
        });
    }
    
    // 获取所有支持情况
    async getSupportInfo() {
        const [basic, lossless, alpha, animation] = await Promise.all([
            this.checkBasic(),
            this.checkLossless(),
            this.checkAlpha(),
            this.checkAnimation()
        ]);
        
        return {
            basic,
            lossless,
            alpha,
            animation,
            supported: basic
        };
    }
}

// 使用示例
const detector = new WebPDetector();

detector.getSupportInfo().then(info => {
    console.log('WebP支持情况:', info);
});
```

## 实际应用

### 图片源选择

```javascript
// 根据支持情况选择图片格式
async function getImageSrc(baseName, extension = 'jpg') {
    const webpSupported = await new WebPDetector().checkBasic();
    
    if (webpSupported) {
        return `${baseName}.webp`;
    } else {
        return `${baseName}.${extension}`;
    }
}

// 使用示例
getImageSrc('/images/hero', 'jpg').then(src => {
    document.querySelector('#hero-image').src = src;
});
```

### HTML picture元素

```html
<picture>
    <source srcset="image.webp" type="image/webp">
    <source srcset="image.jpg" type="image/jpeg">
    <img src="image.jpg" alt="图片描述">
</picture>
```

### CSS背景图片

```javascript
// 动态设置CSS背景图片
async function setBackgroundImage(element, imagePath) {
    const webpSupported = await new WebPDetector().checkBasic();
    const extension = webpSupported ? 'webp' : 'jpg';
    
    element.style.backgroundImage = `url('${imagePath}.${extension}')`;
}

// 使用示例
const heroSection = document.querySelector('.hero');
setBackgroundImage(heroSection, '/images/hero-bg');
```

### CSS类控制

```javascript
// 在html元素上添加支持类
async function addWebPClass() {
    const supported = await new WebPDetector().checkBasic();
    
    if (supported) {
        document.documentElement.classList.add('webp');
    } else {
        document.documentElement.classList.add('no-webp');
    }
}

addWebPClass();
```

```css
/* CSS中根据支持情况设置背景 */
.hero {
    background-image: url('hero.jpg');
}

.webp .hero {
    background-image: url('hero.webp');
}
```

## 服务端检测

### 请求头检测

```javascript
// Node.js示例
app.use((req, res, next) => {
    const acceptHeader = req.headers.accept || '';
    req.supportsWebP = acceptHeader.includes('image/webp');
    next();
});

// 根据支持情况返回不同格式
app.get('/api/image/:name', (req, res) => {
    const imageName = req.params.name;
    const extension = req.supportsWebP ? 'webp' : 'jpg';
    
    res.sendFile(`${imageName}.${extension}`);
});
```

### User-Agent检测

```javascript
// 检测支持WebP的浏览器
function supportsWebPByUserAgent(userAgent) {
    // Chrome 32+, Opera 19+, Android Chrome 32+
    if (/Chrome\/(\d+)/.test(userAgent)) {
        const version = parseInt(RegExp.$1);
        return version >= 32;
    }
    
    // Firefox 65+
    if (/Firefox\/(\d+)/.test(userAgent)) {
        const version = parseInt(RegExp.$1);
        return version >= 65;
    }
    
    // Edge 18+
    if (/Edge\/(\d+)/.test(userAgent)) {
        const version = parseInt(RegExp.$1);
        return version >= 18;
    }
    
    return false;
}
```

## 性能优化

### 缓存检测结果

```javascript
// 使用localStorage缓存检测结果
class CachedWebPDetector {
    constructor() {
        this.cacheKey = 'webp-support-cache';
        this.cacheVersion = '1.0.0';
    }
    
    async checkSupport() {
        const cached = this.getFromCache();
        if (cached) {
            return cached;
        }
        
        const detector = new WebPDetector();
        const result = await detector.getSupportInfo();
        
        this.saveToCache(result);
        return result;
    }
    
    getFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                if (data.version === this.cacheVersion) {
                    return data.result;
                }
            }
        } catch (e) {
            console.warn('读取WebP缓存失败:', e);
        }
        return null;
    }
    
    saveToCache(result) {
        try {
            const data = {
                version: this.cacheVersion,
                result,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (e) {
            console.warn('保存WebP缓存失败:', e);
        }
    }
}
```

## 最佳实践

1. **优先使用Canvas检测：** 快速且准确
2. **缓存检测结果：** 避免重复检测
3. **提供回退方案：** 确保在不支持的浏览器中正常显示
4. **渐进增强：** 先加载通用格式，再优化为WebP
5. **服务端配合：** 结合服务端检测提供最佳体验

## 标签
#CSS #前端面试