import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { selectUserById, selectUsersStatus } from './usersSlice'
import { selectAllPosts } from '../posts/postSlice'
import { createSelector } from '@reduxjs/toolkit'

// 定义在组件外部，createSelector 会缓存上一次的计算结果
// 只有当 allPosts 或 userId 真正变化时才重新计算，返回稳定的数组引用
const selectPostsByUser = createSelector(
  selectAllPosts,
  (state, userId) => userId,
  (allPosts, userId) => allPosts.filter((post) => post.user === userId),
)

export function UserPage() {
  const { userId } = useParams()
  const usersStatus = useSelector(selectUsersStatus)
  const user = useSelector((state) => selectUserById(state, userId))
  const postsForUser = useSelector((state) => selectPostsByUser(state, userId))

  if (usersStatus === 'idle' || usersStatus === 'loading') {
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
