import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  const logs: string[] = []

  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Buscar credenciais
    let dbUrl = '', dbInstance = '', dbKey = ''
    try {
      const { data, error } = await adminClient.from('system_settings').select('key, value').in('key', ['EVOLUTION_API_URL', 'EVOLUTION_INSTANCE_NAME', 'EVOLUTION_API_KEY'])
      if (error) logs.push(`❌ Erro ao buscar system_settings: ${error.message}`)
      else if (data) {
        dbUrl = data.find((d: any) => d.key === 'EVOLUTION_API_URL')?.value || ''
        dbInstance = data.find((d: any) => d.key === 'EVOLUTION_INSTANCE_NAME')?.value || ''
        dbKey = data.find((d: any) => d.key === 'EVOLUTION_API_KEY')?.value || ''
        logs.push(`✅ system_settings encontradas: url=${dbUrl}, instance=${dbInstance}, key=${dbKey ? dbKey.slice(0, 8) + '...' : 'VAZIO'}`)
      }
    } catch (e: any) {
      logs.push(`❌ Exceção ao buscar system_settings: ${e.message}`)
    }

    const apiUrl = dbUrl || process.env.EVOLUTION_API_URL || ''
    const instanceName = dbInstance || process.env.EVOLUTION_INSTANCE_NAME || ''
    const apiKey = dbKey || process.env.EVOLUTION_API_KEY || ''

    logs.push(`📋 Credenciais usadas: url=${apiUrl || 'VAZIO'}, instance=${instanceName || 'VAZIO'}, key=${apiKey ? apiKey.slice(0, 8) + '...' : 'VAZIO'}`)

    if (!apiUrl || !instanceName || !apiKey) {
      return NextResponse.json({ ok: false, logs, error: 'Credenciais incompletas!' })
    }

    // 2. Formatar número
    let formattedNumber = phone.replace(/\D/g, '')
    if (formattedNumber.length === 10 || formattedNumber.length === 11) {
      formattedNumber = `55${formattedNumber}`
    }
    logs.push(`📱 Número formatado: ${formattedNumber}`)

    // 3. Fazer a chamada à Evolution API
    const url = `${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`
    logs.push(`🌐 URL da requisição: ${url}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: `🧪 *Teste VirtuaDoctor* - Se recebeu isso, o WhatsApp está funcionando! ✅`,
      }),
    })

    const responseText = await response.text()
    logs.push(`📡 Status HTTP: ${response.status}`)
    logs.push(`📦 Resposta da API: ${responseText}`)

    return NextResponse.json({ ok: response.ok, logs })
  } catch (err: any) {
    logs.push(`❌ Exceção geral: ${err.message}`)
    return NextResponse.json({ ok: false, logs, error: err.message })
  }
}
