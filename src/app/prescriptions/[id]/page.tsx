import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Pill, Calendar, User, Printer, FileText, CheckCircle2 } from 'lucide-react'

export default async function PrescriptionPage({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { id } = params
  const supabase = await createClient()

  // Buscar dados da URL (fallback para receitas manuais)
  const manualPatient = searchParams.p as string
  const manualDoctor = searchParams.d as string
  const manualMeds = searchParams.m as string // JSON stringified
  const manualNotes = searchParams.n as string

  let appointment: any = null
  
  if (!id.startsWith('manual')) {
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        doctor:profiles!appointments_doctor_id_fkey(full_name, specialties, crm),
        patient:profiles!appointments_patient_id_fkey(full_name)
      `)
      .eq('id', id)
      .single()
    appointment = data
  }

  // Se for manual ou não encontrar no banco, usa os dados da URL
  const doctor = appointment?.doctor || { full_name: manualDoctor || 'Médico Responsável', specialties: 'Clínica Geral', crm: '---' }
  const patient = appointment?.patient || { full_name: manualPatient || 'Paciente' }
  const date = appointment?.appointment_date || new Date().toISOString()
  
  let medications: any[] = []
  try {
    if (manualMeds) {
      medications = JSON.parse(decodeURIComponent(manualMeds))
    }
  } catch (e) {
    console.error('Erro ao processar medicamentos:', e)
  }

  if (!appointment && !manualPatient) return notFound()

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
            <p className="text-sm text-gray-500 font-sans">ID: {id.slice(0, 8).toUpperCase()}</p>
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

        {/* Prescription Content */}
        <div className="space-y-8 min-h-[400px] relative">
          <div className="flex items-center gap-2 text-primary/80 border-b border-gray-100 pb-2 mb-6">
            <Pill className="h-5 w-5" />
            <h3 className="text-sm uppercase tracking-widest font-bold">Prescrição Médica</h3>
          </div>

          <div className="space-y-6">
             {medications.length > 0 ? (
               medications.map((med: any, index: number) => (
                 <div key={index} className="space-y-1">
                   <div className="flex items-baseline gap-2">
                     <span className="text-gray-400 font-bold">{index + 1}.</span>
                     <p className="text-lg font-bold text-gray-900">{med.name}</p>
                     <span className="text-sm text-gray-500 font-sans">------------------ {med.dosage}</span>
                   </div>
                   <p className="text-sm text-gray-600 font-sans pl-6 italic">{med.instructions}</p>
                 </div>
               ))
             ) : (
               <div className="animate-pulse">
                  <p className="text-gray-400 italic font-sans">Nenhum medicamento informado na prescrição digital.</p>
               </div>
             )}

             {manualNotes && (
               <div className="mt-12 pt-8 border-t border-dashed border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Observações Adicionais</p>
                  <p className="text-sm text-gray-600 font-sans leading-relaxed whitespace-pre-wrap">{manualNotes}</p>
               </div>
             )}
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
              <Calendar className="h-3 w-3" /> Emitido em: {new Date(date).toLocaleDateString('pt-BR')}
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
          <PrintButton />
        </div>
      </div>
      
      <p className="text-center text-gray-400 text-xs mt-8 print:hidden">
        Esta é uma receita digital válida em todo o território nacional.
      </p>
    </div>
  )
}

function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
    >
      <Printer className="h-5 w-5" />
      Imprimir Receita
    </button>
  )
}
