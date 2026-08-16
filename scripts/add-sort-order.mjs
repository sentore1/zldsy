import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ycngtmmoomwgmkabqasy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljbmd0bW1vb213Z21rYWJxYXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY0Mjg5MiwiZXhwIjoyMTAwMjE4ODkyfQ.Li0MHpSSCGkq9WRU_dDZXDPq-lCPYV7eZ5F7xz3Apl8'

const supabase = createClient(supabaseUrl, serviceKey)

// Run raw SQL to add the column
const { data, error } = await supabase.rpc('exec_migration', {
  sql: `
    ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER;
    UPDATE services SET sort_order = subq.rn - 1
    FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn FROM services) subq
    WHERE services.id = subq.id AND services.sort_order IS NULL;
  `
})

if (error) {
  console.error('Migration failed via RPC:', error.message)
  console.log('\nPlease run this SQL manually in your Supabase SQL editor:')
  console.log('------------------------------------------------------------')
  console.log('ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER;')
  console.log('UPDATE services SET sort_order = subq.rn - 1')
  console.log('FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn FROM services) subq')
  console.log('WHERE services.id = subq.id AND services.sort_order IS NULL;')
  console.log('------------------------------------------------------------')
} else {
  console.log('Migration successful:', data)
}
