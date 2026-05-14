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
    // 1. In a real scenario, we would save to a 'prescriptions' table
    // For now, let's just log it and simulate success
    console.log('Generating prescription link for:', data.patientName)
    
    // 2. Here we could generate a PDF and store it in Supabase Storage
    // Or just save the JSON content
    
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
      shareLink,
      whatsappLink: `https://wa.me/?text=${encodeURIComponent(
        `Olá ${data.patientName}, aqui está sua receita digital da consulta com Dr(a). ${data.doctorName}: ${shareLink}`
      )}`
    }
  } catch (error: any) {
    console.error('Error in saveAndSendPrescription:', error)
    return { success: false, error: error?.message || 'Erro interno na geração da receita.' }
  }
}
