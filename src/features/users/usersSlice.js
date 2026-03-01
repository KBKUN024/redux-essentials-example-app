import { createSelector } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
    }),
  }),
})

export const selectUsersResult = extendedApiSlice.endpoints.getUsers.select()
export const { useGetUsersQuery } = extendedApiSlice

const emptyUsers = []

export const selectAllUsers = createSelector(selectUsersResult, (usersResult) => usersResult?.data ?? emptyUsers)

export const selectUserById = createSelector(
  selectAllUsers,
  (state, userId) => userId,
  (users, userId) => users.find((user) => user.id === userId),
)

export default extendedApiSlice
