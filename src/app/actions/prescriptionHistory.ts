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

    // Filtrar para excluir exames ocupacionais do histórico de receitas
    const prescriptions = (data || []).filter((p: any) => {
      const isExam = p.medications && !Array.isArray(p.medications) && p.medications.type === 'exam'
      return !isExam
    })

    return { success: true, prescriptions }
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error)
    return { success: false, error: error.message }
  }
}
