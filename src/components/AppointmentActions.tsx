'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, AlertTriangle, FileText } from 'lucide-react'
import { PrescriptionModal } from './PrescriptionModal'

interface Props {
  appointmentId: string
  patientName?: string
  doctorName?: string
}

export function AppointmentActions({ appointmentId, patientName = 'Paciente', doctorName = 'Médico' }: Props) {
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<'completed' | 'cancelled' | null>(null)
  const [error, setError] = useState('')
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false)

  async function execute(status: 'completed' | 'cancelled') {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/appointments/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Erro ao salvar.')
        setPending(null)
        setLoading(false)
      } else {
        window.location.reload()
      }
    } catch (e: any) {
      setError('Erro de conexão. Tente novamente.')
      setPending(null)
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
          ⚠ {error}
        </span>
        <button onClick={() => setError('')} className="text-xs text-gray-500 hover:text-white">✕</button>
      </div>
    )
  }

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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
            pending === 'completed'
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
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
        onClick={() => setIsPrescriptionOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-semibold transition-all"
      >
        <FileText className="h-3.5 w-3.5" /> Receita
      </button>

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

      <PrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        appointmentId={appointmentId}
        patientName={patientName}
        doctorName={doctorName}
      />
    </div>
  )
}

