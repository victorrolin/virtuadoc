const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vghfzvevlfxtpitmqmsv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaGZ6dmV2bGZ4dHBpdG1xbXN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzkyMTM5NywiZXhwIjoyMDUzNDk3Mzk3fQ.EKK0O5goqoiTH_s1PnU4pQvMdQzkoE1F8-FYrOBvBh0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const id = 'bfe3ffcc-af13-4084-b2ab-45d81f436a6a'
  console.log(`Checking record with ID: ${id}...`)
  
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .or(`id.eq.${id},appointment_id.eq.${id}`)
    .maybeSingle()
    
  if (error) {
    console.error('Error fetching record:', error)
  } else if (!data) {
    console.log('Record not found in Supabase!')
  } else {
    console.log('Record details:')
    console.log(JSON.stringify(data, null, 2))
  }
}

check()
