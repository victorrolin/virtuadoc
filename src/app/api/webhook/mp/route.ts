import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { addMinutes, format, parse } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    // MP envia diferentes tipos de notificação
    if (type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // 1. Buscar detalhes do pagamento no MP para verificar status
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    })

    const paymentClient = new Payment(mpClient)
    const payment = await paymentClient.get({ id: paymentId })

    // Só processar pagamentos aprovados
    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, status: payment.status })
    }

    // 2. Extrair metadados que passamos na preferência
    const meta = payment.metadata as any
    if (!meta?.doctor_id || !meta?.appointment_date) {
      return NextResponse.json({ ok: true, msg: 'no metadata' })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Verificar ou criar paciente
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    let patientId = existingUsers.users.find(u => u.email === meta.patient_email)?.id

    if (!patientId) {
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
      const { data: newUser } = await adminClient.auth.admin.createUser({
        email: meta.patient_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: meta.patient_name, role: 'patient' }
      })
      patientId = newUser?.user?.id
    }

    if (!patientId) {
      return NextResponse.json({ error: 'Could not get/create patient' }, { status: 500 })
    }

    // Upsert profile do paciente
    await adminClient.from('profiles').upsert({
      id: patientId,
      full_name: meta.patient_name,
      role: 'patient',
      phone: meta.patient_phone,
    }, { onConflict: 'id' })

    // 4. Calcular end_time
    const { data: scheduleData } = await adminClient
      .from('doctor_schedules')
      .select('slot_duration_minutes')
      .eq('doctor_id', meta.doctor_id)
      .limit(1)
      .maybeSingle()

    const duration = scheduleData?.slot_duration_minutes || 30
    const time = meta.appointment_time // ex: "09:00"
    const startParsed = parse(time, 'HH:mm', new Date())
    const endTime = format(addMinutes(startParsed, duration), 'HH:mm:ss')

    // 5. Criar agendamento
    const { error: apptErr } = await adminClient.from('appointments').insert({
      doctor_id: meta.doctor_id,
      patient_id: patientId,
      appointment_date: meta.appointment_date,
      start_time: time + ':00',
      end_time: endTime,
      status: 'paid',
      meeting_link: meta.meet_link,
      payment_id: String(paymentId),
    })

    if (apptErr) {
      console.error('Appointment insert error:', apptErr)
      return NextResponse.json({ error: apptErr.message }, { status: 500 })
    }

    console.log('✅ Appointment created for payment:', paymentId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// MP também faz GET para verificar o endpoint
export async function GET() {
  return NextResponse.json({ ok: true })
}
