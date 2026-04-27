import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Members from '../pages/Members'
import GroupsAdvanced from '../pages/GroupsAdvanced'
import Announcements from '../pages/Announcements'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/members" element={<Members />} />
      <Route path="/groups" element={<GroupsAdvanced />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
