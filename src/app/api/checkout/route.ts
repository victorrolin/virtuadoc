import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { addMinutes, format, parse } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { doctorId, date, time, name, email, phone, cpf, reason, notes, price } = body

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Verificar ou criar paciente no Supabase Auth
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    let patientId = existingUsers.users.find(u => u.email === email)?.id

    if (!patientId) {
      // Criar conta automática para o paciente
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name, role: 'patient' }
      })
      if (createErr) throw new Error(createErr.message)
      patientId = newUser.user.id
      
      // Upsert profile
      await adminClient.from('profiles').upsert({
        id: patientId, full_name: name, role: 'patient', phone
      }, { onConflict: 'id' })
    }

    // 2. Calcular end_time
    const { data: scheduleData } = await adminClient
      .from('doctor_schedules')
      .select('slot_duration_minutes')
      .eq('doctor_id', doctorId)
      .limit(1)
      .maybeSingle()

    const duration = scheduleData?.slot_duration_minutes || 30
    const startParsed = parse(time, 'HH:mm', new Date())
    const endTime = format(addMinutes(startParsed, duration), 'HH:mm:ss')

    // 3. Gerar ID da consulta e link da sala Jitsi
    const roomId = `virtuadoc-${doctorId.slice(0, 8)}-${Date.now()}`
    const meetLink = `https://meet.jit.si/${roomId}`

    // 4. Criar o agendamento
    const { data: appointment, error: apptErr } = await adminClient
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: date,
        start_time: time + ':00',
        end_time: endTime,
        status: 'paid',  // Marcar como pago (integrará com MP depois)
        meeting_link: meetLink,
      })
      .select()
      .single()

    if (apptErr) throw new Error(apptErr.message)

    // 5. TODO: Integrar Mercado Pago real aqui
    // Por ora, simular pagamento aprovado e retornar os dados

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      meetLink,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
