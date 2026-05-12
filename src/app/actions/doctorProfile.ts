'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function updateDoctorProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const bio = formData.get('bio') as string
  const fullName = formData.get('fullName') as string

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminClient
    .from('profiles')
    .update({ bio: bio || null, full_name: fullName })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/perfil')
  revalidatePath(`/medico/${user.id}`)
  return { success: true }
}
