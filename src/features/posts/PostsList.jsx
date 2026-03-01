import { useEffect, memo, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAllPosts, fetchPosts, selectPostIds, selectPostById } from '../posts/postSlice'
import { Link } from 'react-router-dom'
import { PostAuthor } from '../../components'
import { TimeAgo } from '../posts/TimeAgo'
import { ReactionButtons } from '../posts/ReactionButtons'
import { Spinner } from '../../components/Spinner'
import { useGetPostsQuery } from '../api/apiSlice'
import classnames from 'classnames'

const PostExcerpt = memo(({ post }) => {
  return (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>

      <ReactionButtons post={post} />
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
})

export function PostsList() {
  const { data: posts = [], isLoading, isFetching, isSuccess, isError, error, refetch } = useGetPostsQuery()

  const sortedPosts = useMemo(() => {
    const sortedPosts = posts.slice()
    sortedPosts.sort((a, b) => b.date.localeCompare(a.date))
    return sortedPosts
  }, [posts])

  let content

  if (isLoading) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    const renderedPosts = sortedPosts.map((post) => <PostExcerpt post={post} key={post.id} />)

    const containerClassname = classnames('posts-container', {
      disabled: isFetching,
    })

    content = <div className={containerClassname}>{renderedPosts}</div>
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts ({isLoading ? 0 : posts.length})</h2>
      {/* <button onClick={refetch}>Refetch Posts</button> */}
      {content}
    </section>
  )
}
