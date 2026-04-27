import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qprmfzhugyhjjlxttlad.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcm1memh1Z3loampseHR0bGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTIzMjQsImV4cCI6MjA5Mjg4ODMyNH0.2iOzlf0XD-gG4KbU5FXk48qv38rTAxDxL6zvkGWL2jw'

export const supabase = createClient(supabaseUrl, supabaseKey)
