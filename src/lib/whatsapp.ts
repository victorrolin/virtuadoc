export async function sendWhatsAppMessage({
  to,
  text,
}: {
  to: string
  text: string
}) {
  const apiUrl = process.env.EVOLUTION_API_URL
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!apiUrl || !instanceName || !apiKey) {
    console.warn('⚠️ Credenciais da Evolution API não configuradas. Mensagem de WhatsApp não enviada.')
    return false
  }

  // A Evolution API geralmente precisa que o número tenha apenas números
  // e o código do país na frente (ex: 5511999999999)
  const formattedNumber = to.replace(/\D/g, '')

  try {
    const url = `${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
