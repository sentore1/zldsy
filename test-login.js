// Test login with your actual password
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ycngtmmoomwgmkabqasy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDI4OTIsImV4cCI6MjEwMDIxODg5Mn0.PWonviWBfmIeqDS59dK9utINsL_KIZjjBHEAzaFuMXg'
);

async function testLogin() {
  const email = 'abdousentore@gmail.com';
  
  // Get password from command line argument
  const password = process.argv[2];
  
  if (!password) {
    console.log('❌ Please provide password as argument');
    console.log('Usage: node test-login.js YOUR_PASSWORD');
    process.exit(1);
  }
  
  console.log('🔐 Testing login...');
  console.log('Email:', email);
  console.log('Password:', '*'.repeat(password.length));
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.log('\n❌ Login FAILED');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Status:', error.status);
  } else {
    console.log('\n✅ Login SUCCESSFUL!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Session:', data.session ? 'Created' : 'None');
    
    await supabase.auth.signOut();
  }
}

testLogin().catch(console.error);
