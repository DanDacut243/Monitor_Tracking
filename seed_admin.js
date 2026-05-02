const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ofwjdvuuirilurajgtcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9md2pkdnV1aXJpbHVyYWpndGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzgxMjgsImV4cCI6MjA4OTkxNDEyOH0.YqFnt8N6lj_WLT6XZkSPcB0jZtlZm7zLGxfzVvXu0Io'
);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@admin.com',
    password: 'admin123',
    options: {
      data: {
        full_name: 'System Admin',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('Successfully created admin user!');
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata.role);
  }
}

createAdmin();
