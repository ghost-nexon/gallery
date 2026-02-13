// assets/js/supabase.js
const supabaseUrl    = 'https://oolcpfghhfmxidtmmsch.supabase.co'
const supabaseKey    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGNwZmdoaGZteGlkdG1tc2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODI0NTMsImV4cCI6MjA4NjQ'
const supabase       = window.supabase.createClient(supabaseUrl, supabaseKey)

window.supabase = supabase
