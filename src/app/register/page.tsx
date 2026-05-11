import Link from 'next/link'
import { Activity, UserPlus } from 'lucide-react'
import { signup } from '@/app/actions/auth'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <Activity className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Virtua<span className="text-gradient">Doctor</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-gray-400 text-sm">Junte-se à telemedicina do futuro</p>
        </div>

        <div className="glass p-8 rounded-3xl w-full">
          <form className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="fullName">
                Nome Completo
              </label>
              <input
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                name="fullName"
                placeholder="João da Silva"
                required
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                E-mail
              </label>
              <input
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                name="email"
                placeholder="seu@email.com"
                required
                type="email"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                Senha
              </label>
              <input
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* O campo de role foi removido. Todos os cadastros públicos são pacientes. */}
            <input type="hidden" name="role" value="patient" />

            {searchParams?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {searchParams.message}
              </div>
            )}

            <button
              formAction={signup}
              className="mt-4 w-full bg-white hover:bg-gray-100 text-gray-950 font-bold px-4 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group"
            >
              Criar Conta <UserPlus className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
