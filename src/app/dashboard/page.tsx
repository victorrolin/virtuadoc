import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Video, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const isDoctor = profile?.role === 'doctor'
  const today = new Date().toISOString().split('T')[0]

  // Buscar consultas de hoje e próximas (só para médicos)
  let todayCount = 0
  let nextAppointments: any[] = []

  if (isDoctor) {
    const { data: todayAppts } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', user!.id)
      .eq('appointment_date', today)
      .in('status', ['paid', 'pending'])

    todayCount = todayAppts?.length || 0

    const { data: upcoming } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        meeting_link,
        patient:profiles!appointments_patient_id_fkey(full_name)
      `)
      .eq('doctor_id', user!.id)
      .in('status', ['paid', 'pending'])
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5)

    nextAppointments = upcoming || []
  }

  function formatDate(dateStr: string, time: string) {
    const date = new Date(`${dateStr}T${time}`)
    return date.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-gray-400">
          {isDoctor ? 'Aqui está o resumo do seu dia.' : 'Bem-vindo ao seu painel principal.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{todayCount}</div>
          <div className="text-sm font-medium text-gray-400">Consultas Hoje</div>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{nextAppointments.length}</div>
          <div className="text-sm font-medium text-gray-400">Próximas Agendadas</div>
        </div>

        {isDoctor && (
          <div className="glass p-6 rounded-2xl">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">—</div>
            <div className="text-sm font-medium text-gray-400">Pacientes Atendidos</div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" /> Próximos Atendimentos
          </h2>
          {isDoctor && nextAppointments.length > 0 && (
            <Link
              href="/dashboard/consultas"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        
        {nextAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma consulta agendada</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              {isDoctor 
                ? 'Você ainda não tem pacientes agendados. Configure sua agenda para começar a receber consultas.'
                : 'Você não tem nenhuma consulta marcada. Encontre um médico e agende agora.'}
            </p>
            {isDoctor && (
              <Link
                href="/dashboard/agenda"
                className="mt-4 text-sm text-primary hover:underline"
              >
                Configurar minha agenda →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {nextAppointments.map((appt) => {
              const patient = appt.patient as any
              const meetLink = appt.meeting_link || `https://meet.jit.si/virtuadoc-${appt.id}`
              return (
                <div key={appt.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {patient?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{patient?.full_name}</p>
                      <p className="text-xs text-gray-400">{formatDate(appt.appointment_date, appt.start_time)}</p>
                    </div>
                  </div>
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Video className="h-3.5 w-3.5" /> Entrar
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
