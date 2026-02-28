import { useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { ReactionButtons } from '../posts/ReactionButtons'
import { selectPostById } from '../posts/postSlice'
import { useGetPostQuery } from '../api/apiSlice'
import { Spinner } from '../../components/Spinner'
import { PostAuthor } from '../../components'
import { TimeAgo } from './TimeAgo'
export function SinglePostPage() {
  const { postId } = useParams()

  const { data: post, isFetching, isSuccess, isError } = useGetPostQuery(postId) // 传入自定义的参数

  let content

  if (isFetching) {
    content = <Spinner text="Loading..." />
  } else if (isSuccess) {
    content = (
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
      </article>
    )
  }

  if (isError) {
    return (
      <section>
        <h2>页面未找到！</h2>
      </section>
    )
  }

  return <section>{content}</section>
}
