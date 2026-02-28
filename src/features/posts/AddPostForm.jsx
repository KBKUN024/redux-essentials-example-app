import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addNewPost } from '../posts/postSlice'
import { selectAllUsers } from '../users/usersSlice'
import { useAddNewPostMutation } from '../api/apiSlice'

export function AddPostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('')
  const [addNewPost, { isLoading }] = useAddNewPostMutation()

  const users = useSelector(selectAllUsers)

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onContentChanged = (e) => setContent(e.target.value)
  const onAuthorChanged = (e) => setUserId(e.target.value)

  const canSave = [title, content, userId].every(Boolean) && !isLoading

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        const res = await addNewPost({ title, content, user: userId }).unwrap()
        console.log('res:', res)
        setTitle('')
        setContent('')
      } catch (error) {
        console.log('Failed to save the post: ', error)
      }
    }
  }

  const userOptions = users.map((user) => (
    <option value={user.id} key={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
      <h2>添加新文章</h2>
      <form>
        <label htmlFor="postTitle">文章标题:</label>
        <input type="text" id="postTitle" value={title} name="postTitle" onChange={onTitleChanged} />
        <label htmlFor="postAuthor">文章作者:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          {userOptions}
        </select>
        <label htmlFor="postContent">文章内容:</label>
        <textarea id="postContent" value={content} name="postContent" onChange={onContentChanged} />
        <button type="button" disabled={!canSave} onClick={onSavePostClicked}>
          保存文章
        </button>
      </form>
    </section>
  )
}
