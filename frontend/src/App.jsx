import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login'
import Inventory from './pages/Inventory'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  )
}

export default App
