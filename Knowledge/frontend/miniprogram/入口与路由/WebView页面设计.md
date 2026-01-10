---
aliases: ["WebView设计", "小程序嵌套H5"]
title: "WebView 页面设计"
tags: ["微信小程序", "WebView", "H5嵌套", "分享"]
updated: 2026-01-10
---

## 结论

小程序的 WebView 页面（`page/web-view/index`）是小程序与 H5 的桥梁，负责：

1. **构建 URL**：拼接域名、用户信息、业务参数
2. **传递登录态**：把 token、userId 等传给 H5
3. **控制分享**：决定哪些页面可以分享，接收 H5 的分享信息
4. **消息通信**：监听 H5 发来的消息

## URL 构建逻辑

WebView 的 src 不是直接用 H5 的路径，需要动态构建。

### 为什么不能直接用路径

1. **域名动态获取**：域名从后端配置读取，支持动态切换（见 [微信域名检测与保护方案](./微信域名检测与保护方案.md)）
2. **用户信息透传**：H5 需要知道当前用户是谁
3. **授权判断**：部分页面需要先走微信授权

### URL 构建流程

```typescript
useEffect(() => {
  // 1. 获取域名配置
  const { used } = await fetchDomainUsed();
  const domainUsedRef = {
    authDomain: used[1],   // 授权域名
    liveDomain: used[2],   // 业务域名
  };

  // 2. 判断是否需要走授权
  const needWxAuth = await fetchUserCheckAuthRequired({ unionId });

  // 3. 构建最终 URL
  let currentUrl;

  if (needAuth) {
    // 需要授权的页面：先跳授权页，授权后跳回目标页
    currentUrl = setObjToUrlParams(`${authDomain}/auth`, {
      needWxAuth,
      unionId,
      openId,
      userId,
      token,
      backUrl: urlPath,  // 授权完成后跳转的目标页
    });
  } else {
    // 不需要授权：直接拼接目标页
    currentUrl = setObjToUrlParams(`${authDomain}${urlPath}`, {
      unionId,
      openId,
      userId,
      token,
    });
  }

  setUrl(currentUrl);
}, [unionId]);
```

### 传递给 H5 的参数

| 参数 | 用途 |
|------|------|
| unionId | 用户唯一标识 |
| openId | 小程序内用户标识 |
| userId | 业务用户 ID |
| token | 登录态 |
| fontSizeSetting | 用户字体大小设置（适老化） |
| liveDomain | 业务域名（iframe 需要） |
| backUrl | 授权完成后跳转的目标页 |
| appId | 小程序 appId |

## 分享控制

不是所有 WebView 页面都能分享。需要根据页面类型和用户权限控制。

### 分享权限逻辑

```typescript
useEffect(() => {
  // 商品详情页：始终可分享
  if (urlPath.includes('/product-detail')) {
    return;  // 不调用 hideShareMenu，保持可分享
  }

  // 直播间：需要校验权限
  if (urlPath.includes('/scene')) {
    const { activityId } = getUrlParams(urlPath);

    // 没有 activityId 或不是店员，隐藏分享
    if (!userInfo.storeInfo?.storeId || !activityId) {
      hideShareMenu();
      return;
    }

    // 调用接口校验分享权限
    const res = await fetchUserLiveCanShareLive({ activityId, userId });
    if (!res?.data?.canShare) {
      hideShareMenu();
    }
    return;
  }

  // 其他页面：默认不可分享
  hideShareMenu();
}, [userInfo]);
```

### 分享信息来源

分享的标题、图片、路径从哪来？

**两种方式：**

1. **默认值**：WebView 页面预设
2. **H5 传递**：通过 `wx.miniProgram.postMessage` 传给小程序

```typescript
// 默认分享信息
const shareInfoRef = useRef({
  title: '默认标题',
  path: 'page/index/index',
  imageUrl: 'https://cdn.xxx.com/default.png',
});

// 接收 H5 传来的分享信息
const onWebViewMessage = (e) => {
  const messages = e.detail.data || [];
  const lastMessage = messages[messages.length - 1];  // 取最后一条

  if (lastMessage?.type === 'share') {
    shareInfoRef.current = {
      title: lastMessage.data.title,
      path: lastMessage.data.path,
      imageUrl: lastMessage.data.imageUrl,
    };
  }
};

// 分享时使用 ref 中的值
useShareAppMessage(() => ({
  title: shareInfoRef.current.title,
  path: shareInfoRef.current.path,
  imageUrl: shareInfoRef.current.imageUrl,
}));
```

**注意**：`postMessage` 不是实时的，详见 [postMessage不是你想的那样](./postMessage不是你想的那样.md)。

