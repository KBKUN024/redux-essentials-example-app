import { reactionAdded } from '../posts/postSlice'
import { useDispatch } from 'react-redux'

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
}

export function ReactionButtons({ post }) {
  const dispatch = useDispatch()
  const addReactionEmoji = (name) => {
    dispatch(reactionAdded(post.id, name))
  }
  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button key={name} className="muted-button reaction-button" onClick={() => addReactionEmoji(name)}>
        {emoji} {post.reactions[name]}
      </button>
    )
  })
  return <div>{reactionButtons}</div>
}
