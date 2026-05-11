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
      role: 'doctor' // The trigger handle_new_user will pick this up
    }
  })

  if (authError) {
    console.error('Auth Error:', authError)
    throw new Error('Falha ao criar usuário do médico.')
  }

  // 3. Update the CRM and Price in the profiles table
  if (authData.user) {
     const { error: profileError } = await adminClient.from('profiles').update({
       crm: crm,
       price_per_consultation: price ? parseFloat(price) : null
     }).eq('id', authData.user.id)

     if (profileError) {
       console.error('Profile Update Error:', profileError)
     }
  }

  revalidatePath('/dashboard/admin')
}
