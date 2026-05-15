import { createClient } from '../src/lib/supabase/server'

async function debug() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('User ID:', user?.id)
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  console.log('Profile Price:', profile?.price_per_consultation)

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  console.log('First day of month:', firstDayOfMonth)

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', user?.id)
    .in('status', ['paid', 'completed'])
    .gte('appointment_date', firstDayOfMonth)

  console.log('Error:', error)
  console.log('Appointments count:', appts?.length)
  console.log('Appointments sample:', appts?.slice(0, 2))
}

debug()
