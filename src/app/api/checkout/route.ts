import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { doctorId, date, time, name, email, phone, cpf, reason, notes, price, doctorName, specialty } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'

    // 1. Gerar ID único da sala Jitsi (antes do pagamento para incluir no e-mail)
    const roomId = `virtuadoc-${doctorId.slice(0, 8)}-${Date.now()}`
    const meetLink = `https://meet.jit.si/${roomId}`

    // 2. Criar Preferência no Mercado Pago
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(mpClient)
    const prefResult = await preference.create({
      body: {
        items: [
          {
            id: roomId,
            title: `Teleconsulta com ${doctorName || 'Médico'} – ${specialty || 'Consulta Online'}`,
            description: `Data: ${date} às ${time}. Motivo: ${reason || 'Não informado'}`,
            quantity: 1,
            unit_price: parseFloat(price) || 150,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: name.split(' ')[0],
          surname: name.split(' ').slice(1).join(' ') || name,
          email: email,
          phone: { area_code: phone?.replace(/\D/g, '').slice(0, 2) || '11', number: phone?.replace(/\D/g, '').slice(2) || '' },
          identification: { type: 'CPF', number: cpf?.replace(/\D/g, '') || '' },
        },
        back_urls: {
          success: `${appUrl}/pagamento/sucesso`,
          failure: `${appUrl}/pagamento/falha`,
          pending: `${appUrl}/pagamento/pendente`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhook/mp`,
        // Metadados para o webhook processar
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
        expires: false,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: prefResult.init_point, // URL do checkout MP em produção
      sandboxUrl: prefResult.sandbox_init_point, // URL do checkout MP em sandbox
      preferenceId: prefResult.id,
    })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
