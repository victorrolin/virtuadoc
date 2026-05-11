'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { updateAppointmentStatus } from '@/app/actions/appointmentStatus'

interface Props {
  appointmentId: string
}

export function AppointmentActions({ appointmentId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState<'completed' | 'cancelled' | null>(null)
  const [error, setError] = useState('')

  async function execute(status: 'completed' | 'cancelled') {
    setLoading(true)
    setError('')
    const res = await updateAppointmentStatus(appointmentId, status)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      setConfirm(null)
    } else {
      router.refresh()
    }
  }

  // Estado de confirmação inline
  if (confirm) {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
          {confirm === 'completed' ? 'Confirmar conclusão?' : 'Confirmar cancelamento?'}
        </span>
        <button
          onClick={() => execute(confirm)}
          disabled={loading}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
            confirm === 'completed'
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sim'}
        </button>
        <button
          onClick={() => setConfirm(null)}
          disabled={loading}
          className="px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
        >
          Não
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => setConfirm('completed')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-all"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
      </button>
      <button
        onClick={() => setConfirm('cancelled')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
      >
        <XCircle className="h-3.5 w-3.5" /> Cancelar
      </button>
    </div>
  )
}
