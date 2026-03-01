# RTK Query `selectFromResult` 详解

## 一、它是什么

`selectFromResult` 是 RTK Query Hook 的第二个参数（options）中的一个配置项，用于**从缓存结果中派生出你真正需要的数据**，并且只在派生数据变化时才触发组件重渲染。

```javascript
const result = useGetPostsQuery(arg, {
  selectFromResult: (fullResult) => derivedData
})
```

---

## 二、不用它会有什么问题

默认情况下，`useGetPostsQuery()` 返回完整的查询结果：

```javascript
const { data, isLoading, isError, ... } = useGetPostsQuery()
// data = 完整的 posts 数组（可能有几百条）
```

如果你想在组件里只用"某个用户的帖子"，就需要在组件里自己过滤：

```javascript
const { data: allPosts = [] } = useGetPostsQuery()
const postsForUser = allPosts.filter(post => post.user === userId)
```

**这样写的问题：** 每当 `allPosts` 数组里任何一条数据变化（比如某人点了某篇帖子的 reaction），`allPosts` 引用就会变，`UserPage` 就会重渲染，即使这个用户的帖子根本没变。

---

## 三、`selectFromResult` 如何解决这个问题

```javascript
const { postsForUser, isLoading } = useGetPostsQuery(undefined, {
  selectFromResult: ({ data = [], isLoading }) => ({
    postsForUser: data.filter((post) => post.user === userId),
    isLoading,
  }),
})
```

RTK Query 会：
1. 执行 `selectFromResult` 函数，得到派生数据 `{ postsForUser, isLoading }`
2. 用**浅比较（shallow equality）** 对比这次和上次 `selectFromResult` 的返回值
3. 只有返回值真正变化时，才触发组件重渲染

```
其他用户的帖子被点了 reaction
    ↓
state.api 缓存更新（整个 posts 数组引用变化）
    ↓
selectFromResult 重新执行，过滤出 userId 的帖子
    ↓
postsForUser 数组内容没变 → 浅比较相同 → 不重渲染 ✅
```

---

## 四、`selectFromResult` 的参数结构

传入的参数是完整的 RTK Query 结果对象，包含所有状态字段：

```javascript
selectFromResult: ({
  data,           // 请求成功时的数据，未加载完时为 undefined
  isLoading,      // 首次加载中（无缓存时为 true）
  isFetching,     // 任何一次请求进行中（包括后台刷新）
  isSuccess,      // 最近一次请求成功
  isError,        // 最近一次请求失败
  error,          // 错误对象
  currentData,    // 当前参数对应的数据（参数变化时会变为 undefined）
}) => {
  // 返回你需要的派生数据
  return { ... }
}
```

你可以在返回值中自由组合需要的字段：

```javascript
// 只关心 user 和 loading 状态
selectFromResult: ({ data = [], isLoading }) => ({
  user: data.find((u) => u.id === userId),
  isLoading,
})
// Hook 返回值里就只有 user 和 isLoading，多余的字段完全忽略
```

---

## 五、与 `createSelector` 的对比

两者都能解决"派生数据导致多余重渲染"的问题，但使用场景不同：

| 对比项 | `selectFromResult` | `createSelector` |
|---|---|---|
| **数据来源** | RTK Query 缓存（`state.api`） | Redux state 任意位置 |
| **定义位置** | 直接写在 Hook 调用处（组件内） | 必须定义在组件外部 |
| **缓存机制** | 浅比较返回值，每次调用独立 | Memoize（记忆化），缓存上一次结果 |
| **适用场景** | 从 RTK Query 结果派生数据 | 从任意 Redux state 派生数据 |

```javascript
// selectFromResult：写在组件内部，简洁
const { user } = useGetUsersQuery(undefined, {
  selectFromResult: ({ data = [] }) => ({
    user: data.find(u => u.id === userId)
  })
})

// createSelector：必须写在组件外部
const selectUserById = createSelector(
  selectAllUsers,
  (state, userId) => userId,
  (users, userId) => users.find(u => u.id === userId)
)
// 组件内：
const user = useSelector(state => selectUserById(state, userId))
```

---

## 六、当前文件的用法解读（含注解）

