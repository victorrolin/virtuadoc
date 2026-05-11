import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, Video, Clock } from 'lucide-react'

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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-gray-400">
          Bem-vindo ao seu painel principal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-sm font-medium text-gray-400">Consultas Hoje</div>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">0</div>
          <div className="text-sm font-medium text-gray-400">Pendentes</div>
        </div>

        {isDoctor && (
          <div className="glass p-6 rounded-2xl">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-sm font-medium text-gray-400">Pacientes Atendidos</div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" /> Próximos Atendimentos
        </h2>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma consulta agendada</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            {isDoctor 
              ? 'Você ainda não tem pacientes agendados para os próximos dias.'
              : 'Você não tem nenhuma consulta marcada. Encontre um médico e agende agora.'}
          </p>
        </div>
      </div>
    </div>
  )
}
