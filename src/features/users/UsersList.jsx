import { useSelector } from 'react-redux'
import { selectAllUsers } from '../users/usersSlice'
import { Link } from 'react-router-dom'
import { useGetUsersQuery } from '../users/usersSlice'
import { Spinner } from '../../components/Spinner'

export function UsersList() {
  const { data: users, isFetching, isSuccess, isError, error } = useGetUsersQuery()

  if (isFetching) {
    return (
      <section>
        <Spinner text="User Loading..." />
      </section>
    )
  } else if (isSuccess) {
    const renderedUsers = users.map((user) => (
      <li key={user.id}>
        <Link to={`/users/${user.id}`}>{user.name}</Link>
      </li>
    ))

    return (
      <section>
        <h2>Users</h2>
        <ul>{renderedUsers}</ul>
      </section>
    )
  }
  if (isError) {
    return <section>{error}</section>
  }
}
