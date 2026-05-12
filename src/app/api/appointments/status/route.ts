import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { appointmentId, status } = await request.json()

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    // Verificar autenticação com o cliente normal
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'doctor' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
    }

    // Usar cliente admin para contornar RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await adminClient
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno.' }, { status: 500 })
  }
}
