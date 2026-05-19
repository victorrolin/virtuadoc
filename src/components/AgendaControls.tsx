'use client'

import { useState, useTransition } from 'react'
import { saveSchedule, saveOnlineStatus } from '@/app/actions/agenda'
import {
  Calendar,
  Zap,
  ShieldCheck,
  Clock,
  Save,
  ChevronDown,
  ChevronUp,
  Info,
  Radio,
  CalendarDays,
} from 'lucide-react'

type ExistingSchedule = {
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
}

type AgendaControlsProps = {
  initialOnlineStatus: boolean
  existingSchedules: ExistingSchedule[]
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
]

type Mode = 'scheduled' | 'live' | null

export function AgendaControls({ initialOnlineStatus, existingSchedules }: AgendaControlsProps) {
  const [activeMode, setActiveMode] = useState<Mode>(
    initialOnlineStatus ? 'live' : existingSchedules.length > 0 ? 'scheduled' : null
  )
  const [isOnline, setIsOnline] = useState(initialOnlineStatus)
  const [isPending, startTransition] = useTransition()
  const [showScheduleForm, setShowScheduleForm] = useState(activeMode === 'scheduled')
  const [saved, setSaved] = useState(false)

  const handleModeSelect = (mode: Mode) => {
    if (activeMode === mode) {
      setActiveMode(null)
      setShowScheduleForm(false)
      if (mode === 'live' && isOnline) {
        setIsOnline(false)
        startTransition(() => saveOnlineStatus(false))
      }
      return
    }

    setActiveMode(mode)

    if (mode === 'live') {
      setShowScheduleForm(false)
      const newVal = true
      setIsOnline(newVal)
      startTransition(() => saveOnlineStatus(newVal))
    } else {
      // Turn off live if switching to scheduled
      if (isOnline) {
        setIsOnline(false)
        startTransition(() => saveOnlineStatus(false))
      }
      setShowScheduleForm(true)
    }
  }

  const handleSaveSchedule = async (formData: FormData) => {
    await saveSchedule(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">

      {/* ── Hero Banner de Controle ── */}
      <div className="glass rounded-3xl p-6 border border-white/8 bg-gradient-to-br from-black/60 to-black/30">
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 border border-primary/20">
            <Calendar className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Controle de Disponibilidade</h2>
            <p className="text-xs text-gray-400">Escolha como deseja ser encontrado pelos pacientes</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card — Agenda Programada */}
          <button
            type="button"
            onClick={() => handleModeSelect('scheduled')}
            className={`relative group text-left rounded-2xl p-5 border transition-all duration-300 focus:outline-none ${
              activeMode === 'scheduled'
                ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(0,242,254,0.12)]'
                : 'bg-black/30 border-white/8 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
                  activeMode === 'scheduled'
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'bg-white/5 border-white/10 text-gray-400 group-hover:text-white'
                }`}>
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className={`font-bold text-sm transition-colors ${activeMode === 'scheduled' ? 'text-primary' : 'text-white'}`}>
                    Agenda Programada
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                    Defina dias e horários fixos com antecedência de 24h
                  </p>
                </div>
              </div>
              <span className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                activeMode === 'scheduled' ? 'border-primary bg-primary' : 'border-white/20 bg-transparent'
              }`}>
                {activeMode === 'scheduled' && (
                  <span className="h-2 w-2 rounded-full bg-black" />
                )}
              </span>
            </div>

            {activeMode === 'scheduled' && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Modo Ativo
              </div>
            )}
          </button>

          {/* Card — Plantão Online (Ao Vivo) */}
          <button
            type="button"
            onClick={() => handleModeSelect('live')}
            disabled={isPending}
            className={`relative group text-left rounded-2xl p-5 border transition-all duration-300 focus:outline-none disabled:opacity-60 ${
              activeMode === 'live'
                ? 'bg-green-500/10 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                : 'bg-black/30 border-white/8 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
                  activeMode === 'live'
                    ? 'bg-green-500/20 border-green-400/40 text-green-400'
                    : 'bg-white/5 border-white/10 text-gray-400 group-hover:text-white'
                }`}>
                  <Radio className="h-5 w-5" />
                </span>
                <div>
                  <p className={`font-bold text-sm transition-colors ${activeMode === 'live' ? 'text-green-400' : 'text-white'}`}>
                    Plantão Online
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                    Fique disponível agora para atendimento imediato
                  </p>
                </div>
              </div>
              {/* Toggle visual */}
              <div className={`mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full shrink-0 transition-all ${
                isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-700'
              }`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isOnline ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </div>

            {activeMode === 'live' && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Online Agora — Visível para Pacientes
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── Regras da Plataforma ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`glass p-5 rounded-2xl flex gap-4 border-l-4 transition-all ${
          activeMode === 'scheduled'
            ? 'border-primary bg-primary/5'
            : 'border-gray-700 bg-black/20 opacity-60'
        }`}>
          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              Antecedência de 24 horas
              {activeMode === 'scheduled' && (
                <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Ativa</span>
              )}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Os pacientes só podem agendar consultas com no mínimo <strong className="text-gray-300">24h de antecedência</strong>.
              Exceção: quando você estiver no modo Plantão Online.
            </p>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border-l-4 border-green-500 bg-green-500/5 flex gap-4">
          <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              Garantia ao Paciente
              <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Sempre Ativa</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consultas não realizadas pelo médico resultam em <strong className="text-gray-300">estorno automático</strong> do valor ao paciente — garantindo confiança na plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* ── Formulário de Horários (Condicional) ── */}
      {activeMode === 'scheduled' && showScheduleForm && (
        <div className="glass rounded-3xl border border-primary/20 overflow-hidden animate-[fadeIn_0.3s_ease]">
          {/* Header colapsável */}
          <button
            type="button"
            onClick={() => setShowScheduleForm(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="font-bold text-white text-sm">Configurar Dias e Horários de Atendimento</span>
            </div>
            {showScheduleForm ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* Dica */}
          <div className="px-6 pt-4">
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl p-3">
              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Defina os dias e intervalos de atendimento. Os horários ficam disponíveis para agendamento com <strong>24h de antecedência mínima</strong>. Slots são gerados automaticamente dentro do intervalo configurado.
              </p>
            </div>
          </div>

          <form action={handleSaveSchedule} className="p-6">
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const existing = existingSchedules.find(s => s.day_of_week === day.id)
                const isEnabled = !!existing
                return (
                  <div
                    key={day.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-black/25 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:w-44">
                      <input
                        type="checkbox"
                        id={`day_${day.id}_enabled`}
                        name={`day_${day.id}_enabled`}
                        value="true"
                        defaultChecked={isEnabled}
                        className="w-4 h-4 accent-primary bg-black/50 border-white/10 rounded cursor-pointer"
                      />
                      <label
                        htmlFor={`day_${day.id}_enabled`}
                        className="text-white text-sm font-medium cursor-pointer select-none"
                      >
                        {day.name}
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Das</span>
                        <input
                          type="time"
                          name={`day_${day.id}_start`}
                          defaultValue={existing?.start_time || '08:00'}
                          className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">às</span>
                        <input
                          type="time"
                          name={`day_${day.id}_end`}
                          defaultValue={existing?.end_time || '18:00'}
                          className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-gray-500 text-xs">Duração:</span>
                        <select
                          name={`day_${day.id}_duration`}
                          defaultValue={existing?.slot_duration_minutes ?? 30}
                          className="bg-black/40 border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">1 hora</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-green-400 flex items-center gap-1.5 animate-[fadeIn_0.2s_ease]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Horários salvos com sucesso!
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-gray-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_25px_rgba(0,242,254,0.35)] flex items-center gap-2 text-sm"
                >
                  <Save className="h-4 w-4" />
                  Salvar Horários
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Estado vazio — nenhum modo selecionado ── */}
      {activeMode === null && (
        <div className="glass rounded-2xl p-8 text-center border border-white/5 bg-black/20">
          <Zap className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Selecione um modo de disponibilidade acima para começar a receber pacientes.</p>
        </div>
      )}

      {/* ── Info Plantão Online ativo ── */}
      {activeMode === 'live' && (
        <div className="glass rounded-2xl p-5 border border-green-400/20 bg-green-500/5 flex items-start gap-3 animate-[fadeIn_0.3s_ease]">
          <Radio className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-green-400 font-bold text-sm mb-1">Você está Online Agora</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Seu perfil aparece em destaque para pacientes buscando <strong>atendimento imediato</strong>.
              Desative quando não estiver mais disponível para encerrar o plantão.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
