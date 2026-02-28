import { useSelector, useDispatch } from 'react-redux'
import { selectAllNotifications, allNotificationsRead } from './notificationSlice'
import { selectAllUsers } from '../users/usersSlice'
import { parseISO, formatDistanceToNow } from 'date-fns'
import classNames from 'classnames'
import { useLayoutEffect } from 'react'

export function NotificationList() {
  const notifications = useSelector(selectAllNotifications)
  const users = useSelector(selectAllUsers)
  const dispatch = useDispatch()

  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
    return () => {
    }
  }, [notifications])

  const renderedNotifications = notifications.map((notification) => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user = users.find((user) => user.id === notification.user) || { name: 'Unknown User' }

    const notificationClassname = classNames('notification', {
      new: notification.isNew,
    })

    return (
      <div key={notification.id} className={notificationClassname}>
        <div>
          <b>{user.name}</b> {notification.message}
        </div>
        <div title={notification.date}>
          <i>{timeAgo} ago</i>
        </div>
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
