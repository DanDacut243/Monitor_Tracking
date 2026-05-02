const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ofwjdvuuirilurajgtcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9md2pkdnV1aXJpbHVyYWpndGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzgxMjgsImV4cCI6MjA4OTkxNDEyOH0.YqFnt8N6lj_WLT6XZkSPcB0jZtlZm7zLGxfzVvXu0Io'
);

async function checkAdmin() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'admin@admin.com');
  console.log('Profiles:', data);
  if (error) console.error(error);
}

checkAdmin();
