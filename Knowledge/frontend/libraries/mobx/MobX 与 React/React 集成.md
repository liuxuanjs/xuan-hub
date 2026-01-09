使用方法：

```jsx
import { observer } from "mobx-react-lite";
const MyComponent = observer(props => ReactElement);
```

虽然 MobX 可独立于 React 运行，但它们最常一起使用。在 MobX 的要点中，您已经看到了这种集成的最重要部分：您可以将 `observer` HoC 包在 React 组件周围。

`observer` 由您在安装时选择的单独 React 绑定包提供。在本示例中，我们将使用更轻量级的 `mobx-react-lite` 包。

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

class Timer {
	secondsPassed = 0
	constructor() {
		makeAutoObservable(this)
	}
	increaseTimer() {
		this.secondsPassed += 1
	}
} 
	
const myTimer = new Timer();

// A function component wrapped with `observer` will react
// to any future change in an observable it used before.
const TimerView = observer(({ timer }) => (
	<span>Seconds passed: {timer.secondsPassed}</span>
));

ReactDOM.render(<TimerView timer={myTimer} />, document.body);

setInterval(() => { myTimer.increaseTimer() }, 1000);
```

`observer` HoC 会自动订阅 React 组件在渲染过程中使用的任何可观测对象。因此，当相关的可观测对象发生变化时，组件将自动重新渲染。它还确保组件在没有相关更改时不会重新渲染。因此，虽然组件可以访问但实际上未被读取的可观测对象永远不会导致重新渲染。

在实践中，这使得 MobX 应用程序非常优化，并且通常不需要任何额外的代码来防止过度渲染。

为了使 `observer` 工作，重要的是可观测对象如何到达组件并不重要，只需读取它们。深度读取可观测对象是可以的，像 `todos[0].author.displayName` 这样复杂的表达式可以直接使用。与其他框架相比，这使得订阅机制更加精确和高效，在其他框架中数据依赖关系必须显式声明或预先计算（例如选择器）。

## 本地和外部状态

在如何组织状态方面有很大的灵活性，因为我们读取哪个观测值或观测值来自哪里并不重要（技术上是这样）。下面的示例演示了如何在使用 `observer` 包装的组件中使用外部和本地可观测状态的不同模式。

### 在 `observer` 组件中使用外部状态

#### 使用 `props`

观察项可以作为道具传递到组件中（如上面的例子）：
```jsx
import { observer } from "mobx-react-lite"  
  
const myTimer = new Timer(); // See the Timer definition above.  
  
const TimerView = observer(({ timer }) => (
	<span>Seconds passed: {timer.secondsPassed}</span>
));

// Pass myTimer as a prop.  
ReactDOM.render(<TimerView timer={myTimer} />, document.body);
```

#### 使用全局变量

由于我们如何获得可观察对象的引用并不重要，因此我们可以直接从外部作用域（包括导入等）使用可观察对象：
```jsx
const myTimer = new Timer(); // See the Timer definition above.  

// No props, `myTimer` is directly consumed from the closure.  
const TimerView = observer(() => (
	<span>Seconds passed: {myTimer.secondsPassed}</span>
));

ReactDOM.render(<TimerView />, document.body);
```
直接使用观察对象效果很好，但由于这通常会引入模块状态，因此这种模式可能会使单元测试变得复杂。相反，我们建议使用 React Context。


#### 使用 React Context

React Context 是一个很好的机制，可以与整个子树共享可观察对象。
```jsx
import {observer} from 'mobx-react-lite';  
import {createContext, useContext} from "react";  

const TimerContext = createContext<Timer>();  

const TimerView = observer(() => {  
	// Grab the timer from the context.  
	const timer = useContext(TimerContext); // See the Timer definition above.  
	return (  
		<span>Seconds passed: {timer.secondsPassed}</span>  
	);
});

ReactDOM.render(  
	<TimerContext.Provider value={new Timer()}>  
		<TimerView />  
	</TimerContext.Provider>,  
	document.body
);
```
请注意，我们不建议将 `Provider` 的 `value` 替换为不同的 `value` 。使用 MobX 时，应该不需要这样做，因为共享的可观测变量可以自行更新。


### 在 `observer` 组件中使用本地状态

由于 `observer` 使用的观测值可以来自任何地方，因此它们也可以是本地状态。同样，我们也有不同的选择。

#### 使用可观察类的`useState`

最简单方法是用 `useState` 存储对可观测类的引用。请注意，由于我们通常不想替换引用，因此我们完全可以忽略 `useState` 返回的更新函数：
```jsx
import { observer } from "mobx-react-lite";  
import { useState } from "react";  

const TimerView = observer(() => {
	// See the Timer definition above. 
	const [timer] = useState(() => new Timer()); 
	return <span>Seconds passed: {timer.secondsPassed}</span>  
});

ReactDOM.render(<TimerView />, document.body);
```
如果您想自动更新计时器，就像我们在原始示例中所做的那样， `useEffect` 可以以典型的 React 方式使用：
```jsx
useEffect(() => {  
	const handle = setInterval(() => {  
		timer.increaseTimer();
	}, 1000);

	return () => {  
		clearInterval(handle);
	}
}, [timer]);
```

#### 您可能不需要本地可观察状态

通常情况下，我们建议不要过快地使用 `MobX observables` 来处理本地组件状态，因为这理论上可能会使您无法使用 React 的 Suspense 机制的某些功能。作为一个经验法则，在状态捕获领域数据（包括子组件）时，请使用 MobX observables。例如待办事项、用户、预订等。

在 React 组件中使用 `MobX observables` 可在以下情况下，才更有价值:
- 具有深度
- 具有计算值
- 与其他 `observer` 组件共享


## 始终在观察者组件内部读取可观测对象

您可能会想知道，何时应用观察者模式？经验法则是：将观察者应用于所有读取可观测数据的组件。

`observer` 仅增强您正在装饰的组件，而不是由其调用的组件。因此，通常所有组件都应该被 `observer` 包裹。不要担心，这并不低效。相反，更多的 `observer` 组件使渲染更加高效，因为更新变得更加细粒化。

## 提示：尽可能晚地从对象中获取值

`observer` 在尽可能长时间内传递对象引用，并且仅在基于 `observer` 的组件中读取它们的属性时效果最佳，这些组件将把它们渲染到DOM / 低级组件中。换句话说，`observer` 会对您从对象中“取消引用”值做出反应。

在上例中，如果 `TimerView` 组件定义如下，它将不会对未来的更改做出反应，因为 `.secondsPassed` 并不是在 `observer` 组件内部读取的，而是在外部读取的，因此不会被跟踪：

```jsx
const TimerView = observer(({ secondsPassed }) => (
	<span>Seconds passed: {secondsPassed}</span>
));

React.render(<TimerView secondsPassed={myTimer.secondsPassed} />, document.body);
```

请注意，这与其他库（如 `react-redux` 库）的思路不同，在其他库中，提前取消引用并向下传递基元是一种良好的做法，这样可以更好地利用 memoization。如果问题不完全清楚，请务必查看[[理解反应性]] 部分。


