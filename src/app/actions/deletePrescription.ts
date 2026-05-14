'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePrescription(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    // Deleta a receita apenas se pertencer ao médico logado
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id)
      .eq('doctor_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/receitas')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting prescription:', error)
    return { success: false, error: error.message }
  }
}
