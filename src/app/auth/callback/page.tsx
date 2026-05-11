'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Activity, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // O Supabase client detecta automaticamente o hash/code na URL
    // e troca pelos cookies de sessão
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error.message)
        router.replace('/login?message=Link+expirado+ou+inválido.+Solicite+um+novo.')
        return
      }

      if (data.session) {
        // Sessão estabelecida com sucesso — redirecionar para o destino
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/dashboard/minhas-consultas'
        router.replace(next)
      } else {
        // Aguardar o evento onAuthStateChange para pegar a sessão do hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            const params = new URLSearchParams(window.location.search)
            const next = params.get('next') || '/dashboard/minhas-consultas'
            router.replace(next)
          } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
            subscription.unsubscribe()
            router.replace('/login?message=Link+expirado.+Solicite+um+novo.')
          }
        })

        // Timeout de segurança — se não autenticar em 10s, redireciona para login
        setTimeout(() => {
          subscription.unsubscribe()
          router.replace('/login?message=Tempo+esgotado.+Tente+novamente.')
        }, 10000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050505]">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-white">
          Virtua<span className="text-gradient">Doctor</span>
        </span>
      </div>
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 border border-white/5">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Verificando acesso...</p>
          <p className="text-gray-400 text-sm mt-1">Aguarde, estamos confirmando sua identidade.</p>
        </div>
      </div>
    </div>
  )
}
