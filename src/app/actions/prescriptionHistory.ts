'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPrescriptionHistory() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, prescriptions: data }
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error)
    return { success: false, error: error.message }
  }
}
