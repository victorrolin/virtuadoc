import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Video, Clock, ArrowRight, Activity, Edit3, Zap } from 'lucide-react'
import Link from 'next/link'
import { DashboardPrescriptionButton } from '@/components/DashboardPrescriptionButton'
import { CountdownTimer } from '@/components/CountdownTimer'

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
  let completedTotal = 0

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
        reason,
        patient:profiles!appointments_patient_id_fkey(full_name)
      `)
      .eq('doctor_id', user!.id)
      .in('status', ['paid', 'pending'])
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5)

    nextAppointments = upcoming || []

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    const { data: earningsData } = await supabase
      .from('appointments')
      .select('id, amount_paid')
      .eq('doctor_id', user!.id)
      .in('status', ['paid', 'completed'])
      .gte('appointment_date', firstDayOfMonth)

    // Cálculo de faturamento (usando amount_paid ou o preço do perfil como fallback)
    completedTotal = earningsData?.reduce((acc, appt) => acc + (Number(appt.amount_paid) || Number(profile?.price_per_consultation) || 0), 0) || 0
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-400">
            {isDoctor ? `Dr. ${profile?.full_name?.split(' ').pop()}, aqui está o resumo da sua clínica.` : 'Bem-vindo ao seu painel principal.'}
          </p>
        </div>
        
        {isDoctor && (
          <Link href="/dashboard/assistente" className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-4 rounded-2xl hover:bg-primary/20 transition-all group">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)]">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-tighter">Dr. Virtua Ativo</p>
              <p className="text-sm text-white">Iniciar análise clínica</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl border-l-4 border-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider">Hoje</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{todayCount}</div>
          <div className="text-sm font-medium text-gray-400">Consultas Agendadas</div>
        </div>
        
        <div className="glass p-6 rounded-2xl border-l-4 border-secondary">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md uppercase tracking-wider">Pendentes</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{nextAppointments.length}</div>
          <div className="text-sm font-medium text-gray-400">Próximos atendimentos</div>
        </div>

        {isDoctor && (
          <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-wider">Mês Atual</span>
            </div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento Bruto</div>
            <div className="text-2xl font-bold text-white mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedTotal)}
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-0.5">Seu Recebimento (80%)</p>
              <p className="text-xl font-bold text-green-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedTotal * 0.8)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Lista de Atendimentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Próximo Paciente (Destaque) */}
          {nextAppointments.length > 0 && (
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl p-1 shadow-xl animate-fade-in">
              <div className="bg-[#0a0a0a] rounded-[1.4rem] p-6 relative overflow-hidden">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Video className="h-4 w-4" /> Próximo Atendimento
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
                      {nextAppointments[0].patient?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-2xl font-bold text-white">{nextAppointments[0].patient?.full_name}</p>
                        <CountdownTimer 
                          targetDate={nextAppointments[0].appointment_date} 
                          targetTime={nextAppointments[0].start_time} 
                        />
                      </div>
                      <p className="text-primary font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" /> {formatDate(nextAppointments[0].appointment_date, nextAppointments[0].start_time)}
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={nextAppointments[0].meeting_link || `https://meet.jit.si/virtuadoc-${nextAppointments[0].id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-primary text-black font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)]"
                  >
                    Iniciar Teleconsulta <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
                
                {nextAppointments[0].reason && (
                  <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Motivo da Consulta</p>
                    <p className="text-sm text-gray-300 italic">"{nextAppointments[0].reason}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Fila de Espera
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
            </div>
          ) : (
            <div className="space-y-4">
              {nextAppointments.map((appt) => {
                const patient = appt.patient as any
                const meetLink = appt.meeting_link || `https://meet.jit.si/virtuadoc-${appt.id}`
                const isPaid = appt.status === 'paid'
                
                return (
                  <div key={appt.id} className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold border border-white/10 group-hover:scale-110 transition-transform">
                        {patient?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{patient?.full_name}</p>
                          {isPaid && (
                            <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Pago</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3 text-secondary" /> {formatDate(appt.appointment_date, appt.start_time)}
                        </p>
                        {appt.reason && (
                          <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-black/30 rounded-lg w-fit border border-white/5">
                            <Activity className="h-3 w-3 text-primary/60" />
                            <p className="text-[10px] text-gray-300 italic">
                              {appt.reason.length > 50 ? appt.reason.slice(0, 50) + '...' : appt.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-primary transition-colors shadow-lg shadow-white/5"
                      >
                        <Video className="h-3.5 w-3.5" /> Atender
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

        {/* Coluna Direita - Atalhos do Dr. Virtua */}
        {isDoctor && (
          <div className="space-y-6">
            <DashboardPrescriptionButton doctorName={profile?.full_name || 'Médico'} />

            <div className="glass rounded-2xl p-6 border border-primary/20 bg-primary/5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-20 w-20 bg-primary/10 rounded-full blur-2xl"></div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" /> Suporte Clínico
              </h2>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Use o **Dr. Virtua (IA)** para analisar casos complexos, revisar interações medicamentosas ou buscar evidências científicas em segundos.
              </p>
              <Link href="/dashboard/assistente" className="w-full bg-primary text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                Acessar Consultoria IA
              </Link>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" /> Bloco de Notas Rápidas
              </h2>
              <textarea 
                placeholder="Ex: Lembrar de revisar o exame do Sr. João..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:border-primary/50 transition-colors resize-none mb-3 custom-scrollbar"
              ></textarea>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 transition-all">
                Salvar Nota Localmente
              </button>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-secondary/5 to-transparent">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" /> Insight do Dr. Virtua
              </h2>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5 italic text-[11px] text-gray-400 leading-relaxed">
                "Dica: Pacientes com sintomas persistentes de fadiga podem se beneficiar de uma revisão nos níveis de Vitamina D e Ferritina antes da próxima consulta."
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" /> Links Úteis
              </h2>
              <div className="space-y-2">
                {[
                  { label: 'Minha Agenda', href: '/dashboard/agenda', icon: Calendar },
                  { label: 'Meu Perfil Médico', href: '/dashboard/perfil', icon: Users },
                  { label: 'Sala de Video', href: '/dashboard/salas', icon: Video },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-xs text-gray-300">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gray-500" />
                      {item.label}
                    </div>
                    <ArrowRight className="h-3 w-3 opacity-30" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
