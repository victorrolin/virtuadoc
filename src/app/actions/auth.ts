'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string // 'patient' ou 'doctor'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role || 'patient',
      },
    },
  })

  if (error) {
    return redirect('/register?message=Não foi possível criar a conta: ' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) return { error: 'Informe seu e-mail.' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/dashboard/minhas-consultas`,
      shouldCreateUser: false, // Só acessa se já tiver conta (paciente criado via webhook)
    },
  })

  if (error) {
    // Se o usuário não existe, mostrar mensagem amigável
    if (error.message.includes('not found') || error.message.includes('Email not confirmed')) {
      return { error: 'E-mail não encontrado. Verifique se usou o mesmo e-mail do agendamento.' }
    }
    return { error: 'Não foi possível enviar o link. Tente novamente.' }
  }

  return { success: true }
}
