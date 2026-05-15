import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestRevenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Não logado</div>

  const { data: appts } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', user.id)

  const { data: allAppts } = await supabase
    .from('appointments')
    .select('*')
    .limit(10)

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1>Debug de Faturamento</h1>
      <p>Seu User ID: {user.id}</p>
      
      <h2 className="mt-5">Suas Consultas (Doctor ID match):</h2>
      <pre>{JSON.stringify(appts, null, 2)}</pre>

      <h2 className="mt-5">Últimas 10 consultas no sistema (Geral):</h2>
      <pre>{JSON.stringify(allAppts, null, 2)}</pre>
    </div>
  )
}
