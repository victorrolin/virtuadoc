import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'doctor') {
      return NextResponse.json({ error: 'Acesso restrito a médicos.' }, { status: 403 })
    }

    const body = await request.json()

    // Enviar requisição para o n8n
    const response = await fetch('https://workspace.n8n.automatech.tech/webhook/virtuadoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao se comunicar com o agente de IA.' }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
