import { Navigate, Route, Routes } from 'react-router-dom'

import Inventory from './pages/Inventory'
import Login from './pages/Login'
import Movements from './pages/Movements'
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
      <Route
        path="/movements"
        element={
          <ProtectedRoute>
            <Movements />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  )
}

export default App
