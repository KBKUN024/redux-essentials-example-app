import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { postUpdated, selectPostById } from './postSlice'
import { useEditPostMutation, useGetPostQuery } from '../api/apiSlice'

export function EditPostForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { postId } = useParams()

  const { data: post } = useGetPostQuery(postId)
  const [updatePost, { isLoading }] = useEditPostMutation()

  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onContentChanged = (e) => setContent(e.target.value)

  const onSavePostClicked = async () => {
    if (title && content) {
      await updatePost({ id: postId, title, content })
      navigate(`/posts/${postId}`)
    }
  }

  return (
    <section>
      <h2>编辑文章</h2>
      <form>
        <label htmlFor="postTitle">文章标题：</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          placeholder="What's on your mind?"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postContent">内容：</label>
        <textarea id="postContent" name="postContent" value={content} onChange={onContentChanged} />
      </form>
      <button type="button" onClick={onSavePostClicked}>
        保存文章
      </button>
    </section>
  )
}
