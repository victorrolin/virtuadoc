'use client'

import { useState, useTransition } from 'react'
import { saveOnlineStatus } from '@/app/actions/agenda'
import { Zap, Activity } from 'lucide-react'

export function OnlineToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isOnline, setIsOnline] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newValue = !isOnline
    setIsOnline(newValue)
    startTransition(() => {
      saveOnlineStatus(newValue)
    })
  }

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-black/60 to-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Zap className={`h-6 w-6 ${isOnline ? 'text-green-400' : 'text-gray-500'}`} />
            Plantão Online (Atendimento Imediato)
          </h2>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Ative esta opção quando estiver disponível para atender pacientes <strong>imediatamente</strong>. Seu perfil ganhará destaque nas buscas de pacientes buscando pronto atendimento.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/10 shrink-0">
          <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
            {isOnline ? 'Online Agora' : 'Offline'}
          </span>
          <button 
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
              isOnline ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isOnline ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
