'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDoctorProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const bio = formData.get('bio') as string
  const fullName = formData.get('fullName') as string
  const specialties = formData.get('specialties') as string
  const crm = formData.get('crm') as string

  // A tabela profiles deve permitir update pelo próprio usuário via RLS
  const { error } = await supabase
    .from('profiles')
    .update({ 
      bio: bio || null, 
      full_name: fullName,
      specialties: specialties || null,
      crm: crm || null
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/perfil')
  revalidatePath(`/medico/${user.id}`)
  return { success: true }
}
