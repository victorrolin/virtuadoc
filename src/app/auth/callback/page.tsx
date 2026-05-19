'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Activity, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    async function handleCallback() {
      const searchParams = new URLSearchParams(window.location.search)
      const next = searchParams.get('next') || '/dashboard/minhas-consultas'

      // Extrair tokens do hash da URL (fluxo implícito do Supabase magic link)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      const code = searchParams.get('code')

      if (code) {
        // Fluxo PKCE — trocar código pela sessão
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('exchangeCodeForSession error:', error.message)
          router.replace('/login?message=Link+inválido+ou+expirado.+Solicite+um+novo.')
        } else {
          router.replace(next)
        }
      } else if (accessToken && refreshToken) {
        // Tokens encontrados no hash — estabelecer sessão manualmente (fluxo implícito)
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          console.error('setSession error:', error.message)
          router.replace('/login?message=Link+inválido+ou+expirado.+Solicite+um+novo.')
        } else {
          router.replace(next)
        }
      } else {
        // Sem hash ou code — verificar se já há sessão ativa
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          router.replace(next)
        } else {
          router.replace('/login?message=Link+expirado.+Solicite+um+novo+acesso.')
        }
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
