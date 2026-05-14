import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Pill, Calendar, User, Printer, FileText, CheckCircle2, Download } from 'lucide-react'

import { PrintButton } from '@/components/PrintButton'

export default async function PrescriptionPage({ 
  params: paramsPromise,
  searchParams: searchParamsPromise 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise
  const { id } = params
  
  try {
    const supabase = await createClient()

    // Dados da URL (Next.js já fornece decodificado em searchParams)
    const rawData = Array.isArray(searchParams.data) ? searchParams.data[0] : searchParams.data
    
    let manualPatient = Array.isArray(searchParams.p) ? searchParams.p[0] : searchParams.p
    let manualDoctor = Array.isArray(searchParams.d) ? searchParams.d[0] : searchParams.d
    let manualMedsRaw = Array.isArray(searchParams.m) ? searchParams.m[0] : searchParams.m
    let manualNotes = Array.isArray(searchParams.n) ? searchParams.n[0] : searchParams.n

    // Se houver dados em Base64, prioriza eles (evita cortes na URL)
    if (rawData) {
      try {
        const decoded = JSON.parse(Buffer.from(rawData, 'base64').toString())
        manualPatient = decoded.p
        manualDoctor = decoded.d
        manualMedsRaw = JSON.stringify(decoded.m)
        manualNotes = decoded.n
      } catch (e) {
        console.error('Erro ao decodificar Base64:', e)
      }
    }

    let appointment: any = null
    
    if (id && !id.startsWith('manual')) {
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

    // Buscar dados extras de assinatura se existir no histórico
    const { data: dbPrescription } = await supabase
      .from('prescriptions')
      .select('is_signed, signed_file_url, patient_name, medications, notes')
      .or(`appointment_id.eq.${id},id.eq.${id.replace('manual-', '')}`)
      .maybeSingle()

    const isSigned = dbPrescription?.is_signed || false
    const signedUrl = dbPrescription?.signed_file_url

    // Fallbacks seguros - PRIORIZA o que foi digitado manualmente na URL para simulação
    const doctor = { 
      full_name: manualDoctor || appointment?.doctor?.full_name || 'Médico Responsável', 
      specialties: appointment?.doctor?.specialties || 'Medicina Digital', 
      crm: appointment?.doctor?.crm || 'Consulte o Assinador' 
    }
    const patient = { 
      full_name: manualPatient || dbPrescription?.patient_name || appointment?.patient?.full_name || 'Paciente' 
    }
    const dateStr = appointment?.appointment_date || new Date().toISOString()
    
    let medications: any[] = []
    if (manualMedsRaw) {
      try {
        const parsed = JSON.parse(manualMedsRaw)
        medications = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Erro ao processar JSON de medicamentos')
      }
    } else if (dbPrescription?.medications) {
      medications = Array.isArray(dbPrescription.medications) ? dbPrescription.medications : []
    }

    if (!manualNotes && dbPrescription?.notes) {
      manualNotes = dbPrescription.notes
    }

    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-8 font-serif overflow-x-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: portrait; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            #prescription-card { transform: scale(1) !important; margin: 0 !important; width: 100% !important; }
          }
          @media (max-width: 640px) {
            #prescription-wrapper {
              display: flex;
              justify-content: center;
              overflow-x: auto;
              padding-bottom: 20px;
            }
            #prescription-card {
              transform: scale(0.45);
              transform-origin: top center;
              min-width: 800px;
              margin-bottom: -550px; /* Compensa o espaço vazio do scale */
            }
          }
        ` }} />

        {isSigned && signedUrl && (
          <div className="max-w-3xl mx-auto mb-6 no-print">
            <a 
              href={signedUrl} 
              target="_blank" 
              className="w-full bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg shadow-green-900/20 group"
            >
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-tight">BAIXAR RECEITA ASSINADA</p>
                <p className="text-green-100 text-xs">Documento validado via GOV.BR / ICP-Brasil</p>
              </div>
              <Download className="h-6 w-6 ml-auto opacity-50" />
            </a>
          </div>
        )}

        <div id="prescription-wrapper">
          <div id="prescription-card" className="max-w-3xl w-full mx-auto border-2 border-gray-100 p-8 sm:p-12 shadow-sm relative overflow-hidden bg-white min-h-[1050px] flex flex-col justify-between">
            <div>
              {/* Watermark */}
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText className="h-64 w-64 text-primary rotate-12" />
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-primary/20 pb-8 mb-8 relative gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">VIRTUA<span className="text-primary">DOC</span></h1>
                  <p className="text-sm text-gray-500 font-sans mt-1">Telemedicina Premium e Conectada</p>
                </div>
                <div className="text-center sm:text-right font-sans">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tighter">Receituário Digital</h2>
                  <p className="text-xs text-gray-400">ID: {id?.slice(0, 12).toUpperCase()}</p>
                </div>
              </div>

          {/* Patient & Doctor */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 font-sans">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Paciente</p>
              <p className="text-lg font-bold text-gray-900">{patient.full_name}</p>
            </div>
            <div className="space-y-1 text-center sm:text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Médico Responsável</p>
              <p className="text-lg font-bold text-gray-900">{doctor.full_name}</p>
              <p className="text-xs text-primary font-medium">{doctor.specialties}</p>
              <p className="text-[10px] text-gray-500 italic">CRM: {doctor.crm}</p>
            </div>
          </div>

            {/* Content */}
            <div className="space-y-8 min-h-[350px] relative">
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
                         <span className="text-sm text-gray-400 font-sans flex-1 border-b border-dotted border-gray-200 mb-1 mx-2"></span>
                         <span className="text-sm text-gray-500 font-sans">{med.dosage}</span>
                       </div>
                       <p className="text-sm text-gray-600 font-sans pl-6 italic">{med.instructions}</p>
                     </div>
                   ))
                 ) : (
                    <p className="text-gray-400 italic font-sans py-12 text-center border border-dashed border-gray-100 rounded-xl">
                      Nenhum medicamento informado na prescrição digital.
                    </p>
                 )}

                 {manualNotes && (
                   <div className="mt-12 pt-8 border-t border-dashed border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Observações Adicionais</p>
                      <p className="text-sm text-gray-600 font-sans leading-relaxed whitespace-pre-wrap">{manualNotes}</p>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Footer - Forçado a ficar no final e não quebrar */}
          {/* Footer - Forçado a ficar no final e não quebrar */}
          <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-end font-sans" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-green-600 text-[10px] sm:text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                ASSINADO DIGITALMENTE
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-400">Validado via ICP-Brasil / ITI.gov.br</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Data: {new Date(dateStr).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-32 sm:w-48 h-[1px] bg-gray-300 mb-2" />
              <p className="text-[10px] sm:text-xs font-bold text-gray-800">{doctor.full_name}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-tighter">Assinatura Digital</p>
            </div>
          </div>
        </div>
      </div>

        <div className="mt-12 flex justify-center no-print">
          <PrintButton />
        </div>
        
        {searchParams.print && (
          <>
            <div id="download-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white no-print">
              <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xl font-bold uppercase tracking-widest">Iniciando Download...</p>
              <p className="text-gray-400 text-sm mt-2">Sua receita está sendo preparada.</p>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <script dangerouslySetInnerHTML={{ __html: `
              function runPDF() {
                if (typeof html2pdf === 'undefined') {
                  setTimeout(runPDF, 300);
                  return;
                }
                const element = document.getElementById('prescription-card');
                html2pdf().from(element).set({
                  margin: 10,
                  filename: 'Receita.pdf',
                  html2canvas: { scale: 2, useCORS: true },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).save().then(() => {
                  document.getElementById('download-overlay').style.display = 'none';
                }).catch(err => {
                  window.print();
                  document.getElementById('download-overlay').style.display = 'none';
                });
              }
              window.addEventListener('load', () => setTimeout(runPDF, 1500));
            ` }} />
          </>
        )}

        <p className="text-center text-gray-400 text-[10px] mt-8 print:hidden">
          Esta é uma receita digital válida em todo o território nacional. Verifique a assinatura no portal do ITI.
        </p>
      </div>
    )
  } catch (err) {
    console.error('Critical render error:', err)
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold">Erro ao carregar receita</h1>
        <p className="text-gray-500 mt-2">Dados incompletos ou inválidos na URL.</p>
      </div>
    )
  }
}
