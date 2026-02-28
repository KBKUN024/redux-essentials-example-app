import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import { client } from '../../api/client'

const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState({ status: 'idle' })

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

export const usersSlice = createSlice({
  name: 'users',
  initialState,
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

export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => state.users,
)

export const selectUsersStatus = (state) => state.users.status

export default usersSlice.reducer
