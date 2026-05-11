'use client'

import Link from 'next/link'
import { Activity, ArrowRight, Loader2, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import { login } from '@/app/actions/auth'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(searchParams.get('message') || '')
  const [tab, setTab] = useState<'password' | 'magic'>('magic')
  const [magicSent, setMagicSent] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const formData = new FormData(e.currentTarget)
      const res = await login(formData)
      if (res?.error) { setErrorMsg(res.error); setLoading(false) }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT') return
      setErrorMsg('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string

      // Chamar nossa API customizada (gera link via Admin + envia pelo Resend)
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao enviar o link. Tente novamente.')
        setLoading(false)
      } else {
        setMagicSent(true)
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex rounded-xl bg-black/30 p-1 mb-6 border border-white/5">
        <button
          type="button"
          onClick={() => { setTab('magic'); setErrorMsg(''); setMagicSent(false) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'magic' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Sparkles className="h-4 w-4" />
          Sou Paciente
        </button>
        <button
          type="button"
          onClick={() => { setTab('password'); setErrorMsg(''); setMagicSent(false) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'password' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Lock className="h-4 w-4" />
          Sou Médico / Admin
        </button>
      </div>

      {/* Magic Link Tab */}
      {tab === 'magic' && (
        <>
          {magicSent ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Link enviado!</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Verifique seu e-mail e clique no link para acessar sua área de paciente. O link expira em 1 hora.
              </p>
              <button
                onClick={() => { setMagicSent(false); setErrorMsg('') }}
                className="mt-4 text-primary text-sm hover:underline"
              >
                Enviar novamente
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-gray-400 leading-relaxed">
                <p className="text-primary font-semibold mb-1">✨ Acesso para pacientes</p>
                Pacientes não precisam de senha! Digite o e-mail usado no agendamento e enviaremos um link direto para suas consultas.
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">E-mail do agendamento</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    name="email"
                    placeholder="seu@email.com"
                    required
                    type="email"
                  />
                </div>
              </div>
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                  {errorMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Mail className="h-4 w-4" /> Enviar link de acesso</>}
              </button>
            </form>
          )}
        </>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">E-mail</label>
            <input
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              name="email" placeholder="seu@email.com" required type="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Senha</label>
            <input
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="password" name="password" placeholder="••••••••" required
            />
          </div>
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}
          <button
            type="submit" disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-primary to-primary-dark text-gray-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#050505]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <Activity className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Virtua<span className="text-gradient">Doctor</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Acessar minha conta</h1>
          <p className="text-gray-400 text-sm text-center">Paciente? Use o acesso sem senha abaixo.</p>
        </div>

        <div className="glass p-8 rounded-3xl w-full">
          <Suspense fallback={<div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
