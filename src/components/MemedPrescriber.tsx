'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react'

interface MemedPrescriberProps {
  doctorToken: string // Token fornecido pela Memed para o médico
  patientData: {
    nome: string
    cpf?: string
    telefone?: string
  }
  onPrescriptionSent?: (data: any) => void
}

declare global {
  interface Window {
    MdHub: any
  }
}

export function MemedPrescriber({ doctorToken, patientData, onPrescriptionSent }: MemedPrescriberProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 1. Evitar carregar o script múltiplas vezes
    if (window.MdHub) {
      setLoading(false)
      return
    }

    const script = document.createElement('script')
    script.setAttribute('data-color', '#00f2fe')
    script.setAttribute('data-container', 'memed-container')
    script.src = 'https://integracoes.memed.com.br/embed/script.js'
    script.async = true
    
    script.onload = () => {
      if (window.MdHub) {
        window.MdHub.command.send('setToken', doctorToken)
        setLoading(false)
      }
    }

    script.onerror = () => {
      setError('Erro ao carregar o módulo de prescrição digital.')
      setLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      // Opcional: limpeza se necessário
    }
  }, [doctorToken])

  const openPrescriber = () => {
    if (window.MdHub) {
      // Configurar dados do paciente antes de abrir
      window.MdHub.command.send('setPaciente', {
        nome: patientData.nome,
        cpf: patientData.cpf || '',
        telefone: patientData.telefone || ''
      })
      
      // Abrir o prescritor
      window.MdHub.command.send('showPrescritor')

      // Ouvir evento de prescrição enviada
      window.MdHub.event.add('prescricaoImpressa', (data: any) => {
        if (onPrescriptionSent) onPrescriptionSent(data)
      })
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Prescrição Digital Legal</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Utilize o módulo oficial da Memed para gerar receitas aceitas em todas as farmácias com assinatura digital ICP-Brasil.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={openPrescriber}
            disabled={loading}
            className="w-full py-4 bg-primary text-black font-extrabold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando Módulo...
              </>
            ) : (
              'Abrir Prescritor Memed'
            )}
          </button>
        </div>
      </div>
      
      {/* Container onde o widget da Memed será renderizado (invisível até ser aberto) */}
      <div id="memed-container"></div>
    </div>
  )
}
