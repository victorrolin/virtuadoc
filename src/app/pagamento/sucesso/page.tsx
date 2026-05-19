'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Video, Calendar, Mail, ArrowRight, Sparkles, Clock, X } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const collectionStatus = searchParams.get('collection_status')

  const [countdown, setCountdown] = useState(8)
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; delay: number }[]>([])

  // Gera partículas de confetti
  useEffect(() => {
    const colors = ['#00f2fe', '#4facfe', '#667eea', '#22c55e', '#fbbf24', '#f472b6']
    const pts = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      color: colors[i % colors.length],
      delay: Math.random() * 1.5,
    }))
    setParticles(pts)
  }, [])

  // Countdown → redireciona para minhas consultas
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard/minhas-consultas')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, router])

  const isPending = collectionStatus === 'pending' || status === 'pending'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">

      {/* Partículas de fundo */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-0 animate-[confetti_2s_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '8px',
            height: '8px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Brilho de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/6 rounded-full blur-2xl" />
      </div>

      <div className="max-w-md w-full space-y-4 relative z-10">

        {/* Card principal */}
        <div className="glass rounded-3xl p-8 text-center border border-green-500/25 shadow-[0_0_50px_rgba(34,197,94,0.12)]">

          {/* Ícone animado */}
          <div className="relative h-24 w-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-green-500/10 border-2 border-green-500/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {isPending ? 'Pagamento em análise ⏳' : 'Pagamento Confirmado! 🎉'}
          </h1>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {isPending
              ? 'Seu pagamento está sendo processado. Assim que confirmado, você receberá o link da consulta por e-mail.'
              : <>Sua consulta está agendada. Em instantes você receberá um{' '}
                  <strong className="text-white">e-mail com o link da videochamada</strong> e todos os detalhes.</>
            }
          </p>

          {/* Checklist */}
          <div className="glass rounded-2xl p-4 mb-6 border border-white/5 text-left space-y-3">
            {[
              { icon: CheckCircle2, color: 'text-green-400', text: 'Consulta agendada com sucesso' },
              { icon: Mail, color: 'text-primary', text: 'E-mail de confirmação sendo enviado' },
              { icon: Video, color: 'text-cyan-400', text: 'Link da videochamada no e-mail' },
              { icon: Calendar, color: 'text-secondary', text: 'Entre no horário marcado' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                {item.text}
              </div>
            ))}
          </div>

          {paymentId && (
            <p className="text-[10px] text-gray-600 font-mono mb-2">
              ID do pagamento: {paymentId}
            </p>
          )}

          {/* Redirecionamento automático */}
          {!isPending && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
              <Clock className="h-3.5 w-3.5" />
              Redirecionando para suas consultas em{' '}
              <span className="text-primary font-bold tabular-nums w-4 inline-block text-center">
                {countdown}
              </span>s
            </div>
          )}
        </div>

        {/* CTA Portal do Paciente */}
        <div className="glass rounded-3xl p-6 border border-primary/20 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-white font-semibold text-sm">Acompanhe sua consulta</p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Acesse seu <strong className="text-white">Portal do Paciente</strong> para ver o link da
            videochamada, histórico e receitas digitais.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/minhas-consultas"
              className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm"
            >
              <Video className="h-4 w-4" />
              Ver Minhas Consultas
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Botão fechar aba — útil quando MP abriu em nova aba */}
            <button
              onClick={() => {
                try {
                  window.close()
                } catch {
                  // Se não conseguir fechar, redireciona
                  router.push('/dashboard/minhas-consultas')
                }
                // Fallback: se window.close() não funcionar, redireciona
                setTimeout(() => router.push('/dashboard/minhas-consultas'), 300)
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Fechar esta janela
            </button>
          </div>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-gray-600 hover:text-gray-400 transition-colors py-2"
        >
          Voltar à página inicial
        </Link>
      </div>

      <style jsx global>{`
        @keyframes confetti {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          20%  { opacity: 1; transform: translateY(-30px) scale(1) rotate(45deg); }
          100% { opacity: 0; transform: translateY(80px) scale(0.5) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default function PagamentoSucesso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
