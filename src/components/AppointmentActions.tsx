'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { updateAppointmentStatus } from '@/app/actions/appointmentStatus'

interface Props {
  appointmentId: string
}

export function AppointmentActions({ appointmentId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'completed' | 'cancelled' | null>(null)

  async function handle(status: 'completed' | 'cancelled') {
    if (!confirm(status === 'completed'
      ? 'Marcar esta consulta como concluída?'
      : 'Cancelar esta consulta?'))
      return

    setLoading(status)
    const res = await updateAppointmentStatus(appointmentId, status)
    setLoading(null)

    if (res.success) {
      // Força re-fetch do Server Component — remove o card da lista imediatamente
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => handle('completed')}
        disabled={!!loading}
        title="Marcar como concluída"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-all disabled:opacity-50"
      >
        {loading === 'completed'
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <CheckCircle2 className="h-3.5 w-3.5" />}
        Concluir
      </button>
      <button
        onClick={() => handle('cancelled')}
        disabled={!!loading}
        title="Cancelar consulta"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all disabled:opacity-50"
      >
        {loading === 'cancelled'
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <XCircle className="h-3.5 w-3.5" />}
        Cancelar
      </button>
    </div>
  )
}
