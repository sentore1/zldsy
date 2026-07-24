// Quick test script to verify Supabase auth is working
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ycngtmmoomwgmkabqasy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDI4OTIsImV4cCI6MjEwMDIxODg5Mn0.PWonviWBfmIeqDS59dK9utINsL_KIZjjBHEAzaFuMXg'
);

async function testAuth() {
  console.log('🔍 Testing Supabase Authentication...\n');
  
  // Test 1: Try to get current session
  console.log('Test 1: Check current session');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.log('❌ Session error:', sessionError.message);
  } else {
    console.log('✅ Session check OK:', sessionData.session ? 'Logged in' : 'No active session');
  }
  
  // Test 2: Try to login with test credentials
  console.log('\nTest 2: Attempt login with abdousentore@gmail.com');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'abdousentore@gmail.com',
    password: 'admin123'
  });
  
  if (loginError) {
    console.log('❌ Login failed:', loginError.message);
    console.log('   Error details:', {
      status: loginError.status,
      code: loginError.code,
      name: loginError.name
    });
  } else {
    console.log('✅ Login successful!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
    
    // Test 3: Check if user_roles exists
    console.log('\nTest 3: Check user role');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', loginData.user.id)
      .single();
    
    if (roleError) {
      console.log('❌ Role check failed:', roleError.message);
      console.log('   This means user exists but has no role assigned!');
    } else {
      console.log('✅ User role:', roleData.role);
    }
    
    // Logout
    await supabase.auth.signOut();
  }
  
  console.log('\n✅ Test complete!');
}

testAuth().catch(console.error);
