import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, LayoutDashboard, Calendar, Video, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar perfil para saber se é admin, médico ou paciente
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'patient'
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário'

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-white">
              Lumina<span className="text-gradient">Health</span>
            </span>
          </Link>
        </div>

        <div className="p-6">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu Principal</div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              Início
            </Link>
            
            {role === 'doctor' && (
              <>
                <Link href="/dashboard/agenda" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                  <Calendar className="h-5 w-5" />
                  Minha Agenda
                </Link>
                <Link href="/dashboard/consultas" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                  <Video className="h-5 w-5" />
                  Salas de Vídeo
                </Link>
              </>
            )}

            {role === 'patient' && (
              <>
                <Link href="/dashboard/minhas-consultas" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                  <Calendar className="h-5 w-5" />
                  Minhas Consultas
                </Link>
                <Link href="/especialidades" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                  <Activity className="h-5 w-5" />
                  Buscar Médico
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
                  <Settings className="h-5 w-5" />
                  Painel Administrativo
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
              {firstName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{firstName}</div>
              <div className="text-xs text-gray-500 capitalize">{role === 'doctor' ? 'Médico' : role === 'admin' ? 'Administrador' : 'Paciente'}</div>
            </div>
          </div>
          
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors">
              <LogOut className="h-5 w-5" />
              Sair da Conta
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 md:hidden">
          <Activity className="h-6 w-6 text-primary" />
          <form action={signOut}>
            <button className="text-sm text-red-400 font-medium">Sair</button>
          </form>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
