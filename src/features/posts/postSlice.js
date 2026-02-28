import { createSlice, nanoid, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import { client } from '../../api/client'

const initialReactions = {
  thumbsUp: 0,
  hooray: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
}

const postAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState = postAdapter.getInitialState({
  status: 'idle',
  error: null,
})

/**
 * 两个参数的意思分别是：
 * 1. action type string，通常是 "slice name/action name" 的格式
 * 2. payload creator function，接受一个参数并返回一个 Promise 对象
 * 这个函数会被 createAsyncThunk 自动调用，并且在 Promise 对象 resolve 时 dispatch 一个 action，action 的 payload 就是 resolve 的值。
 */
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // payload 创建者接收部分“{title, content, user}”对象
  async (initialPost) => {
    // 我们发送初始数据到 API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // 响应包括完整的帖子对象，包括唯一 ID
    return response.data
  },
)

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer: (state, action) => {
        state.posts.push(action.payload)
      },
      prepare: (title, content, userId) => {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            user: userId,
            reactions: initialReactions,
            date: new Date().toISOString(),
          },
        }
      },
    },
    postUpdated: (state, action) => {
      const { id, title, content } = action.payload
      const post = state.entities[id]
      if (post) {
        post.title = title
        post.content = content
      }
    },
    postRemoved: (state, action) => {
      let index_remove = 0
      state.posts.find((item, index) => {
        if (item.id === action.payload) {
          index_remove = index
        }
      })
      state.posts.splice(index_remove, 1)
    },
    reactionAdded: {
      reducer: (state, action) => {
        const { postId, reaction } = action.payload
        console.log('postId:', postId, 'reaction:', reaction)
        const existingPost = state.entities[postId]
        if (existingPost) {
          console.log(' existingPost.reactions', existingPost.reactions[reaction])
          existingPost.reactions[reaction]++
        }
      },
      prepare: (postId, reaction) => {
        return {
          payload: {
            postId,
            reaction,
          },
        }
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // const existingIds = new Set(state.entities[id])
        // const newPosts = action.payload.filter((post) => !existingIds.has(post.id))
        postAdapter.upsertMany(state, action.payload) // 如果 action.payload 中有任何项目已经存在于我们 state 中，upsertMany 函数将根据匹配的 ID 将它们合并在一起。即：会自动去重
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // 我们可以直接将新的帖子对象添加到我们的帖子数组中
        console.log('haha')
        postAdapter.addOne(action.payload)
      })
  },
  //   selectors: {
  //     selectAllPosts: (state) => state.posts,
  //     selectPostById: (state, postId) => state.posts.find((post) => post.id === postId),
  //   },
})

export const { postAdded, postRemoved, postUpdated, reactionAdded } = postSlice.actions
// 其实下面直接就用key的值就行，为什么还要诸如：selectAll: selectAllPosts 这样呢？因为我们使用到的代码中是selectAllPosts，
// 为了适配不改那么多地方，就在这里给selectAll起个别名叫selectAllPosts
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postAdapter.getSelectors((state) => state.posts)

export default postSlice.reducer
