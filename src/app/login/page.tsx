import Link from 'next/link'
import { Activity, ArrowRight } from 'lucide-react'
import { login } from '@/app/actions/auth'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <Activity className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Lumina<span className="text-gradient">Health</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-400 text-sm">Faça login para acessar sua conta</p>
        </div>

        <div className="glass p-8 rounded-3xl w-full">
          <form className="flex flex-col gap-5">
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
              />
            </div>

            {searchParams?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {searchParams.message}
              </div>
            )}

            <button
              formAction={login}
              className="mt-4 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-gray-950 font-bold px-4 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,254,0.2)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] flex items-center justify-center gap-2 group"
            >
              Entrar <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Cadastre-se agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
