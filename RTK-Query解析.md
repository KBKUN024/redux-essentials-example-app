# RTK Query 与 `apiSlice.js` 详解

## 文件内容回顾

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
    }),
  }),
})

export const { useGetPostsQuery } = apiSlice
```

---

## 问题一：`createApi` 到底在干什么？

`createApi` **一次性自动生成**了通常需要你手写的所有 Redux 数据请求样板代码，包括：

| 自动生成的东西 | 对应你之前手写的代码 |
|---|---|
| `slice.reducer` | `createSlice` + `extraReducers` 里的 pending/fulfilled/rejected |
| `thunk` 异步请求函数 | `createAsyncThunk` |
| `loading` / `error` 状态管理 | `state.status`、`state.error` |
| `React Hook`（如 `useGetPostsQuery`） | 无，你之前要自己写 `useEffect` + `useSelector` + `useDispatch` |
| 缓存管理 | 无，你之前完全没有缓存 |

一句话：**`createApi` 是 RTK Query 的核心，它把"发请求 → 管状态 → 给组件用"这条完整链路全部自动化了。**

---

## 问题二：`reducerPath` 是在干嘛？

`reducerPath: 'api'` 指定了这个 API slice 的 reducer **挂载到全局 Redux state 上的 key 名**。

你需要在 `store.js` 中这样注册它：

```javascript
import { apiSlice } from '../features/api/apiSlice'

export default configureStore({
  reducer: {
    posts: postsReducer,
    users: usersReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,  // → state.api = { ... }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})
```

注册后全局 state 里 `state.api` 就是 RTK Query 自动管理的缓存区域，里面存放了所有请求的结果、loading 状态、错误信息等。

> 注意：`middleware` 也必须注册，RTK Query 用它来处理缓存过期、轮询等功能。

---

## 问题三：`baseQuery` 和 `fetchBaseQuery` 是干嘛的？

### `baseQuery` 的作用

`baseQuery` 是所有请求的**底层执行器**，类似于 axios 的实例配置。每个 endpoint 发请求时，都会通过 `baseQuery` 来实际执行网络调用。

### `fetchBaseQuery` 的作用

`fetchBaseQuery` 是 RTK Query 内置的、基于浏览器原生 `fetch` API 封装的基础查询函数，它负责：

- 拼接完整 URL：`baseUrl + endpoint 里的 path`
- 设置请求头（如 `Authorization` token）
- 自动解析 JSON 响应
- 统一处理错误

```javascript
fetchBaseQuery({ baseUrl: '/fakeApi' })
// 发请求时：'/fakeApi' + '/posts' = '/fakeApi/posts'
```

### 两者的关系

```
endpoint.query()          baseQuery              网络
返回路径 '/posts'   →   fetchBaseQuery 拼接 URL  →  GET /fakeApi/posts
                         并执行 fetch()
```

`baseQuery` 是"规则"，`fetchBaseQuery` 是"规则的具体实现"。你也可以自己实现一个 `baseQuery` 替换掉 `fetchBaseQuery`（比如用 axios）。

---

## 问题四：`endpoints` 和两个 `query` 分别是什么？

### `endpoints` 的作用

`endpoints` 是你定义**所有 API 接口**的地方，每一个 endpoint 对应一个具体的请求。可以定义很多个：

```javascript
endpoints: (builder) => ({
  getPosts: builder.query({ ... }),       // GET 所有帖子
  getPostById: builder.query({ ... }),    // GET 单个帖子
  addPost: builder.mutation({ ... }),     // POST 新建帖子
  deletePost: builder.mutation({ ... }), // DELETE 删除帖子
})
```

- `builder.query`：用于**读取数据**（GET），会缓存结果
- `builder.mutation`：用于**写入数据**（POST/PUT/DELETE），会让缓存失效

### 为什么 `builder.query` 里面还要再写一个 `query`？

这两个 `query` 的含义完全不同，名字撞车了容易混淆：

```javascript
getPosts: builder.query({     // ← 外层 query：声明"这是一个查询型 endpoint"
  query: () => '/posts',      // ← 内层 query：一个函数，返回"请求的路径或配置"
})
```

| | 是什么 | 作用 |
|---|---|---|
| `builder.query(...)` | RTK Query 的方法 | 声明这个 endpoint 是"查询"类型（有缓存） |
| `query: () => '/posts'` | 你写的配置函数 | 告诉 baseQuery 请求哪个路径，可以接收参数 |

内层 `query` 函数可以接收参数，比如：

```javascript
getPostById: builder.query({
  query: (postId) => `/posts/${postId}`,  // 根据 postId 动态拼接路径
})
```

---

## 问题五：`useGetPostsQuery` 是什么？要怎么用？

### 它是什么

`useGetPostsQuery` 是 `createApi` **自动生成**的 React Hook，命名规则是：

```
use + 端点名（首字母大写） + Query
   ↑         ↑                ↑
固定前缀   getPosts → GetPosts   固定后缀（query 类型）
```

如果是 `mutation` 类型，生成的是 `use + 端点名 + Mutation`，例如 `useAddPostMutation`。

### 它替代了什么

用这个 Hook 之前，你需要手写：

```javascript
// 旧写法（你之前的代码）
const dispatch = useDispatch()
const posts = useSelector(selectAllPosts)
const status = useSelector(state => state.posts.status)

useEffect(() => {
  if (status === 'idle') {
    dispatch(fetchPosts())
  }
}, [status, dispatch])
```

用 `useGetPostsQuery` 之后，以上全部浓缩为一行：

```javascript
// 新写法（RTK Query）
const { data: posts, isLoading, isSuccess, isError, error } = useGetPostsQuery()
```

### 完整的使用示例

```jsx
import { useGetPostsQuery } from '../api/apiSlice'

export function PostsList() {
  const {
    data: posts = [],    // 请求成功后的数据，默认 []
    isLoading,           // 首次加载中（无缓存时）
    isSuccess,           // 请求成功
    isError,             // 请求失败
    error,               // 错误信息
  } = useGetPostsQuery() // 组件挂载时自动发请求，无需 useEffect

  if (isLoading) return <Spinner text="Loading..." />
  if (isError) return <div>{error.toString()}</div>

  return (
    <section>
      {posts.map(post => <PostExcerpt key={post.id} post={post} />)}
    </section>
  )
}
```

### 与旧方式的核心区别

| 能力 | 旧方式（createAsyncThunk） | RTK Query（useGetPostsQuery） |
|---|---|---|
| 发请求 | `useEffect` + `dispatch(fetchPosts())` | Hook 自动触发 |
| 读数据 | `useSelector(selectAllPosts)` | `const { data } = useGetPostsQuery()` |
| loading 状态 | `useSelector(state => state.posts.status)` | `const { isLoading } = useGetPostsQuery()` |
| 缓存 | 无（每次都重新请求） | 自动缓存，相同参数不重复请求 |
| 代码量 | 多（slice + thunk + selector + useEffect） | 极少（一行 Hook） |
