import { useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { ReactionButtons } from '../posts/ReactionButtons'
import { selectPostById } from '../posts/postSlice'
export function SinglePostPage() {
  const { postId } = useParams()

  const post = useSelector((state) => selectPostById(state, postId))

  if (!post) {
    return (
      <section>
        <h2>页面未找到！</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        <Link to={`/edit-post/${postId}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  )
}
