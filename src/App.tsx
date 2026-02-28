import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
import { PostsList, AddPostForm, SinglePostPage, EditPostForm } from './features/posts'
import { UsersList, UserPage } from './features/users'
import { NotificationList } from './features/notifications';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AddPostForm />
                <PostsList />
              </>
            }
          />
          <Route path="/posts/:postId" element={<SinglePostPage />} />
          <Route path="/edit-post/:postId" element={<EditPostForm />} />
          <Route path="/users/" element={<UsersList />} />
          <Route path="/users/:userId" element={<UserPage />} />
          <Route path="/notifications" element={<NotificationList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
