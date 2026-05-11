'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { updateAppointmentStatus } from '@/app/actions/appointmentStatus'

interface Props {
  appointmentId: string
}

export function AppointmentActions({ appointmentId }: Props) {
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<'completed' | 'cancelled' | null>(null)
  const [error, setError] = useState('')

  async function execute(status: 'completed' | 'cancelled') {
    setLoading(true)
    setError('')
    try {
      const res = await updateAppointmentStatus(appointmentId, status)
      if (res.error) {
        setError(res.error)
        setPending(null)
        setLoading(false)
      } else {
        // Recarregar a página para refletir a mudança no Server Component
        window.location.reload()
      }
    } catch (e: any) {
      setError('Erro inesperado. Tente novamente.')
      setPending(null)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
        ⚠ {error}
      </span>
    )
  }

  // Confirmação inline
  if (pending) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-300 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
          {pending === 'completed' ? 'Confirmar conclusão?' : 'Confirmar cancelamento?'}
        </span>
        <button
          onClick={() => execute(pending)}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
            pending === 'completed'
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <CheckCircle2 className="h-3.5 w-3.5" />}
          {loading ? 'Salvando...' : 'Sim'}
        </button>
        <button
          onClick={() => { setPending(null); setError('') }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => setPending('completed')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-all"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
      </button>
      <button
        onClick={() => setPending('cancelled')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
      >
        <XCircle className="h-3.5 w-3.5" /> Cancelar
      </button>
    </div>
  )
}
