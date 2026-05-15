import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Video, Calendar, Clock, User, ExternalLink, ArrowRight, FileText, Download, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { MeetLinkButton } from '@/components/MeetLinkButton'
import { getPatientPrescriptions } from '@/app/actions/prescriptions'

export default async function MinhasConsultasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'patient') return redirect('/dashboard')

  const today = new Date().toISOString().split('T')[0]

  const { data: upcoming } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, start_time, end_time, status, meeting_link,
      doctor:profiles!appointments_doctor_id_fkey(full_name, specialties, crm)
    `)
    .eq('patient_id', user.id)
    .in('status', ['paid', 'pending'])
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true })

  const { data: past } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, start_time, status,
      doctor:profiles!appointments_doctor_id_fkey(full_name, specialties)
    `)
    .eq('patient_id', user.id)
    .lt('appointment_date', today)
    .order('appointment_date', { ascending: false })
    .limit(10)

  const { prescriptions } = await getPatientPrescriptions()

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  function formatSimpleDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function isNow(dateStr: string, startTime: string) {
    const now = new Date()
    const apptDate = new Date(`${dateStr}T${startTime}`)
    const diffMin = (apptDate.getTime() - now.getTime()) / 60000
    return diffMin <= 30 && diffMin >= -60
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Minhas Consultas
        </h1>
        <p className="text-gray-400">Suas consultas agendadas e histórico de atendimentos.</p>
      </div>

      {/* Próximas */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" /> Próximas Consultas
        </h2>

        {!upcoming || upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma consulta agendada</h3>
            <p className="text-gray-400 text-sm mb-6">Encontre um médico e agende sua consulta agora mesmo.</p>
            <Link href="/medicos" className="flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all">
              Buscar Médicos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appt) => {
              const active = isNow(appt.appointment_date, appt.start_time)
              const doctor = appt.doctor as any
              const meetLink = appt.meeting_link || `https://meet.jit.si/virtuadoc-${appt.id}`

              return (
                <div key={appt.id} className={`p-5 rounded-xl border transition-all ${
                  active
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]'
                    : 'bg-black/20 border-white/5'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary/20' : 'bg-white/5'}`}>
                        <User className={`h-6 w-6 ${active ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-semibold">Dr(a). {doctor?.full_name || 'Médico'}</h3>
                          {active && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium animate-pulse">
                              Agora!
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                            Confirmada
                          </span>
                        </div>
                        <p className="text-sm text-primary/80 mb-1">{doctor?.specialties}</p>
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
                        <MeetLinkButton link={meetLink} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Receitas Digitais */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Minhas Receitas Digitais
        </h2>

        {!prescriptions || prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-gray-500 text-sm italic">Você ainda não possui receitas digitais emitidas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((p: any) => {
              const shortLink = `/r/${p.id}.pdf`
              
              return (
                <div key={p.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/20 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    {p.is_signed && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <ShieldCheck className="h-3 w-3" /> Assinada
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-white font-semibold truncate">Receita Médica</p>
                    <p className="text-xs text-gray-500">Emitida em {formatSimpleDate(p.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      href={p.is_signed ? shortLink : `/prescriptions/${p.id}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold py-2 rounded-lg text-xs transition-all"
                    >
                      {p.is_signed ? <ShieldCheck className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      {p.is_signed ? 'Ver Assinada' : 'Visualizar'}
                    </Link>
                  </div>
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
            <Clock className="h-5 w-5 text-gray-400" /> Histórico
          </h2>
          <div className="space-y-3">
            {past.map((appt) => {
              const doctor = appt.doctor as any
              return (
                <div key={appt.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Dr(a). {doctor?.full_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(appt.appointment_date)} às {appt.start_time?.slice(0, 5)}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full">Realizada</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
