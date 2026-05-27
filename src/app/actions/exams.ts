'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveAndSendExam(data: {
  patientName: string,
  patientCpf: string,
  companyName: string,
  role: string,
  examType: string,
  risks: string,
  opinion: string,
  notes: string,
  doctorName: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const examData = {
      isExam: true,
      patientCpf: data.patientCpf,
      companyName: data.companyName,
      role: data.role,
      examType: data.examType,
      risks: data.risks,
      opinion: data.opinion,
      notes: data.notes
    }

    let examId = 'manual-' + Date.now()
    
    try {
      const { data: insertedData, error: dbErr } = await supabase
        .from('prescriptions') // Reusing the table
        .insert({
          doctor_id: user.id,
          patient_name: data.patientName,
          medications: examData, // Storing exam details here
          notes: data.notes,
          appointment_id: null
        })
        .select('id')
        .single()
      
      if (insertedData) examId = insertedData.id
      if (dbErr) throw dbErr
    } catch (dbErr) {
      console.error('Erro ao salvar no banco:', dbErr)
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
    
    return { 
      success: true, 
      id: examId,
      shareLink: `${baseUrl}/exames/${examId}`,
      whatsappLink: `https://wa.me/?text=${encodeURIComponent(
        `Olá ${data.patientName}, aqui está o seu Atestado de Saúde Ocupacional (ASO) emitido por Dr(a). ${data.doctorName}: ${baseUrl}/r/${examId}.pdf`
      )}`
    }
  } catch (error: any) {
    console.error('Error in saveAndSendExam:', error)
    return { success: false, error: error?.message || 'Erro interno na geração do exame.' }
  }
}

export async function getDoctorExams() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    // Buscar "prescrições" onde o campo medications (JSON) contenha { isExam: true }
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrar apenas exames
    const exams = data?.filter((item: any) => {
      try {
        const meds = typeof item.medications === 'string' ? JSON.parse(item.medications) : item.medications
        return meds && meds.isExam === true
      } catch (e) {
        return false
      }
    }) || []

    return { success: true, exams }
  } catch (error: any) {
    console.error('Error fetching doctor exams:', error)
    return { success: false, error: error.message }
  }
}
