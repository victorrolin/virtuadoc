import { getSchedule, getOnlineStatus } from '@/app/actions/agenda'
import { Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AgendaControls } from '@/components/AgendaControls'

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'doctor') {
    return redirect('/dashboard')
  }

  const existingSchedules = await getSchedule()
  const isOnlineNow = await getOnlineStatus()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Clock className="h-8 w-8 text-secondary" /> Minha Agenda
        </h1>
        <p className="text-gray-400">
          Gerencie sua disponibilidade e configure como os pacientes podem te encontrar.
        </p>
      </div>

      <AgendaControls
        initialOnlineStatus={isOnlineNow}
        existingSchedules={existingSchedules}
      />
    </div>
  )
}
