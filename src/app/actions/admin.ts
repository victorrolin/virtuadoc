'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createDoctor(formData: FormData) {
  // 1. Verify if the current user is an Admin
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const crm = formData.get('crm') as string
  const price = formData.get('price') as string
  const specialtiesRaw = formData.get('specialties') as string

  try {
    // 2. Create the user using the Service Role Key
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'doctor'
      }
    })

    if (authError) {
      return { error: 'Falha Auth: ' + authError.message }
    }

    // 3. Update or Create the profile safely
    if (authData?.user) {
      const { error: upsertProfErr } = await adminClient.from('profiles').upsert({
        id: authData.user.id,
        full_name: fullName,
        role: 'doctor',
        crm: crm,
        price_per_consultation: price ? parseFloat(price) : null,
        specialties: specialtiesRaw // Gravando direto na nova coluna
      }, { onConflict: 'id' })

      if (upsertProfErr) return { error: 'Erro Profile: ' + upsertProfErr.message }
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    return { error: 'Exceção Crítica: ' + err.message }
  }
}

export async function deleteDoctor(doctorId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminClient.auth.admin.deleteUser(doctorId)
  
  if (error) {
    return { error: 'Falha ao excluir médico: ' + error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
