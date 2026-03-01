import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { client } from '../../api/client'
import { apiSlice } from '../api/apiSlice'

/* 暂时忽略适配器 - 我们很快会再次使用它
const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState({ status: 'idle' })
*/

// 调用 `someEndpoint.select(someArg)` 会生成一个新的 selector，该 selector 将返回
// 带有这些参数的查询的查询结果对象。
// 要为特定查询参数生成 selector，请调用 `select(theQueryArg)`。
// 在这种情况下，用户查询没有参数，所以我们不向 select() 传递任何内容
export const selectUsersResult = apiSlice.endpoints.getUsers.select()

const emptyUsers = []

export const selectAllUsers = createSelector(selectUsersResult, (usersResult) => usersResult?.data ?? emptyUsers)

export const selectUserById = createSelector(
  selectAllUsers,
  (state, userId) => userId,
  (users, userId) => users.find((user) => user.id === userId),
)

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

// 由于有了RTK Query的存在，我们用了getUsers.select()生成selector, 所以usersSlice 已不再使用
export const usersSlice = createSlice({
  name: 'users',
  emptyUsers,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        usersAdapter.setAll(state, action.payload)
        console.log(initialState)
      })
  },
  selectors: {
    // selectAllUsers: (state) => state.users,
    // selectUserById: (state, userId) => state.users.find((user) => user.id === userId),
  },
})

/* 暂时忽略 selector——我们稍后再讨论
export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => state.users,
)
*/
export const selectUsersStatus = (state) => state.users.status

export default usersSlice.reducer
