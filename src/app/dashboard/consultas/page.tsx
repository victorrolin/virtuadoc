import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Video, Calendar, Clock, User, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function ConsultasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'doctor') return redirect('/dashboard')

  // Buscar consultas agendadas do médico (pagas e confirmadas)
  const today = new Date().toISOString().split('T')[0]
  
  const { data: upcoming } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      meeting_link,
      reason,
      patient:profiles!appointments_patient_id_fkey(full_name, phone)
    `)
    .eq('doctor_id', user.id)
    .in('status', ['paid', 'pending'])
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  const { data: past } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      status,
      patient:profiles!appointments_patient_id_fkey(full_name)
    `)
    .eq('doctor_id', user.id)
    .eq('status', 'completed')
    .order('appointment_date', { ascending: false })
    .limit(10)

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  }

  function isNow(dateStr: string, startTime: string) {
    const now = new Date()
    const apptDate = new Date(`${dateStr}T${startTime}`)
    const diffMin = (apptDate.getTime() - now.getTime()) / 60000
    return diffMin <= 30 && diffMin >= -60 // dentro de 30min antes ou 60min depois
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Video className="h-8 w-8 text-primary" />
          Salas de Vídeo
        </h1>
        <p className="text-gray-400">Suas consultas agendadas. Entre na sala nos horários marcados.</p>
      </div>

      {/* Próximas Consultas */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary" />
          Próximas Consultas
        </h2>

        {!upcoming || upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma consulta agendada</h3>
            <p className="text-gray-400 text-sm">Quando pacientes agendarem consultas, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appt) => {
              const active = isNow(appt.appointment_date, appt.start_time)
              const meetLink = appt.meeting_link || `https://meet.jit.si/virtuadoc-${appt.id}`
              const patient = appt.patient as any

              return (
                <div
                  key={appt.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border gap-4 transition-all ${
                    active
                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]'
                      : 'bg-black/20 border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-primary/20' : 'bg-white/5'
                    }`}>
                      <User className={`h-6 w-6 ${active ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{patient?.full_name || 'Paciente'}</h3>
                        {active && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium animate-pulse">
                            Em breve
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          appt.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {appt.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(appt.appointment_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {appt.start_time?.slice(0, 5)} – {appt.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      {patient?.phone && (
                        <p className="text-xs text-gray-500 mt-0.5">📱 {patient.phone}</p>
                      )}
                      {appt.reason && (
                        <div className="mt-2 flex items-start gap-1.5 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                          <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-300 leading-relaxed">
                            <span className="font-semibold text-primary">Motivo: </span>{appt.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
                      active
                        ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    {active ? 'Entrar Agora' : 'Abrir Sala'}
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Histórico */}
      {past && past.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Histórico Recente
          </h2>
          <div className="space-y-3">
            {past.map((appt) => {
              const patient = appt.patient as any
              return (
                <div key={appt.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{patient?.full_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(appt.appointment_date)} às {appt.start_time?.slice(0, 5)}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Concluída</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
