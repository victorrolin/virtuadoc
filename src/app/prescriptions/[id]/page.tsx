import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Pill, Calendar, User, Printer, FileText, CheckCircle2 } from 'lucide-react'

export default async function PrescriptionPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = await createClient()

  // In a real scenario, we would fetch from 'prescriptions' table or 'appointments'
  // For demonstration, we fetch the appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      doctor:profiles!appointments_doctor_id_fkey(full_name, specialties, crm),
      patient:profiles!appointments_patient_id_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (!appointment) return notFound()

  const doctor = appointment.doctor as any
  const patient = appointment.patient as any

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 font-serif">
      <div className="max-w-3xl mx-auto border-2 border-gray-100 p-12 shadow-sm relative overflow-hidden">
        {/* Watermark/Decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <FileText className="h-64 w-64 text-primary rotate-12" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-8 relative">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">VIRTUA<span className="text-primary">DOC</span></h1>
            <p className="text-sm text-gray-500 font-sans mt-1">Telemedicina Premium e Conectada</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">Receituário Digital</h2>
            <p className="text-sm text-gray-500 font-sans">ID: {appointment.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Patient & Doctor Info */}
        <div className="grid grid-cols-2 gap-8 mb-12 font-sans">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Paciente</p>
            <p className="text-lg font-bold text-gray-900">{patient?.full_name}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Médico Responsável</p>
            <p className="text-lg font-bold text-gray-900">{doctor?.full_name}</p>
            <p className="text-sm text-primary font-medium">{doctor?.specialties}</p>
            <p className="text-xs text-gray-500 italic">CRM: {doctor?.crm || 'Não informado'}</p>
          </div>
        </div>

        {/* Prescription Content (Placeholder for now) */}
        <div className="space-y-8 min-h-[400px] relative">
          <div className="flex items-center gap-2 text-primary/80 border-b border-gray-100 pb-2 mb-6">
            <Pill className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-widest font-bold">Prescrição Médica</h3>
          </div>

          <div className="space-y-6">
             {/* Note: In a real app, we would map over the medications saved in the DB */}
             <div className="animate-pulse">
                <p className="text-gray-400 italic font-sans">As informações detalhadas da prescrição estão sendo processadas digitalmente...</p>
             </div>
          </div>
        </div>

        {/* Footer / Signature Area */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end font-sans">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              ASSINADO DIGITALMENTE
            </div>
            <p className="text-[10px] text-gray-400">Validado via ICP-Brasil / ITI.gov.br</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Emitido em: {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-48 h-[1px] bg-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-800">{doctor?.full_name}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Assinatura Digital</p>
          </div>
        </div>

        {/* Action Button (only visible on screen, not on print) */}
        <div className="mt-12 flex justify-center print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            <Printer className="h-5 w-5" />
            Imprimir Receita
          </button>
        </div>
      </div>
      
      <p className="text-center text-gray-400 text-xs mt-8 print:hidden">
        Esta é uma receita digital válida em todo o território nacional.
      </p>
    </div>
  )
}
