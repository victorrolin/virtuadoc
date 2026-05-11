'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type AppointmentStatus = 'completed' | 'cancelled' | 'paid' | 'pending'

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'doctor' && profile?.role !== 'admin')
    return { error: 'Sem permissão.' }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)

  if (error) return { error: 'Erro ao atualizar: ' + error.message }

  revalidatePath('/dashboard/consultas')
  revalidatePath('/dashboard')
  return { success: true }
}
