import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import { client } from '../../api/client'

const notificationAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

export const fetchNotifications = createAsyncThunk('notificaiton/fetchNotifications', async (_, { getState }) => {
  const allNotifications = selectAllNotifications(getState())
  console.log('allNotifications:', allNotifications)
  const [latestNotification] = allNotifications
  const latestTimestamp = latestNotification ? latestNotification.date : ''
  const response = await client.get(`/fakeApi/notifications?since=${latestTimestamp}`)
  return response.data
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationAdapter.getInitialState(),
  reducers: {
    allNotificationsRead(state, action) {
      Object.values(state.entities).forEach((notification) => {
        notification.read = true
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      console.log('fetchNotifications.actionpayload:',action.payload)
      notificationAdapter.upsertMany(state, action.payload)
      Object.values(state.entities).forEach((notification) => {
        notification.isNew = !notification.read // 没读过就是新的，读过就不是新的了
      })
      // // 以最新的优先排序
      // state.sort((a, b) => b.date.localeCompare(a.date))
    })
  },
})

export default notificationSlice.reducer

export const { allNotificationsRead } = notificationSlice.actions

export const { selectAll: selectAllNotifications } = notificationAdapter.getSelectors((state) => state.notifications)