```javascript
// ─────────────────────────────────────────────────────────────
// 【问题③】第一个参数为什么是 undefined？
// getUsers 的 endpoint 定义是 query: () => '/users'，不需要任何参数。
// 但 RTK Query Hook 签名固定是 useXxxQuery(arg, options)，
// 要传第二个参数 options，就必须先占位第一个 arg。
// 传 undefined 不影响请求，是"我不需要参数"的惯用写法。
// ─────────────────────────────────────────────────────────────
const { user, isLoading: isUsersLoading } = useGetUsersQuery(undefined, {
//      ↑①                ↑①
// 【问题①】外层解构的 { user, isLoading: isUsersLoading } 来自于哪里？
// 来自 selectFromResult 的【返回值对象】的键名。
// RTK Query 规定：selectFromResult 返回什么对象，Hook 就返回什么对象。
// 所以外层 { user } 就是内层 return { user: ... } 里的那个 user 字段——完全对应。
//
// isLoading 同理：内层 return { ..., isLoading }，
// 外层拿到后用 isLoading: isUsersLoading 重命名，
// 目的是避免和下面 useGetPostsQuery 的 isLoading 产生命名冲突。

  selectFromResult: ({ data = [], isLoading }) => ({
//                    ↑ 这里的 { data, isLoading } 是对 RTK Query 原始结果对象的解构
//                      data   = 接口返回的完整原始数据，这里是用户数组 [{id,name,...}, ...]
//                      data 是「原料」（所有用户），而外层的 user 是「成品」（找到的那一个），
//                      两者不是同一个东西，data 经过 .find() 处理后才变成 user。
//                      = [] 是默认值，防止请求还未完成时 data 为 undefined，导致 .find() 报错

    user: data.find((u) => u.id === userId),
//   ↑ 返回对象的 key 名，外层用 { user } 解构就能拿到这个值

    isLoading,
//  ↑ 返回对象的 key 名，外层用 { isLoading: isUsersLoading } 拿到并改名
  }),
})

// ─────────────────────────────────────────────────────────────
// 【问题④】两个不同的 Hook 会共享缓存吗？
// 不会！这是两个完全独立的请求，各自访问不同的缓存：
//   useGetUsersQuery  → state.api.queries['getUsers(undefined)']
//   useGetPostsQuery  → state.api.queries['getPosts(undefined)']
// 它们请求的是不同接口，缓存互不干扰，各自独立发请求。
//
// "相同 Hook + 相同参数才共享缓存"——例如两个组件都调用
// useGetPostsQuery()，这两次才共享同一份缓存，只发一次请求。
// ─────────────────────────────────────────────────────────────
const { postsForUser, isLoading: isPostsLoading } = useGetPostsQuery(undefined, {
  selectFromResult: ({ data = [], isLoading }) => ({
    postsForUser: data.filter((post) => post.user === userId),
    isLoading,
  }),
})
```

---

## 七、【问题②】reaction 变化了，为什么不触发重渲染？需要分情况

`selectFromResult` 的去重渲染能力对 `find`（返回单个对象）和 `filter`（返回数组）的效果是不同的。

### `user`（来自 `find`）—— 真正不会重渲染 ✅

RTK Query 内部用 Immer 管理缓存，Immer 的特性是：**只有被修改的对象才会得到新引用，未修改的对象保持原有引用不变**。

```
某篇帖子的 reaction +1
    ↓
Immer 只给那篇帖子对象创建新引用，users 数组里的对象引用全部不变
    ↓
selectFromResult 重新执行：data.find(u => u.id === userId)
    ↓
返回的 user 对象引用和上次完全相同（Immer 没有动它）
    ↓
RTK Query 浅比较：{ user: sameRef } vs { user: sameRef } → 相同 → 不重渲染 ✅
```

### `postsForUser`（来自 `filter`）—— 存在局限性 ⚠️

`filter()` 每次执行都会创建一个**全新的数组引用**，即使数组里的元素完全没变：

```
state.api 缓存更新（任意 post 变化）
    ↓
selectFromResult 重新执行：data.filter(post => post.user === userId)
    ↓
filter 返回新数组引用（哪怕内容一样）
    ↓
RTK Query 浅比较：{ postsForUser: oldRef } vs { postsForUser: newRef } → 不同 → 重渲染 ⚠️
```

`selectFromResult` + `filter` **不能完全避免重渲染**。如果需要对数组的派生结果做完整的记忆化，应该在 `selectFromResult` 内部配合 `createSelector` 使用：

```javascript
// 完整的记忆化方案（定义在组件外部）：
const selectPostsByUser = createSelector(
  (result) => result.data ?? [],
  (_, userId) => userId,
  (data, userId) => data.filter(post => post.user === userId)
)

// 组件内使用：
const { postsForUser } = useGetPostsQuery(undefined, {
  selectFromResult: (result) => ({
    postsForUser: selectPostsByUser(result, userId),  // 有真正的 memoize ✅
    isLoading: result.isLoading,
  }),
})
```

对于这个教程场景，直接用 `filter` 是可接受的权衡——重渲染代价很小，逻辑足够清晰。
