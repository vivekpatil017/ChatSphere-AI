import React from 'react'
import AppRoutes from './routers/AppRoutes'
import UserContext from './context/User.context'
const App = () => {
  return (
    <UserContext>
      <AppRoutes />
    </UserContext>
  )
}

export default App