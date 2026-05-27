'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveAndSendExam(data: {
  appointmentId: string,
  examType: 'admissional' | 'demissional',
  patientName: string,
  patientCpf: string,
  companyName: string,
  role: string,
  risks: string[],
  opinion: 'apto' | 'inapto',
  notes: string,
  doctorName: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Estruturar dados do exame no formato de medicamentos para a coluna JSONB
    const examPayload = {
      type: 'exam',
      examType: data.examType,
      patientCpf: data.patientCpf,
      companyName: data.companyName,
      role: data.role,
      risks: data.risks,
      opinion: data.opinion
    }

    let examId = data.appointmentId
    try {
      const { data: insertedData, error: dbErr } = await supabase
        .from('prescriptions')
        .insert({
          doctor_id: user.id,
          patient_name: data.patientName,
          medications: examPayload,
          notes: data.notes,
          appointment_id: data.appointmentId?.startsWith('manual') ? null : data.appointmentId
        })
        .select('id')
        .single()
      
      if (insertedData) examId = insertedData.id
      if (dbErr) throw dbErr
    } catch (dbErr) {
      console.error('Erro ao salvar exame no banco:', dbErr)
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
    
    // Empacotar os dados em Base64 para visualização segura na URL
    const examData = JSON.stringify({
      p: data.patientName || 'Paciente',
      d: data.doctorName || 'Médico',
      et: data.examType,
      cpf: data.patientCpf,
      cn: data.companyName,
      r: data.role,
      rk: data.risks,
      o: data.opinion,
      n: data.notes || ''
    })
    
    const encodedData = Buffer.from(examData).toString('base64')
    const params = new URLSearchParams()
    params.set('data', encodedData)
    
    const shareLink = `${baseUrl}/exams/${data.appointmentId}?${params.toString()}`
    
    return { 
      success: true, 
      id: examId,
      shareLink,
      whatsappLink: `https://wa.me/?text=${encodeURIComponent(
        `Olá ${data.patientName}, aqui está seu Exame Ocupacional (${data.examType === 'admissional' ? 'Admissional' : 'Demissional'}) digital da consulta com Dr(a). ${data.doctorName}: ${baseUrl}/r/${examId}.pdf`
      )}`
    }
  } catch (error: any) {
    console.error('Error in saveAndSendExam:', error)
    return { success: false, error: error?.message || 'Erro interno na geração do exame.' }
  }
}

export async function getExamHistory() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrar apenas registros que são exames ocupacionais
    const exams = (data || []).filter((p: any) => {
      return p.medications && !Array.isArray(p.medications) && p.medications.type === 'exam'
    })

    return { success: true, exams }
  } catch (error: any) {
    console.error('Error fetching exam history:', error)
    return { success: false, error: error.message }
  }
}
