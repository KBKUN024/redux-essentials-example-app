import React from 'react'
import { createRoot } from 'react-dom/client'
import extendedApiSlice from './features/users/usersSlice'
import App from './App'

import { worker } from './api/server'
import store from './app/store'
import './primitiveui.css'
import './index.css'
import { Provider } from 'react-redux'

// Wrap app rendering so we can wait for the mock API to initialize
async function start() {
  // Start our mock API server
  await worker.start({ onUnhandledRequest: 'bypass' })
  // 手动 dispatch RTKQ 请求 thunk 将创建一个订阅条目，但随后由你决定[稍后取消订阅该数据]
  //  - 否则数据将永久保留在缓存中。在这种情况下，总是需要用户数据，所以我们可以跳过退订。
  store.dispatch(extendedApiSlice.endpoints.getUsers.initiate())
  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}

start()
