const supabaseUrl = 'https://oolcpfghhfmxidtmmsch.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGNwZmdoaGZteGlkdG1tc2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODI0NTMsImV4cCI6MjA4NjQ1ODQ1M30.rcA6myxbCe_FjOHRfYRBJUch4nOwcjpMlEvVLLNUlt4'; // Replace with your Supabase Anon Key

const { createClient } = supabase;
window.supabase = createClient(supabaseUrl, supabaseAnonKey);
