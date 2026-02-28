import { useSelector } from 'react-redux'
import { selectUserById } from '../features/users/usersSlice'
export function PostAuthor({ userId }) {
  const author = useSelector((state) => selectUserById(state, userId))
  return <span>by {author ? author.name : 'Unknown author'}</span>
}
