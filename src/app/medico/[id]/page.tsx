import { createClient } from '@/lib/supabase/server'
import { getDoctorAvailableSlots } from '@/app/actions/appointments'
import { Activity, MapPin, Star, Video, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
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
        <div className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="h-32 w-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-5xl shadow-[0_0_40px_rgba(0,242,254,0.3)] shrink-0">
            {doctor.avatar_url ? (
              <Image src={doctor.avatar_url} alt={doctor.full_name} width={128} height={128} className="object-cover w-full h-full" unoptimized />
            ) : (
              doctor.full_name?.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{doctor.full_name}</h1>
                <p className="text-gray-400 mb-4">{doctor.bio || 'Especialista focado em oferecer o melhor atendimento telemedicina com empatia e técnica.'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 5.0 Avaliações</div>
                  <div className="flex items-center gap-1"><Video className="h-4 w-4 text-secondary" /> Telemedicina</div>
                  <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-green-400" /> Brasil</div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500 mb-1">Valor da consulta</p>
                <p className="text-3xl font-bold text-white">R$ {doctor.price_per_consultation || '150.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Agende seu Horário
          </h2>

          {availableDays.length === 0 ? (
            <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
              <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">Agenda indisponível</h3>
              <p className="text-gray-500 text-sm">Este médico ainda não liberou horários para os próximos dias.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {availableDays.map((day) => (
                <div key={day.date} className="bg-black/20 rounded-2xl p-6 border border-white/5">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">{day.formattedDate}</h3>
                    <p className="text-sm text-gray-400">{day.dayName}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {day.slots.map((time) => (
                      <Link 
                        key={time} 
                        href={`/checkout?doctor=${doctor.id}&date=${day.date}&time=${time}&name=${encodeURIComponent(doctor.full_name)}&specialty=${encodeURIComponent(doctor.specialties || '')}&price=${doctor.price_per_consultation || 0}`}
                        className="bg-white/5 hover:bg-primary hover:text-black border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      >
                        {time}
                      </Link>
                    ))}
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
