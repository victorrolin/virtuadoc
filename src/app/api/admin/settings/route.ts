import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await adminClient
      .from('system_settings')
      .select('key, value')

    if (error) {
      if (error.code === '42P01') {
        // Tabela não existe
        return NextResponse.json({ settings: {} })
      }
      throw error
    }

    const settings = data.reduce((acc: any, row) => {
      acc[row.key] = row.value
      return acc
    }, {})

    return NextResponse.json({ settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString()
    }))

    for (const update of updates) {
      const { error } = await adminClient
        .from('system_settings')
        .upsert(update, { onConflict: 'key' })
      
      if (error) {
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'A tabela system_settings não existe no Supabase. Por favor, crie-a pelo painel.' }, { status: 400 })
        }
        throw error
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
