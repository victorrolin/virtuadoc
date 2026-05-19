import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Activity, Star, MapPin, Video, ArrowRight, Zap } from 'lucide-react'
import Image from 'next/image'

export default async function MedicosPage() {
  const supabase = await createClient()

  // Buscar todos os médicos (inclui is_online_now)
  const { data: doctors } = await supabase
    .from('profiles')
    .select('id, full_name, bio, crm, specialties, price_per_consultation, avatar_url, is_online_now')
    .eq('role', 'doctor')
    .order('is_online_now', { ascending: false }) // Online first

  const onlineCount = doctors?.filter(d => d.is_online_now).length ?? 0

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar simplificada */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white">
              Virtua<span className="text-gradient">Doctor</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Meu Painel</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">Nossos Especialistas</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Encontre o médico ideal para você e agende sua teleconsulta agora mesmo com segurança e praticidade.
          </p>

          {/* Banner de médicos online agora */}
          {onlineCount > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {onlineCount} médico{onlineCount > 1 ? 's' : ''} disponível{onlineCount > 1 ? 'is' : ''} agora para atendimento imediato
            </div>
          )}
        </div>

        {doctors?.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl">
            <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum médico cadastrado ainda</h3>
            <p className="text-gray-400">Seja o primeiro a se cadastrar e ofereça seus serviços!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors?.map((doctor) => (
              <Link
                href={`/medico/${doctor.id}`}
                key={doctor.id}
                className={`block glass rounded-3xl p-6 transition-all hover:scale-[1.02] group relative overflow-hidden ${
                  doctor.is_online_now
                    ? 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] border border-green-500/20'
                    : 'hover:shadow-[0_0_30px_rgba(0,242,254,0.1)]'
                }`}
              >
                {/* Badge Online Agora */}
                {doctor.is_online_now && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-[11px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online Agora
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
                    {doctor.avatar_url ? (
                      <Image src={doctor.avatar_url} alt={doctor.full_name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      doctor.full_name?.charAt(0)
                    )}
                    {/* Indicador online no avatar */}
                    {doctor.is_online_now && (
                      <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className={`text-lg font-bold transition-colors truncate ${
                      doctor.is_online_now
                        ? 'text-white group-hover:text-green-400'
                        : 'text-white group-hover:text-primary'
                    }`}>
                      {doctor.full_name}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      5.0 (Novato)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CRM: {doctor.crm || 'Não informado'}</p>
                  </div>
                </div>

                {doctor.specialties && (
                  <p className="text-xs text-primary/80 font-semibold mb-2 truncate">{doctor.specialties}</p>
                )}

                <p className="text-sm text-gray-400 mb-5 line-clamp-2">
                  {doctor.bio || 'Especialista comprometido em oferecer atendimento humanizado e de alta qualidade por telemedicina.'}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Video className="h-4 w-4 text-secondary" /> Telemedicina
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="h-4 w-4 text-green-400" /> Atendimento Nacional
                  </div>
                  {doctor.is_online_now && (
                    <div className="flex items-center gap-2 text-sm text-green-400 font-semibold">
                      <Zap className="h-4 w-4" /> Atendimento imediato disponível
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Valor da consulta</span>
                    <span className="text-lg font-bold text-white">
                      {doctor.price_per_consultation ? `R$ ${doctor.price_per_consultation}` : 'A combinar'}
                    </span>
                  </div>
                  <div className={`font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm ${
                    doctor.is_online_now
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}>
                    {doctor.is_online_now ? (
                      <><Zap className="h-4 w-4" /> Consultar Agora</>
                    ) : (
                      <>Ver Agenda <ArrowRight className="h-4 w-4" /></>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
