import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from '@/routes/Dashboard'
import Auth from '@/routes/Auth'
import { useAuthStore } from '@/stores/auth-store'

export default function AppRouter() {
  const token = useAuthStore((state) => state.token)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={token ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
