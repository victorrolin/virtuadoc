'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSchedule(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Parse os dias selecionados
  const days = [0, 1, 2, 3, 4, 5, 6]
  
  // Primeiro, removemos todos os horários antigos desse médico
  await supabase
    .from('doctor_schedules')
    .delete()
    .eq('doctor_id', user.id)

  // Em seguida, inserimos os novos horários
  const schedulesToInsert = []

  for (const day of days) {
    const isEnabled = formData.get(`day_${day}_enabled`) === 'true'
    if (isEnabled) {
      const startTime = formData.get(`day_${day}_start`) as string
      const endTime = formData.get(`day_${day}_end`) as string
      const duration = parseInt(formData.get(`day_${day}_duration`) as string) || 30

      if (startTime && endTime) {
        schedulesToInsert.push({
          doctor_id: user.id,
          day_of_week: day,
          start_time: startTime,
          end_time: endTime,
          slot_duration_minutes: duration
        })
      }
    }
  }

  if (schedulesToInsert.length > 0) {
    const { error } = await supabase
      .from('doctor_schedules')
      .insert(schedulesToInsert)

    if (error) {
      console.error('Error saving schedules:', error)
      throw new Error('Falha ao salvar horários.')
    }
  }

  revalidatePath('/dashboard/agenda')
}

export async function getSchedule() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', user.id)
    
  return data || []
}
