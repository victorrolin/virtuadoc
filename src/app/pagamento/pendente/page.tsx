'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock, Mail, Video, CheckCircle2, ArrowRight, Smartphone, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function PendenteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentId = searchParams.get('payment_id')
  const [checking, setChecking] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  // Polling automático a cada 5 segundos
  useEffect(() => {
    if (!paymentId || confirmed) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?payment_id=${paymentId}`)
        const data = await res.json()
        setPollCount(c => c + 1)

        if (data.status === 'approved') {
          setConfirmed(true)
          clearInterval(interval)
          setTimeout(() => router.push('/dashboard/minhas-consultas'), 3000)
        }
      } catch { /* continua tentando */ }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentId, confirmed, router])

  // Verificação manual
  async function checkNow() {
    if (!paymentId) return
    setChecking(true)
    try {
      const res = await fetch(`/api/checkout/status?payment_id=${paymentId}`)
      const data = await res.json()
      if (data.status === 'approved') {
        setConfirmed(true)
        setTimeout(() => router.push('/dashboard/minhas-consultas'), 3000)
      } else {
        alert('Pagamento ainda não confirmado. Aguarde alguns instantes.')
      }
    } catch {
      alert('Erro ao verificar. Tente novamente.')
    } finally {
      setChecking(false)
    }
  }

  // Pagamento confirmado
  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pix Confirmado! 🎉</h1>
          <p className="text-gray-400 text-sm mb-4">Consulta agendada. Redirecionando para suas consultas...</p>
          <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="max-w-md w-full space-y-4">

        {/* Card principal */}
        <div className="glass rounded-3xl p-8 text-center border border-primary/20 shadow-[0_0_40px_rgba(0,242,254,0.08)]">
          <div className="relative h-20 w-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full flex items-center justify-center">
              <Clock className="h-9 w-9 text-yellow-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Aguardando confirmação do Pix
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Pague o Pix no seu banco</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Volte ao <strong className="text-white">Mercado Pago</strong> (aba anterior), escaneie o QR code ou copie o código Pix e pague no app do seu banco.
          </p>

          {/* Passos */}
          <div className="text-left space-y-3 mb-6">
            {[
              { step: 1, title: 'Volte à aba do Mercado Pago', desc: 'A aba ainda está aberta no seu navegador', color: 'text-primary', bg: 'bg-primary/10' },
              { step: 2, title: 'Escaneie o QR Code ou Copie e Cole', desc: 'Abra o app do banco → Pix → Pagar → QR Code', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { step: 3, title: 'Confirme o pagamento no banco', desc: 'Após confirmar, volte aqui — detectamos automaticamente', color: 'text-green-400', bg: 'bg-green-500/10' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className={`h-7 w-7 rounded-full ${item.bg} border border-white/10 ${item.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {item.step}
                </span>
                <div>
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="space-y-3">
            {/* Verificar manualmente */}
            <button
              onClick={checkNow}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-all text-sm disabled:opacity-70"
            >
              {checking ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
              ) : (
                <><RefreshCw className="h-4 w-4" /> Já paguei — verificar agora</>
              )}
            </button>

            <Link
              href="/dashboard/minhas-consultas"
              className="w-full flex items-center justify-center gap-2 border border-white/10 text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              <Video className="h-4 w-4" /> Ir para Minhas Consultas
            </Link>
          </div>

          {/* Auto polling info */}
          {paymentId && (
            <p className="text-xs text-gray-600 mt-4 flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verificando automaticamente... ({pollCount} verificações)
            </p>
          )}
        </div>

        {/* Contato */}
        <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Dúvidas? <strong className="text-white">suporte@virtuadoc.automatech.tech</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PagamentoPendente() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <PendenteContent />
    </Suspense>
  )
}
