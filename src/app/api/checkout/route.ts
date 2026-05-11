import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { doctorId, date, time, name, email, phone, cpf, reason, price, doctorName, specialty } = body

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Token MP não configurado' }, { status: 500 })
    }

    // Gerar link da sala Jitsi único
    const roomId = `virtuadoc-${doctorId.slice(0, 8)}-${Date.now()}`
    const meetLink = `https://meet.jit.si/${roomId}`

    // Chamar API REST do Mercado Pago diretamente
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: roomId,
            title: `Teleconsulta com ${doctorName || 'Médico'} – ${specialty || 'Consulta Online'}`,
            description: `Data: ${date} às ${time}. Motivo: ${reason || 'Não informado'}`,
            quantity: 1,
            unit_price: parseFloat(price) || 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: name?.split(' ')[0] || name,
          surname: name?.split(' ').slice(1).join(' ') || '',
          email: email,
          phone: {
            area_code: phone?.replace(/\D/g, '').slice(0, 2) || '11',
            number: phone?.replace(/\D/g, '').slice(2) || '',
          },
          identification: {
            type: 'CPF',
            number: cpf?.replace(/\D/g, '') || '',
          },
        },
        back_urls: {
          success: `${appUrl}/pagamento/sucesso`,
          failure: `${appUrl}/pagamento/falha`,
          pending: `${appUrl}/pagamento/pendente`,
        },
        auto_return: 'approved',
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
        statement_descriptor: 'VIRTUADOCTOR',
      }),
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('MP API error:', JSON.stringify(mpData))
      return NextResponse.json(
        { success: false, error: mpData?.message || 'Erro ao criar preferência no MP' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: mpData.init_point,        // Produção
      sandboxUrl: mpData.sandbox_init_point,  // Sandbox
      preferenceId: mpData.id,
    })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
