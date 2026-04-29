import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function BibleStudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState('medium') // small, medium, large
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    loadStudy()
  }, [id])

  async function loadStudy() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching bible study:', error)
        throw error
      }

      console.log('Bible study data:', data)
      setStudy(data)
    } catch (error) {
      console.error('Error loading bible study:', error)
      alert('Error loading bible study: ' + error.message)
      navigate('/bible-studies')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function increaseFontSize() {
    if (fontSize === 'small') setFontSize('medium')
    else if (fontSize === 'medium') setFontSize('large')
  }

  function decreaseFontSize() {
    if (fontSize === 'large') setFontSize('medium')
    else if (fontSize === 'medium') setFontSize('small')
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode)
  }

  if (loading) {
    return (
      <div style={getStyles(darkMode, fontSize).loadingContainer}>
        <p>Loading Bible study...</p>
      </div>
    )
  }

  if (!study) {
    return (
      <div style={getStyles(darkMode, fontSize).loadingContainer}>
        <p>Bible study not found.</p>
      </div>
    )
  }

  const styles = getStyles(darkMode, fontSize)

  return (
    <div style={styles.pageContainer}>
      {/* Minimal Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/bible-studies')} style={styles.backButton}>
          ← Back
        </button>
        
        <div style={styles.controls}>
          <button onClick={decreaseFontSize} style={styles.controlButton} disabled={fontSize === 'small'}>
            A-
          </button>
          <button onClick={increaseFontSize} style={styles.controlButton} disabled={fontSize === 'large'}>
            A+
          </button>
          <button onClick={toggleDarkMode} style={styles.controlButton}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Reading Content */}
      <div style={styles.contentContainer}>
        <article style={styles.article}>
          {/* Title Section */}
          <header style={styles.titleSection}>
            <h1 style={styles.title}>{study.title}</h1>
            <p style={styles.date}>📅 {formatDate(study.created_at)}</p>
          </header>

          {/* Verses Section */}
          <section style={styles.versesSection}>
            <div style={styles.versesSectionLabel}>
              <span style={styles.versesIcon}>📜</span>
              <span style={styles.versesLabelText}>Scripture</span>
            </div>
            <blockquote style={styles.versesText}>
              {study.verses}
            </blockquote>
          </section>

          {/* Notes Section */}
          <section style={styles.notesSection}>
            <div style={styles.notesSectionLabel}>
              <span style={styles.notesIcon}>✍️</span>
              <span style={styles.notesLabelText}>Study Notes</span>
            </div>
            <div style={styles.notesText}>
              {study.notes}
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}

// Dynamic styles based on dark mode and font size
function getStyles(darkMode, fontSize) {
  // Font size mappings
  const fontSizes = {
    small: {
      title: '24px',
      verses: '16px',
      notes: '15px',
      label: '12px',
      date: '13px'
    },
    medium: {
      title: '28px',
      verses: '18px',
      notes: '16px',
      label: '13px',
      date: '14px'
    },
    large: {
      title: '32px',
      verses: '20px',
      notes: '18px',
      label: '14px',
      date: '15px'
    }
  }

  const currentFontSize = fontSizes[fontSize]

  // Color schemes
  const colors = darkMode ? {
    background: '#1a1a1a',
    text: '#e5e5e5',
    textSecondary: '#a0a0a0',
    cardBg: '#2d2d2d',
    versesBg: '#3a2f5f',
    versesText: '#e0d4ff',
    versesBorder: '#6b46c1',
    notesBg: '#2a2a2a',
    notesText: '#d1d1d1',
    headerBg: '#252525',
    buttonBg: '#3a3a3a',
    buttonText: '#e5e5e5',
    buttonHover: '#4a4a4a',
    labelText: '#b0b0b0'
  } : {
    background: '#f9fafb',
    text: '#1f2937',
    textSecondary: '#6b7280',
    cardBg: '#ffffff',
    versesBg: '#faf5ff',
    versesText: '#1f2937',
    versesBorder: '#8b5cf6',
    notesBg: '#ffffff',
    notesText: '#374151',
    headerBg: '#ffffff',
    buttonBg: '#f3f4f6',
    buttonText: '#374151',
    buttonHover: '#e5e7eb',
    labelText: '#6b7280'
  }

  return {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      transition: 'background-color 0.3s, color 0.3s'
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      color: colors.text
    },
    header: {
      position: 'sticky',
      top: 0,
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${darkMode ? '#3a3a3a' : '#e5e7eb'}`,
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
    },
    backButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text,
      fontSize: '16px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: colors.buttonHover
      }
    },
    controls: {
      display: 'flex',
      gap: '8px'
    },
    controlButton: {
      backgroundColor: colors.buttonBg,
      border: 'none',
      color: colors.buttonText,
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
      minWidth: '40px'
    },
    contentContainer: {
      maxWidth: '700px',
      margin: '0 auto',
      padding: '24px 20px 60px 20px',
      '@media (min-width: 768px)': {
        padding: '40px 32px 80px 32px'
      }
    },
    article: {
      backgroundColor: colors.cardBg,
      borderRadius: '12px',
      padding: '32px 24px',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
      '@media (min-width: 768px)': {
        padding: '48px 40px'
      }
    },
    titleSection: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `2px solid ${darkMode ? '#3a3a3a' : '#e5e7eb'}`
    },
    title: {
      fontSize: currentFontSize.title,
      fontWeight: '800',
      color: colors.text,
      margin: '0 0 12px 0',
      lineHeight: '1.3',
      letterSpacing: '-0.02em'
    },
    date: {
      fontSize: currentFontSize.date,
      color: colors.textSecondary,
      margin: 0,
      fontWeight: '500'
    },
    versesSection: {
      marginBottom: '40px',
      padding: '28px 24px',
      backgroundColor: colors.versesBg,
      borderRadius: '10px',
      borderLeft: `5px solid ${colors.versesBorder}`,
      '@media (min-width: 768px)': {
        padding: '32px 32px'
      }
    },
    versesSectionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px'
    },
    versesIcon: {
      fontSize: '20px'
    },
    versesLabelText: {
      fontSize: currentFontSize.label,
      fontWeight: '700',
      color: colors.labelText,
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    versesText: {
      fontSize: currentFontSize.verses,
      color: colors.versesText,
      lineHeight: '1.8',
      fontStyle: 'italic',
      fontWeight: '500',
      margin: 0,
      whiteSpace: 'pre-wrap',
      quotes: '""" """'
    },
    notesSection: {
      padding: '28px 24px',
      backgroundColor: colors.notesBg,
      borderRadius: '10px',
      '@media (min-width: 768px)': {
        padding: '32px 32px'
      }
    },
    notesSectionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px'
    },
    notesIcon: {
      fontSize: '20px'
    },
    notesLabelText: {
      fontSize: currentFontSize.label,
      fontWeight: '700',
      color: colors.labelText,
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    notesText: {
      fontSize: currentFontSize.notes,
      color: colors.notesText,
      lineHeight: '1.9',
      whiteSpace: 'pre-wrap',
      margin: 0
    }
  }
}

export default BibleStudyDetail
