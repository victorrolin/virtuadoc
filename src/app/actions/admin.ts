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
    return { error: 'Falha ao criar médico: ' + authError.message }
  }

  // 3. Update the CRM and Price in the profiles table
  if (authData.user) {
     await adminClient.from('profiles').update({
       crm: crm,
       price_per_consultation: price ? parseFloat(price) : null
     }).eq('id', authData.user.id)

     // 4. Inserir especialidades
     if (specialtiesRaw) {
       const specialtiesList = specialtiesRaw.split(',').map(s => s.trim()).filter(Boolean)
       
       for (const specName of specialtiesList) {
         // Upsert: Cria a especialidade se não existir (baseado no nome único)
         const { data: specData } = await adminClient
           .from('specialties')
           .upsert({ name: specName }, { onConflict: 'name' })
           .select()
           .single()

         if (specData) {
           // Associa o médico à especialidade
           await adminClient.from('doctor_specialties').insert({
             doctor_id: authData.user.id,
             specialty_id: specData.id
           })
         }
       }
     }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