## 消息通信

WebView 组件有 `onMessage` 回调，接收 H5 发来的消息。

```tsx
<WebView
  src={url}
  onMessage={onWebViewMessage}
/>
```

### 消息格式约定

```typescript
interface IWebViewMessage {
  type: 'share' | 'navigate' | 'other';
  data: any;
}

// H5 端发送
wx.miniProgram.postMessage({
  data: {
    type: 'share',
    data: { title, path, imageUrl },
  },
});
```

### 消息触发时机

再强调一次：`onMessage` **不是实时触发的**。

只在以下时机收到消息：
- 用户点击返回
- WebView 组件销毁
- 用户触发分享

所以 `postMessage` 只适合传分享信息，不适合实时通信。

## 支付结果页

WebView 里的 H5 不能直接支付，需要跳转到小程序原生页面。

### 支付流程

```
H5 创建订单 → 获取支付参数 → 跳转小程序支付页 → 调用 wx.requestPayment → 显示结果
```

### 支付结果页实现

```typescript
// page/payment-result/index.tsx
export default function PaymentResult() {
  const [status, setStatus] = useState<'wait' | 'success' | 'cancel' | 'fail'>('wait');

  useLoad((options) => {
    // 1. 解析支付参数
    const params = JSON.parse(decodeURIComponent(options.payParams));

    // 2. 调用微信支付
    Taro.requestPayment({
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType,
      paySign: params.paySign,
    })
      .then(() => {
        setStatus('success');
        // 通知后端支付成功
        updatePayStatus({ orderId: params.orderId, payStatus: 'PAYING' });
      })
      .catch((err) => {
        if (err.errMsg === 'requestPayment:fail cancel') {
          setStatus('cancel');
        } else {
          setStatus('fail');
        }
      });
  });

  return <ResultView status={status} onBack={() => Taro.navigateBack()} />;
}
```

### H5 跳转支付页

```typescript
// H5 端
const handlePay = async () => {
  // 1. 创建订单，获取支付参数
  const payParams = await createOrder();

  // 2. 跳转到小程序支付页
  wx.miniProgram.navigateTo({
    url: `/page/payment-result/index?payParams=${encodeURIComponent(JSON.stringify(payParams))}`,
  });
};
```

### 支付完成后返回

用户支付完成后点击"返回"，调用 `Taro.navigateBack()` 回到 WebView 页面。

**问题**：H5 怎么知道支付成功了？

**方案**：H5 监听页面显示事件，重新查询订单状态。

```typescript
// H5 端
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 页面重新可见，可能是从支付页返回
      refreshOrderStatus();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

## 适老化：字体大小

小程序支持用户调整字体大小，WebView 里的 H5 也要适配。

```typescript
// 小程序获取字体设置
const fontSizeSetting = getGlobalData('fontSizeSetting');

// 传给 H5
const url = setObjToUrlParams(`${domain}/page`, {
  fontSizeSetting,
  // ...
});
```

```typescript
// H5 端应用字体设置
const fontSizeSetting = searchParams.get('fontSizeSetting');
if (fontSizeSetting) {
  document.documentElement.style.fontSize = `${fontSizeSetting}px`;
}
```

## 完整代码结构

```tsx
export default function WebViewPage() {
  const [url, setUrl] = useState('');
  const shareInfoRef = useRef({ title: '', path: '', imageUrl: '' });
  const { userInfo, token } = useAuthStore();

  // 1. 获取目标路径
  useLoad((options) => {
    urlPath.current = decodeURIComponent(options.url);
  });

  // 2. 控制分享菜单
  useEffect(() => {
    // 根据页面类型和用户权限控制
  }, [userInfo]);

  // 3. 构建 URL
  useEffect(() => {
    // 获取域名、拼接参数、设置 url
  }, [unionId, token]);

  // 4. 接收消息
  const onWebViewMessage = (e) => {
    // 更新分享信息
  };

  // 5. 配置分享
  useShareAppMessage(() => shareInfoRef.current);

  return (
    <View className='web-view'>
      {url && <WebView src={url} onMessage={onWebViewMessage} />}
    </View>
  );
}
```

## 常见问题

### URL 太长被截断

微信对 WebView src 的长度有限制。如果参数太多，考虑：
- 精简参数，只传必要的
- 把参数存后端，传一个 token 去换

### H5 白屏

可能原因：
- 域名未配置在小程序后台的业务域名里
- HTTPS 证书问题
- H5 代码报错

### 分享图片不显示

分享图片必须是 HTTPS，且尺寸建议 5:4。
