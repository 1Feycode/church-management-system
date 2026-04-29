import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Members from '../pages/Members'
import GroupsAdvanced from '../pages/GroupsAdvanced'
import Announcements from '../pages/Announcements'
import Events from '../pages/Events'
import PrayerRequests from '../pages/PrayerRequests'
import BibleStudies from '../pages/BibleStudies'
import BibleStudyDetail from '../pages/BibleStudyDetail'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/members" element={<Members />} />
      <Route path="/groups" element={<GroupsAdvanced />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/events" element={<Events />} />
      <Route path="/prayer-requests" element={<PrayerRequests />} />
      <Route path="/bible-studies" element={<BibleStudies />} />
      <Route path="/bible-study/:id" element={<BibleStudyDetail />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
