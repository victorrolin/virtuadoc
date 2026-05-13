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
  const supabase = await createClient()

  // 1. In a real scenario, we would save to a 'prescriptions' table
  // For now, let's just log it and simulate success
  console.log('Saving prescription for appointment:', data.appointmentId)
  
  // 2. Here we could generate a PDF and store it in Supabase Storage
  // Or just save the JSON content
  
  // 3. Return a success message and a link for the doctor to share
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
  const medsQuery = encodeURIComponent(JSON.stringify(data.medications))
  const shareLink = `${baseUrl}/prescriptions/${data.appointmentId}?p=${encodeURIComponent(data.patientName)}&d=${encodeURIComponent(data.doctorName)}&m=${medsQuery}&n=${encodeURIComponent(data.notes || '')}`
  
  return { 
    success: true, 
    shareLink,
    whatsappLink: `https://wa.me/?text=${encodeURIComponent(
      `Olá ${data.patientName}, aqui está sua receita digital da consulta com Dr(a). ${data.doctorName}: ${shareLink}`
    )}`
  }
}
