import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function BibleStudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState('medium') // small, medium, large
  const [darkMode, setDarkMode] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState([])
  const [members, setMembers] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const loadStudy = useCallback(async () => {
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

      setStudy(data)
    } catch (error) {
      console.error('Error loading bible study:', error)
      alert('Error loading bible study: ' + error.message)
      navigate('/bible-studies')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  const loadComments = useCallback(async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('bible_study_id', id)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        throw commentsError
      }

      setComments(commentsData || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }, [id])

  const loadMembers = useCallback(async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, first_name, last_name')
        .order('first_name', { ascending: true })

      if (membersError) {
        console.error('Error fetching members:', membersError)
        throw membersError
      }

      setMembers(membersData || [])
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadStudy()
      await loadComments()
      await loadMembers()
    })()
  }, [loadStudy, loadComments, loadMembers])

  async function handleSubmitComment() {
    const trimmedComment = commentText.trim()

    // Members post as themselves; admins can also post as themselves
    const commenterId = profile?.id
    if (!commenterId) {
      alert('Could not identify your profile. Please refresh.')
      return
    }

    if (!trimmedComment) {
      alert('Please write a comment before posting.')
      return
    }

    try {
      setSubmittingComment(true)

      // Insert comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert([{
          bible_study_id: Number(id),
          member_id: commenterId,
          comment: trimmedComment
        }])
        .select()

      if (commentError) {
        console.error('Error posting comment:', commentError)
        alert('Error posting comment: ' + commentError.message)
        return
      }

      // Notify other members
      const commenterName = profile?.name || 'Someone'
      const notificationMessage = `${commenterName} commented on "${study.title}"`
      const membersToNotify = members.filter(m => m.id !== commenterId)

      if (membersToNotify.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(
            membersToNotify.slice(0, 1).map(member => ({
              user_id: member.id,
              message: notificationMessage,
              bible_study_id: Number(id),
              is_read: false
            }))
          )
        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        }
      }

      setCommentText('')
      await loadComments()
      alert('Comment posted successfully!')
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Error posting comment: ' + error.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleDeleteComment(commentId, commentMemberId) {
    // Action-level guard: only admin or the comment owner can delete
    if (!isAdmin && profile?.id !== commentMemberId) {
      alert('Permission denied: you can only delete your own comments.')
      return
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        alert('Error deleting comment: ' + error.message)
        return
      }

      setComments(comments.filter((c) => c.id !== commentId))
      alert('Comment deleted successfully!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error deleting comment: ' + error.message)
    }
  }

  function getMemberName(memberId) {
    const member = members.find(m => m.id === memberId)
    if (!member) return 'Unknown'
    if (member.name) return member.name
    return `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown'
  }

  function formatCommentDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

          {/* Comments Section */}
          <section style={styles.commentsSection}>
            <div style={styles.commentsSectionHeader}>
              <div style={styles.commentsSectionLabel}>
                <span style={styles.commentsIcon}>💬</span>
                <span style={styles.commentsLabelText}>Discussion</span>
              </div>
              <span style={styles.commentsCount}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>

            {/* Add Comment Form */}
            <div style={styles.commentForm}>
              <div style={styles.commentFormField}>
                <label style={styles.commentFormLabel}>
                  Commenting as: <strong>{profile?.name || 'You'}</strong>
                </label>
              </div>

              <div style={styles.commentFormField}>
                <label style={styles.commentFormLabel}>Write a comment...</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights..."
                  rows="4"
                  style={styles.commentFormTextarea}
                />
              </div>

              <button
                onClick={handleSubmitComment}
                disabled={submittingComment}
                style={styles.commentSubmitButton}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            {/* Display Comments */}
            <div style={styles.commentsList}>
              {comments.length === 0 ? (
                <div style={styles.noComments}>
                  <p style={styles.noCommentsText}>No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentHeader}>
                      <div style={styles.commentAuthor}>
                        <span style={styles.commentAuthorIcon}>👤</span>
                        <span style={styles.commentAuthorName}>{getMemberName(comment.member_id)}</span>
                      </div>
                      <div style={styles.commentMeta}>
                        <span style={styles.commentDate}>{formatCommentDate(comment.created_at)}</span>
                        {/* Only admin or comment owner can delete */}
                        {(isAdmin || profile?.id === comment.member_id) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id, comment.member_id)}
                            style={styles.commentDeleteButton}
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={styles.commentText}>{comment.comment}</p>
                  </div>
                ))
              )}
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
    },
    // Comments Section Styles
    commentsSection: {
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: `2px solid ${darkMode ? '#3a3a3a' : '#e5e7eb'}`
    },
    commentsSectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    commentsSectionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    commentsIcon: {
      fontSize: '20px'
    },
    commentsLabelText: {
      fontSize: currentFontSize.label,
      fontWeight: '700',
      color: colors.labelText,
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    commentsCount: {
      fontSize: '14px',
      color: colors.textSecondary,
      fontWeight: '500'
    },
    commentForm: {
      backgroundColor: darkMode ? '#2a2a2a' : '#f9fafb',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '32px'
    },
    commentFormField: {
      marginBottom: '16px'
    },
    commentFormLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: colors.text,
      marginBottom: '8px'
    },
    commentFormSelect: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: `1px solid ${darkMode ? '#4a4a4a' : '#d1d5db'}`,
      fontSize: '14px',
      backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
      color: colors.text,
      outline: 'none',
      cursor: 'pointer'
    },
    commentFormTextarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: `1px solid ${darkMode ? '#4a4a4a' : '#d1d5db'}`,
      fontSize: '15px',
      backgroundColor: darkMode ? '#3a3a3a' : '#ffffff',
      color: colors.text,
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: '1.6',
      boxSizing: 'border-box'
    },
    commentSubmitButton: {
      backgroundColor: darkMode ? '#6b46c1' : '#8b5cf6',
      color: '#ffffff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: darkMode ? '#7c3aed' : '#7c3aed'
      },
      ':disabled': {
        opacity: 0.6,
        cursor: 'not-allowed'
      }
    },
    commentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    noComments: {
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: darkMode ? '#2a2a2a' : '#f9fafb',
      borderRadius: '10px'
    },
    noCommentsText: {
      margin: 0,
      fontSize: '15px',
      color: colors.textSecondary,
      fontStyle: 'italic'
    },
    commentItem: {
      backgroundColor: darkMode ? '#2a2a2a' : '#f9fafb',
      padding: '20px',
      borderRadius: '10px',
      borderLeft: `3px solid ${darkMode ? '#4a4a4a' : '#d1d5db'}`
    },
    commentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '8px'
    },
    commentAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    commentAuthorIcon: {
      fontSize: '16px'
    },
    commentAuthorName: {
      fontSize: '15px',
      fontWeight: '700',
      color: colors.text
    },
    commentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    commentDate: {
      fontSize: '13px',
      color: colors.textSecondary
    },
    commentDeleteButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: darkMode ? '#3a3a3a' : '#e5e7eb'
      }
    },
    commentText: {
      margin: 0,
      fontSize: '15px',
      color: colors.text,
      lineHeight: '1.7',
      whiteSpace: 'pre-wrap'
    }
  }
}

export default BibleStudyDetail
