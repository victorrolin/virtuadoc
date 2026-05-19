import { createClient } from '@supabase/supabase-js'

export async function sendWhatsAppMessage({
  to,
  text,
}: {
  to: string
  text: string
}) {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  let dbUrl = '', dbInstance = '', dbKey = ''
  try {
    const { data } = await adminClient.from('system_settings').select('key, value').in('key', ['EVOLUTION_API_URL', 'EVOLUTION_INSTANCE_NAME', 'EVOLUTION_API_KEY'])
    if (data) {
      dbUrl = data.find((d: any) => d.key === 'EVOLUTION_API_URL')?.value || ''
      dbInstance = data.find((d: any) => d.key === 'EVOLUTION_INSTANCE_NAME')?.value || ''
      dbKey = data.find((d: any) => d.key === 'EVOLUTION_API_KEY')?.value || ''
    }
  } catch (e) {
    // Tabela pode não existir, ignorar
  }

  const apiUrl = dbUrl || process.env.EVOLUTION_API_URL
  const instanceName = dbInstance || process.env.EVOLUTION_INSTANCE_NAME
  const apiKey = dbKey || process.env.EVOLUTION_API_KEY

  if (!apiUrl || !instanceName || !apiKey) {
    console.warn('⚠️ Credenciais da Evolution API não configuradas. Mensagem de WhatsApp não enviada.')
    return false
  }

  // Formatar número para E.164 brasileiro: 55 + DDD (2) + 9 dígitos = 13 dígitos total
  // Aceita: (51)995762718, 51995762718, 5551995762718, +5551995762718
  let formattedNumber = to.replace(/\D/g, '')

  // Remove o DDI 55 se já veio, para recolocar corretamente
  if (formattedNumber.startsWith('55') && formattedNumber.length > 12) {
    formattedNumber = formattedNumber.slice(2)
  }

  // Agora deve ter DDD + número (10 ou 11 dígitos)
  // Adiciona o DDI 55 + garante 9 dígito (nono dígito) se for celular com 10 dígitos
  if (formattedNumber.length === 10) {
    // Número sem o 9 na frente — insere o 9 após o DDD
    formattedNumber = `55${formattedNumber.slice(0, 2)}9${formattedNumber.slice(2)}`
  } else if (formattedNumber.length === 11) {
    // Número já tem o 9
    formattedNumber = `55${formattedNumber}`
  }

  try {
    const url = `${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Erro ao enviar WhatsApp para ${formattedNumber}:`, errorData)
      return false
    }

    console.log(`✅ WhatsApp enviado com sucesso para ${formattedNumber}`)
    return true
  } catch (error) {
    console.error('Erro de conexão com a Evolution API:', error)
    return false
  }
}
