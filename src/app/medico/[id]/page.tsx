import { createClient } from '@/lib/supabase/server'
import { getDoctorAvailableSlots } from '@/app/actions/appointments'
import { Activity, MapPin, Star, Video, ArrowLeft, Calendar as CalendarIcon, Zap } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: doctor } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'doctor')
    .single()

  if (!doctor) {
    notFound()
  }

  const availableDays = await getDoctorAvailableSlots(doctor.id)
  const isOnline = doctor.is_online_now === true

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/medicos" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Virtua<span className="text-gradient">Doctor</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Doctor Header Info */}
        <div className={`glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden ${
          isOnline ? 'border border-green-500/20' : ''
        }`}>
          {isOnline && (
            <div className="absolute top-0 right-0 bg-green-500 text-black font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-bl-3xl shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              Plantão Online
            </div>
          )}
          <div className="relative h-32 w-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-5xl shadow-[0_0_40px_rgba(0,242,254,0.3)] shrink-0">
            {doctor.avatar_url ? (
              <Image src={doctor.avatar_url} alt={doctor.full_name} width={128} height={128} className="object-cover w-full h-full" unoptimized />
            ) : (
              doctor.full_name?.charAt(0)
            )}
            {/* Indicador online no avatar */}
            {isOnline && (
              <span className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-full bg-green-400 border-2 border-black shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            )}
          </div>
          <div className="flex-1 mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                {/* Badge Online */}
                {isOnline && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-400/30 text-green-400 text-xs font-bold mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online Agora · Disponível para atendimento imediato
                  </div>
                )}
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  {doctor.full_name}
                </h1>
                <p className="text-gray-400 mb-4">{doctor.bio || 'Especialista focado em oferecer o melhor atendimento telemedicina com empatia e técnica.'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 5.0 Avaliações</div>
                  <div className="flex items-center gap-1"><Video className="h-4 w-4 text-secondary" /> Telemedicina</div>
                  <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-green-400" /> Brasil</div>
                </div>
              </div>
              <div className="text-left md:text-right flex flex-col md:items-end">
                <p className="text-sm text-gray-500 mb-1">Valor da consulta</p>
                <p className="text-3xl font-bold text-white mb-4">R$ {doctor.price_per_consultation || '150.00'}</p>
                
                {doctor.is_online_now && (
                  <Link 
                    href={`/checkout?doctor=${doctor.id}&date=${new Date().toISOString().split('T')[0]}&time=IMEDIATO&name=${encodeURIComponent(doctor.full_name)}&specialty=${encodeURIComponent(doctor.specialties || '')}&price=${doctor.price_per_consultation || 0}`}
                    className="bg-green-500 hover:bg-green-400 text-black font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    Atendimento Imediato <Activity className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Atendimento Imediato — visível apenas quando médico está online */}
        {isOnline && (
          <div className="mb-8 glass rounded-3xl p-6 border border-green-400/25 bg-green-500/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-0.5">Atendimento Imediato Disponível</h2>
                  <p className="text-sm text-gray-400">
                    Este médico está online agora. Pague e entre na videochamada em minutos.
                  </p>
                </div>
              </div>
              <Link
                href={`/checkout?doctor=${doctor.id}&date=${new Date().toISOString().split('T')[0]}&time=${new Date().toTimeString().slice(0,5)}&name=${encodeURIComponent(doctor.full_name)}&specialty=${encodeURIComponent(doctor.specialties || '')}&price=${doctor.price_per_consultation || 0}&mode=immediate`}
                className="whitespace-nowrap shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                <Zap className="h-5 w-5" />
                Consultar Agora
              </Link>
            </div>
          </div>
        )}

        {/* Scheduling Section */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Agende seu Horário
          </h2>

          {availableDays.length === 0 ? (
            <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
              <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">
                {isOnline ? 'Sem horários pré-agendados' : 'Agenda indisponível'}
              </h3>
              <p className="text-gray-500 text-sm">
                {isOnline
                  ? 'Use o botão "Consultar Agora" acima para atendimento imediato.'
                  : 'Este médico ainda não liberou horários para os próximos dias.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {availableDays.map((day) => (
                <div key={day.date} className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">{day.formattedDate}</h3>
                    <p className="text-sm text-gray-400">{day.dayName}</p>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { label: 'Manhã', icon: '🌅', filter: (t: string) => t < '12:00' },
                      { label: 'Tarde', icon: '☀️', filter: (t: string) => t >= '12:00' && t < '18:00' },
                      { label: 'Noite', icon: '🌙', filter: (t: string) => t >= '18:00' }
                    ].map((period) => {
                      const periodSlots = day.slots.filter(period.filter)
                      if (periodSlots.length === 0) return null
                      
                      return (
                        <div key={period.label}>
                          <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-3 flex items-center gap-2">
                            <span>{period.icon}</span> {period.label}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {periodSlots.map((time) => (
                              <Link 
                                key={time} 
                                href={`/checkout?doctor=${doctor.id}&date=${day.date}&time=${time}&name=${encodeURIComponent(doctor.full_name)}&specialty=${encodeURIComponent(doctor.specialties || '')}&price=${doctor.price_per_consultation || 0}`}
                                className="bg-white/5 hover:bg-primary hover:text-black border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all min-w-[70px] text-center"
                              >
                                {time}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
