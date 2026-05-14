'use server'

import { createClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email' // We might need a new function in email.ts

export async function saveAndSendPrescription(data: {
  appointmentId: string,
  medications: any[],
  notes: string,
  patientName: string,
  doctorName: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // 1. Salvar no banco de dados para consulta posterior
    let prescriptionId = data.appointmentId
    try {
      const { data: insertedData, error: dbErr } = await supabase
        .from('prescriptions')
        .insert({
          doctor_id: user.id,
          patient_name: data.patientName,
          medications: data.medications,
          notes: data.notes,
          appointment_id: data.appointmentId?.startsWith('manual') ? null : data.appointmentId
        })
        .select('id')
        .single()
      
      if (insertedData) prescriptionId = insertedData.id
      if (dbErr) throw dbErr
    } catch (dbErr) {
      console.error('Erro ao salvar no banco:', dbErr)
    }
    
    // 3. Return a success message and a link for the doctor to share
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
    
    // Empacotar tudo em um objeto e transformar em Base64 para evitar que a URL seja cortada
    const prescriptionData = JSON.stringify({
      p: data.patientName || 'Paciente',
      d: data.doctorName || 'Médico',
      m: data.medications || [],
      n: data.notes || ''
    })
    
    const encodedData = Buffer.from(prescriptionData).toString('base64')
    
    const params = new URLSearchParams()
    params.set('data', encodedData)
    
    const shareLink = `${baseUrl}/prescriptions/${data.appointmentId}?${params.toString()}`
    
    return { 
      success: true, 
      id: prescriptionId,
      shareLink
    }
  } catch (error: any) {
    console.error('Error in saveAndSendPrescription:', error)
    return { success: false, error: error?.message || 'Erro interno na geração da receita.' }
  }
}
