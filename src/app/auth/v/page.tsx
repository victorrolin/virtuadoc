'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Activity, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react'

function VerifyHandoffContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = searchParams.get('t')
    if (t) {
      setToken(t)
    } else {
      setError('Token de acesso não encontrado. Solicite um novo link.')
    }
  }, [searchParams])

  const handleAccess = () => {
    if (!token) return

    setLoading(true)

    // Identificar a URL base de forma dinâmica usando window.location.origin
    const origin = window.location.origin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vghfzvevlfxtpitmqmsv.supabase.co'
    
    // Garantir que a URL do callback aponte de volta para o domínio correto do usuário
    const callbackUrl = `${origin}/auth/callback?next=/dashboard/minhas-consultas`

    // Construir a URL oficial de verificação do Supabase
    const officialVerifyUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(callbackUrl)}`

    // Redirecionar o navegador do usuário
    window.location.href = officialVerifyUrl
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] p-4 font-sans select-none relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[250px] h-[250px] bg-[#00f2fe]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Logo */}
      <div className="flex items-center gap-2 mb-2 z-10 animate-fade-in">
        <Activity className="h-8 w-8 text-primary animate-pulse" />
        <span className="text-2xl font-bold text-white tracking-tight">
          Virtua<span className="text-gradient">Doctor</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="glass rounded-3xl p-8 max-w-md w-100 flex flex-col items-center gap-6 border border-white/5 shadow-2xl relative z-10 backdrop-blur-xl animate-scale-up">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-white font-bold text-xl mb-2">Ops! Link Inválido</h2>
              <p className="text-gray-400 text-sm leading-relaxed px-2">
                {error}
              </p>
            </div>
            <button
              onClick={() => router.replace('/login')}
              className="mt-2 w-full py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 border border-white/10 active:scale-[0.98]"
            >
              Voltar para a tela de login
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2 relative">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 rounded-3xl border border-primary/30 animate-ping opacity-25" />
            </div>

            <div className="text-center">
              <h2 className="text-white font-bold text-2xl tracking-tight mb-2">Confirmação de Acesso</h2>
              <p className="text-gray-400 text-sm leading-relaxed px-4">
                Clique no botão abaixo para acessar com segurança o seu painel de consultas.
              </p>
            </div>

            <div className="w-full mt-4 flex flex-col gap-3">
              <button
                onClick={handleAccess}
                disabled={loading}
                className="w-full py-4.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#00f2fe] text-black font-extrabold text-base tracking-wide shadow-[0_0_25px_rgba(0,242,254,0.25)] hover:shadow-[0_0_35px_rgba(0,242,254,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Portal</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <span className="text-[11px] text-gray-500 text-center mt-2 block uppercase tracking-wider font-semibold">
                Link de uso único • Válido por 1 hora
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-4 z-10">
        © 2026 VirtuaDoctor – Telemedicina Premium
      </p>
    </div>
  )
}

export default function VerifyHandoffPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505] p-4">
        <Activity className="h-8 w-8 text-primary animate-pulse" />
      </div>
    }>
      <VerifyHandoffContent />
    </Suspense>
  )
}
