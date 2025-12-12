import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Guilds from './pages/Guilds.jsx'
import GuildDetail from './pages/GuildDetail.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/guilds" replace/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/guilds" element={<Guilds/>} />
        <Route path="/guilds/:id" element={<GuildDetail/>} />
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </Layout>
  )
}