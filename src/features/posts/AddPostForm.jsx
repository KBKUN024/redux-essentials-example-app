import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addNewPost } from '../posts/postSlice'
import { selectAllUsers } from '../users/usersSlice'

export function AddPostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('')
  const [addRequestStatus, setAddRequestStatus] = useState('idle')

  const users = useSelector(selectAllUsers)
  const dispatch = useDispatch()

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onContentChanged = (e) => setContent(e.target.value)
  const onAuthorChanged = (e) => setUserId(e.target.value)

  const canSave = [title, content, userId].every(Boolean) && addRequestStatus === 'idle'

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        setAddRequestStatus('pending')
        const res = await dispatch(addNewPost({ title, content, user: userId })).unwrap() // unwrap()作用？
        console.log('res:', res)
        setTitle('')
        setContent('')
      } catch (error) {
        console.log('Failed to save the post: ', error)
      } finally {
        setAddRequestStatus('idle')
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
      {addRequestStatus}
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
