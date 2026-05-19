import { NextRequest, NextResponse } from 'next/server'

// Cria pagamento Pix diretamente via MP Payments API
// O usuário NUNCA sai da nossa página
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { doctorId, date, time, name, email, phone, cpf, reason, price, doctorName, specialty } = body

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Token MP não configurado' }, { status: 500 })
    }

    // Gera link da sala Jitsi único
    const roomId = `virtuadoc-${doctorId.slice(0, 8)}-${Date.now()}`
    const meetLink = `https://meet.jit.si/${roomId}`

    // Cria pagamento Pix direto (Checkout Transparente)
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': roomId, // evita duplicatas se a requisição repetir
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(price) || 1,
        description: `Teleconsulta com ${doctorName} – ${specialty || 'Consulta Online'}`,
        payment_method_id: 'pix',
        payer: {
          email,
          first_name: name?.split(' ')[0] || name,
          last_name: name?.split(' ').slice(1).join(' ') || '',
          identification: {
            type: 'CPF',
            number: cpf?.replace(/\D/g, '') || '',
          },
        },
        notification_url: `${appUrl}/api/webhook/mp`,
        metadata: {
          doctor_id: doctorId,
          patient_name: name,
          patient_email: email,
          patient_phone: phone,
          appointment_date: date,
          appointment_time: time,
          meet_link: meetLink,
          reason: reason || '',
        },
      }),
    })

    const mpData = await mpRes.json()

    if (!mpRes.ok || mpData.error) {
      console.error('MP Pix error:', JSON.stringify(mpData))
      return NextResponse.json(
        { success: false, error: mpData?.message || 'Erro ao gerar Pix' },
        { status: 500 }
      )
    }

    // Retorna os dados do QR code para exibir na nossa página
    const pixData = mpData.point_of_interaction?.transaction_data

    return NextResponse.json({
      success: true,
      paymentId: mpData.id,
      status: mpData.status,
      qrCode: pixData?.qr_code,           // código copia-e-cola
      qrCodeBase64: pixData?.qr_code_base64, // imagem QR
      meetLink,
    })

  } catch (err: any) {
    console.error('Pix checkout error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
