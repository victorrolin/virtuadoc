import { getSchedule, saveSchedule } from '@/app/actions/agenda'
import { Save, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda-feira' },
  { id: 2, name: 'Terça-feira' },
  { id: 3, name: 'Quarta-feira' },
  { id: 4, name: 'Quinta-feira' },
  { id: 5, name: 'Sexta-feira' },
  { id: 6, name: 'Sábado' },
]

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'doctor') {
    return redirect('/dashboard')
  }

  const existingSchedules = await getSchedule()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Clock className="h-8 w-8 text-secondary" /> Minha Agenda
        </h1>
        <p className="text-gray-400">
          Defina os dias e horários da semana que você atende. Os pacientes só poderão marcar consultas nos horários configurados aqui.
        </p>
      </div>

      <form action={saveSchedule} className="glass p-8 rounded-2xl">
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const existing = existingSchedules.find(s => s.day_of_week === day.id)
            const isEnabled = !!existing

            return (
              <div key={day.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                
                <div className="flex items-center gap-3 w-48">
                  <input 
                    type="checkbox" 
                    id={`day_${day.id}_enabled`}
                    name={`day_${day.id}_enabled`}
                    value="true"
                    defaultChecked={isEnabled}
                    className="w-5 h-5 accent-primary bg-black/50 border-white/10 rounded cursor-pointer"
                  />
                  <label htmlFor={`day_${day.id}_enabled`} className="text-white font-medium cursor-pointer">
                    {day.name}
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Das</span>
                    <input 
                      type="time" 
                      name={`day_${day.id}_start`}
                      defaultValue={existing?.start_time || '08:00'}
                      className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">às</span>
                    <input 
                      type="time" 
                      name={`day_${day.id}_end`}
                      defaultValue={existing?.end_time || '18:00'}
                      className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-gray-400 text-sm">Duração:</span>
                    <select 
                      name={`day_${day.id}_duration`}
                      defaultValue={existing?.slot_duration_minutes || 30}
                      className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
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

        <div className="mt-8 flex justify-end">
          <button 
            type="submit"
            className="bg-primary hover:bg-primary-dark text-gray-950 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)] flex items-center gap-2"
          >
            <Save className="h-5 w-5" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  )
}
