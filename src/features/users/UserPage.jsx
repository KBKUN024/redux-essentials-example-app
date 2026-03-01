import { Link, useParams } from 'react-router-dom'
import { useGetUsersQuery } from './usersSlice'
import { useGetPostsQuery } from '../api/apiSlice'

export function UserPage() {
  const { userId } = useParams()

  // 用 selectFromResult 从查询结果中派生数据，避免不必要的重渲染
  const { user, isLoading: isUsersLoading } = useGetUsersQuery(undefined, {
    selectFromResult: ({ data = [], isLoading }) => ({
      user: data.find((u) => u.id === userId),
      isLoading,
    }),
  })

  const { postsForUser, isLoading: isPostsLoading } = useGetPostsQuery(undefined, {
    selectFromResult: ({ data = [], isLoading }) => ({
      postsForUser: data.filter((post) => post.user === userId),
      isLoading,
    }),
  })

  if (isUsersLoading || isPostsLoading) {
    return (
      <section>
        <h2>Loading...</h2>
      </section>
    )
  }

  if (!user) {
    return (
      <section>
        <h2>找不到该用户</h2>
      </section>
    )
  }

  const postTitles = postsForUser.map((post) => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))

  return (
    <section>
      <h2>{user.name}</h2>
      <ul>{postTitles}</ul>
    </section>
  )
}
