'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadSignedPrescription(prescriptionId: string, fileUrl: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const { error } = await supabase
      .from('prescriptions')
      .update({
        is_signed: true,
        signed_at: new Date().toISOString(),
        signed_file_url: fileUrl
      })
      .eq('id', prescriptionId)
      .eq('doctor_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/receitas')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating prescription:', error)
    return { success: false, error: error.message }
  }
}
