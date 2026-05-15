import { createClient } from '../src/lib/supabase/server'

async function checkColumns() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_column_names', { table_name: 'appointments' })
  
  if (error) {
    // Se a RPC não existir, tentamos um select vazio
    const { data: sample, error: selectError } = await supabase.from('appointments').select('*').limit(1)
    if (sample && sample.length > 0) {
      console.log('Columns found:', Object.keys(sample[0]))
    } else {
      console.log('Select error or no data:', selectError)
    }
  } else {
    console.log('Columns:', data)
  }
}

checkColumns()
