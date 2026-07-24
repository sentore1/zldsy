// Check what users exist in the database
const { createClient } = require('@supabase/supabase-js');

// Create admin client with service role key to query auth.users
const supabase = createClient(
  'https://ycngtmmoomwgmkabqasy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY0Mjg5MiwiZXhwIjoyMTAwMjE4ODkyfQ.Li0MHpSSCGkq9WRU_dDZXDPq-lCPYV7eZ5F7xz3Apl8',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkUsers() {
  console.log('🔍 Checking Supabase Users...\n');
  
  // Check user_roles table
  console.log('📋 Checking user_roles table:');
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');
  
  if (rolesError) {
    console.log('❌ Error:', rolesError.message);
  } else if (roles.length === 0) {
    console.log('⚠️  No users found in user_roles table!');
  } else {
    console.log(`✅ Found ${roles.length} user(s) with roles:`);
    roles.forEach((role, i) => {
      console.log(`   ${i + 1}. User ID: ${role.user_id}`);
      console.log(`      Role: ${role.role}`);
      console.log(`      Created: ${role.created_at}`);
    });
  }
  
  // Check auth.users table (requires admin client)
  console.log('\n👤 Checking auth.users table:');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.log('❌ Error:', usersError.message);
  } else if (users.length === 0) {
    console.log('⚠️  No users found in auth.users table!');
  } else {
    console.log(`✅ Found ${users.length} user(s):`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. Email: ${user.email}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`      Created: ${user.created_at}`);
      
      // Check if this user has a role
      const userRole = roles?.find(r => r.user_id === user.id);
      if (userRole) {
        console.log(`      Role in DB: ✅ ${userRole.role}`);
      } else {
        console.log(`      Role in DB: ❌ NOT ASSIGNED`);
      }
    });
  }
  
  console.log('\n✅ Check complete!');
}

checkUsers().catch(console.error);
