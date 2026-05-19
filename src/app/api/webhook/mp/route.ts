import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendConfirmationEmail, sendDoctorNotificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Buscar detalhes do pagamento via REST
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
    })
    const payment = await mpRes.json()

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, status: payment.status })
    }

    const meta = payment.metadata as any
    if (!meta?.doctor_id || !meta?.appointment_date) {
      return NextResponse.json({ ok: true, msg: 'no metadata' })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verificar ou criar paciente
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

    if (!patientId) return NextResponse.json({ error: 'No patient' }, { status: 500 })

    await adminClient.from('profiles').upsert({
      id: patientId, full_name: meta.patient_name, role: 'patient', phone: meta.patient_phone
    }, { onConflict: 'id' })

    // Calcular end_time
    const { data: scheduleData } = await adminClient
      .from('doctor_schedules').select('slot_duration_minutes')
      .eq('doctor_id', meta.doctor_id).limit(1).maybeSingle()

    const duration = scheduleData?.slot_duration_minutes || 30
    const [h, m] = meta.appointment_time.split(':').map(Number)
    const endDate = new Date(2000, 0, 1, h, m + duration)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`

    // ── Idempotência: evitar consultas duplicadas ──────────────────────────
    // O Mercado Pago pode disparar o webhook mais de uma vez para o mesmo pagamento.
    // Verificamos se já existe um appointment com esse payment_id antes de inserir.
    const { data: existingAppointment } = await adminClient
      .from('appointments')
      .select('id')
      .eq('payment_id', String(paymentId))
      .maybeSingle()

    if (existingAppointment) {
      console.log(`[Webhook MP] Pagamento ${paymentId} já processado — ignorando duplicata.`)
      return NextResponse.json({ ok: true, msg: 'already_processed' })
    }
    // ──────────────────────────────────────────────────────────────────────

    await adminClient.from('appointments').insert({
      doctor_id: meta.doctor_id,
      patient_id: patientId,
      appointment_date: meta.appointment_date,
      start_time: meta.appointment_time + ':00',
      end_time: endTime,
      status: 'paid',
      meeting_link: meta.meet_link,
      payment_id: String(paymentId),
      reason: meta.reason || null,
      notes: meta.notes || null,
    })

    // Buscar nome e email do médico
    const { data: doctorProfile } = await adminClient
      .from('profiles')
      .select('full_name, specialties')
      .eq('id', meta.doctor_id)
      .single()

    // Buscar email do médico no Auth
    const { data: doctorAuth } = await adminClient.auth.admin.getUserById(meta.doctor_id)
    const doctorEmail = doctorAuth?.user?.email

    // Enviar e-mail de confirmação para o paciente
    await sendConfirmationEmail({
      to: meta.patient_email,
      patientName: meta.patient_name,
      doctorName: doctorProfile?.full_name || 'Médico',
      specialty: doctorProfile?.specialties || 'Consulta Online',
      date: meta.appointment_date,
      time: meta.appointment_time,
      meetLink: meta.meet_link,
    })

    // Enviar notificação para o médico
    if (doctorEmail) {
      await sendDoctorNotificationEmail({
        to: doctorEmail,
        doctorName: doctorProfile?.full_name || 'Médico',
        patientName: meta.patient_name,
        patientPhone: meta.patient_phone || '',
        date: meta.appointment_date,
        time: meta.appointment_time,
        meetLink: meta.meet_link,
        reason: meta.reason,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
