
属性、整个对象、数组、映射和集合都可以成为可观察对象。使对象可观察的基本方法是使用 `makeObservable` 为每个属性指定一个注解。最重要的注释包括

- `observable` 定义了一个存储状态的可跟踪字段。
- `action` 将方法标记为将修改状态的操作。
- `computed` 标记了一个获取器，该获取器将从状态中获取新事实并缓存其输出。

## `makeObservable`

使用方法：
- `makeObservable(target, annotations?, options?)`

该函数可用于使现有对象属性成为可观测属性。任何 JavaScript 对象（包括类实例）都可以传入 `target` 中。 `makeObservable` 通常用于类的构造函数，其第一个参数是 `this` 。 `annotations` 参数将注释映射到每个成员。只有被注释的成员才会受到影响。

或者，可以在类成员上使用 `@observable` 等装饰器，而不是在构造函数中调用 `makeObservable` 


## `makeAutoObservable`

使用方法：
-  `makeAutoObservable(target, overrides?, options?)`

`makeAutoObservable` 就像是增强版的 `makeObservable`，因为它默认推断所有属性。但是你可以使用 `overrides` 参数来覆盖特定注解的默认行为 — 特别地，`false` 可以用于排除一个属性或方法完全不被处理。

与使用 `makeObservable` 相比， `makeAutoObservable` 函数更简洁，更易于维护，因为新成员不必明确提及。但是， `makeAutoObservable` 不能用于有 super 或被 subclassed 的类。

推断规则：

- 所有自有属性都变成 `observable` 。
- 所有 `getters` 都变成 `computed` 。
- 所有 `setters` 都变成 `action` 。
- 所有函数都变成 `autoAction` 。
- 所有生成器函数都将变为 `flow` （请注意，生成器函数在某些转码器配置中无法检测，如果流程不能按预期运行，请确保明确指定 `flow` ）。
- 在 `overrides` 参数中标记为 `false` 的成员将不会被注释。例如，将其用于标识符等只读字段。


