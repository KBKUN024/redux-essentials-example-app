import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchNotifications, selectAllNotifications } from '../features/notifications/notificationSlice'
export const Navbar = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(selectAllNotifications) as []
  const numOfUnreadNotifications = notifications.filter((noti) => !noti.read).length

  let unreadNotificationsBadge

  const fetchNewNotifications = () => {
    dispatch(fetchNotifications())
  }

  if (numOfUnreadNotifications > 0) {
    unreadNotificationsBadge = <span className="badge">{numOfUnreadNotifications}</span>
  }

  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>

        <div className="navContent">
          <div className="navLinks">
            <Link to="/">文章列表</Link>
            <Link to="/users">用户列表</Link>
            <Link to="/notifications">通知列表 {unreadNotificationsBadge}</Link>
          </div>
          <button className="button" onClick={fetchNewNotifications}>
            Refresh Notifications
          </button>
        </div>
      </section>
    </nav>
  )
}
