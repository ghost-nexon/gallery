const supabaseUrl = 'https://your-supabase-project.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'your-anon-key'; // Replace with your Supabase Anon Key

const { createClient } = supabase;
window.supabase = createClient(supabaseUrl, supabaseAnonKey);
