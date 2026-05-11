'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// ── Trocar senha do admin logado ────────────────────────────
export async function changeAdminPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword)
    return { error: 'Preencha todos os campos.' }
  if (newPassword.length < 6)
    return { error: 'A nova senha deve ter pelo menos 6 caracteres.' }
  if (newPassword !== confirmPassword)
    return { error: 'As senhas não coincidem.' }

  // Verificar senha atual fazendo login temporário
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (signInError) return { error: 'Senha atual incorreta.' }

  // Atualizar senha
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: 'Erro ao atualizar senha: ' + error.message }

  return { success: 'Senha atualizada com sucesso!' }
}

// ── Criar novo usuário admin ─────────────────────────────────
export async function createAdminUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Sem permissão.' }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !password)
    return { error: 'Preencha todos os campos.' }
  if (password.length < 6)
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Criar usuário no Auth
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirmar e-mail automaticamente
    user_metadata: { full_name: fullName, role: 'admin' },
  })
  if (createError) {
    if (createError.message.includes('already registered'))
      return { error: 'Este e-mail já está cadastrado.' }
    return { error: 'Erro ao criar usuário: ' + createError.message }
  }

  // Inserir/atualizar perfil como admin
  await adminClient.from('profiles').upsert({
    id: newUser.user.id,
    full_name: fullName,
    role: 'admin',
    created_at: new Date().toISOString(),
  })

  revalidatePath('/dashboard/admin')
  return { success: `Admin "${fullName}" criado com sucesso! E-mail: ${email}` }
}
