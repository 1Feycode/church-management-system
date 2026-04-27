import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Card from '../components/common/Card'

function Dashboard() {
  const [totalMembers, setTotalMembers] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)
  const [totalAnnouncements, setTotalAnnouncements] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true)

        // Fetch members count
        const { count: membersCount, error: membersError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })

        if (membersError) {
          console.error('Error fetching members count:', membersError)
        } else {
          setTotalMembers(membersCount || 0)
        }

        // Fetch groups count
        const { count: groupsCount, error: groupsError } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true })

        if (groupsError) {
          console.error('Error fetching groups count:', groupsError)
        } else {
          setTotalGroups(groupsCount || 0)
        }

        // Fetch announcements count
        const { count: announcementsCount, error: announcementsError } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })

        if (announcementsError) {
          console.error('Error fetching announcements count:', announcementsError)
        } else {
          setTotalAnnouncements(announcementsCount || 0)
        }

      } catch (error) {
        console.error('Error fetching counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <div style={styles.cardsGrid}>
        <Card title="Total Members" value={totalMembers} icon="👥" />
        <Card title="Total Groups" value={totalGroups} icon="🤝" />
        <Card title="Announcements" value={totalAnnouncements} icon="📢" />
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    marginBottom: '30px',
    fontSize: '28px',
    color: '#1f2937'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  }
}

export default Dashboard
