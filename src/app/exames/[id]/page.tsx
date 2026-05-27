import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Briefcase, Calendar, User, Printer, FileText, CheckCircle2, Download, Check, XCircle } from 'lucide-react'

import { PrintButton } from '@/components/PrintButton'

export default async function ExamPage({ 
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

    // Buscar dados da tabela prescriptions onde salvamos o ASO
    const { data: dbPrescription } = await supabase
      .from('prescriptions')
      .select('is_signed, signed_file_url, patient_name, medications, notes, created_at, doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialties, crm, avatar_url)')
      .eq('id', id.replace('manual-', ''))
      .maybeSingle()

    if (!dbPrescription) {
      return (
        <div className="p-20 text-center text-gray-900">
          <h1 className="text-xl font-bold">ASO não encontrado</h1>
          <p className="text-gray-500 mt-2">O documento solicitado não existe ou foi removido.</p>
        </div>
      )
    }

    const isSigned = dbPrescription?.is_signed || false
    const signedUrl = dbPrescription?.signed_file_url

    let examData: any = {}
    if (dbPrescription?.medications) {
      try {
        examData = typeof dbPrescription.medications === 'string' ? JSON.parse(dbPrescription.medications) : dbPrescription.medications
      } catch (e) {
        console.error('Erro ao fazer parse dos dados do exame')
      }
    }

    const doctor = { 
      full_name: dbPrescription?.doctor?.full_name || 'Médico Responsável', 
      specialties: dbPrescription?.doctor?.specialties || 'Medicina Ocupacional', 
      crm: dbPrescription?.doctor?.crm || 'Consulte o Assinador',
      signatureUrl: dbPrescription?.doctor?.avatar_url // Simplification: using avatar for now or ideal signature image field
    }
    const patient = { 
      full_name: dbPrescription?.patient_name || 'Paciente',
      cpf: examData.patientCpf || 'Não informado',
      company: examData.companyName || 'Empresa não informada',
      role: examData.role || 'Função não informada'
    }
    const dateStr = dbPrescription.created_at || new Date().toISOString()
    
    const examType = examData.examType || 'Admissional'
    const opinion = examData.opinion || 'Apto'
    const risks = examData.risks || 'Ausência de riscos ocupacionais específicos'
    const notes = examData.notes || dbPrescription.notes || ''

    return (
      <div className="min-h-screen bg-[#f3f4f6] text-gray-900 p-4 sm:p-8 font-serif overflow-x-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: portrait; margin: 10mm; }
            body { background: white !important; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            #exam-card { transform: scale(1) !important; margin: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; }
          }
          @media (max-width: 640px) {
            #exam-wrapper {
              display: flex;
              justify-content: center;
              overflow-x: auto;
              padding-bottom: 20px;
            }
            #exam-card {
              transform: scale(0.45);
              transform-origin: top center;
              min-width: 800px;
              margin-bottom: -550px;
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
                <p className="font-bold text-lg leading-tight">BAIXAR ASO ASSINADO</p>
                <p className="text-green-100 text-xs">Documento validado via GOV.BR / ICP-Brasil</p>
              </div>
              <Download className="h-6 w-6 ml-auto opacity-50" />
            </a>
          </div>
        )}

        <div id="exam-wrapper">
          <div id="exam-card" className="max-w-3xl w-full mx-auto border-2 border-secondary/20 p-8 sm:p-12 shadow-2xl relative overflow-hidden bg-white min-h-[1050px] flex flex-col justify-between">
            <div>
              {/* Premium Background / Watermark */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
                <Briefcase className="h-[500px] w-[500px] text-secondary" />
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-[3px] border-secondary pb-6 mb-8 relative gap-4">
                <div className="text-center sm:text-left flex items-center gap-3">
                  <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                     <Briefcase className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">VIRTUA<span className="text-secondary">DOC</span></h1>
                    <p className="text-xs text-gray-500 font-sans mt-0.5 uppercase tracking-widest font-bold">Medicina do Trabalho</p>
                  </div>
                </div>
                <div className="text-center sm:text-right font-sans">
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Atestado de Saúde Ocupacional</h2>
                  <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">ASO - {examType}</p>
                </div>
              </div>

              {/* Patient & Doctor */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8 mb-10 font-sans bg-gray-50 p-6 rounded-xl border border-gray-100 relative z-10">
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-secondary mb-1">Dados do Trabalhador</p>
                    <p className="text-lg font-bold text-gray-900">{patient.full_name}</p>
                    <p className="text-xs text-gray-500 mt-1"><span className="font-semibold text-gray-700">CPF:</span> {patient.cpf}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Empresa</p>
                      <p className="text-sm font-semibold text-gray-800">{patient.company}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Função</p>
                      <p className="text-sm font-semibold text-gray-800">{patient.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-center sm:text-right flex flex-col items-center sm:items-end justify-center">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-secondary mb-1">Médico Examinador / Coordenador</p>
                  <p className="text-lg font-bold text-gray-900">{doctor.full_name}</p>
                  <p className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider mt-1">{doctor.specialties}</p>
                  <p className="text-xs text-gray-500 mt-1"><span className="font-semibold text-gray-700">CRM:</span> {doctor.crm}</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-10 relative z-10">
                
                {/* Riscos Ocupacionais */}
                <div>
                  <div className="flex items-center gap-2 text-secondary border-b-2 border-gray-100 pb-2 mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-gray-800">Riscos Ocupacionais Avaliados</h3>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-700 font-sans leading-relaxed whitespace-pre-wrap">{risks}</p>
                  </div>
                </div>

                {/* Exames Realizados */}
                <div>
                  <div className="flex items-center gap-2 text-secondary border-b-2 border-gray-100 pb-2 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-gray-800">Exames Complementares Realizados</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-sans">
                    <Check className="h-4 w-4 text-green-500" /> Exame Clínico Ocupacional
                  </div>
                  <div className="mt-2 text-xs text-gray-500 font-sans italic">
                    Conforme estipulado no Programa de Controle Médico de Saúde Ocupacional (PCMSO).
                  </div>
                </div>

                {/* Parecer Médico */}
                <div className="mt-12 bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center relative shadow-sm">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4">
                    <h3 className="text-xs uppercase tracking-widest font-black text-gray-400">Conclusão / Parecer Médico</h3>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {opinion === 'Apto' ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <span className="text-3xl font-black text-green-600 uppercase tracking-widest border-b-4 border-green-600">APTO PARA A FUNÇÃO</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <span className="text-3xl font-black text-red-600 uppercase tracking-widest border-b-4 border-red-600">INAPTO PARA A FUNÇÃO</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 font-sans font-medium uppercase mt-2 max-w-md">
                      Declaro que o trabalhador acima qualificado foi submetido a exame médico ocupacional e considerado 
                      <strong className={opinion === 'Apto' ? 'text-green-600 mx-1' : 'text-red-600 mx-1'}>{opinion.toUpperCase()}</strong> 
                      para exercer as atividades de sua função.
                    </p>
                  </div>
                </div>

                 {notes && (
                   <div className="mt-8">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Observações / Orientações Adicionais</p>
                      <p className="text-sm text-gray-600 font-sans leading-relaxed whitespace-pre-wrap">{notes}</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Footer with Digital Signature & Stamp Area */}
            <div className="mt-auto pt-16 font-sans relative" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              
              <div className="flex justify-between items-end border-t-2 border-gray-200 pt-6">
                <div className="space-y-2 text-left w-1/2">
                  <div className="flex items-center gap-2 text-green-600 text-[10px] sm:text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    DOCUMENTO DIGITAL
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Data de Emissão: {new Date(dateStr).toLocaleDateString('pt-BR')}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-2 max-w-[250px]">
                    Atestado de Saúde Ocupacional emitido em conformidade com a NR-07 do Ministério do Trabalho e Emprego.
                  </p>
                </div>
                
                <div className="flex flex-col items-center w-1/2 relative">
                  {/* Local da Assinatura / Carimbo */}
                  <div className="h-24 flex items-end justify-center w-full relative mb-2">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                      <div className="w-24 h-24 border-4 border-dashed border-gray-900 rounded-full flex items-center justify-center rotate-12">
                         <span className="text-xs font-black tracking-widest uppercase text-center leading-tight">Carimbo<br/>Aqui</span>
                      </div>
                    </div>
                    {/* Linha de assinatura que cruza o nome */}
                    <div className="w-3/4 sm:w-48 h-[1px] bg-gray-800 z-10 relative">
                       <span className="absolute -top-4 right-0 text-[8px] text-gray-400 uppercase tracking-widest bg-white px-1">Assinatura</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs font-black text-gray-900 z-10">{doctor.full_name}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-600 uppercase font-bold mt-0.5 z-10 bg-gray-100 px-2 py-0.5 rounded">Médico do Trabalho</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-0.5 z-10">CRM: {doctor.crm}</p>
                </div>
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
              <div className="h-16 w-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xl font-bold uppercase tracking-widest">Iniciando Download...</p>
              <p className="text-gray-400 text-sm mt-2">O ASO está sendo preparado.</p>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <script dangerouslySetInnerHTML={{ __html: `
              function runPDF() {
                if (typeof html2pdf === 'undefined') {
                  setTimeout(runPDF, 300);
                  return;
                }
                const element = document.getElementById('exam-card');
                html2pdf().from(element).set({
                  margin: 10,
                  filename: 'ASO_Ocupacional.pdf',
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
          Atestado de Saúde Ocupacional gerado por VirtuaDoc. Válido em todo o território nacional.
        </p>
      </div>
    )
  } catch (err) {
    console.error('Critical render error:', err)
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold">Erro ao carregar ASO</h1>
        <p className="text-gray-500 mt-2">Documento inválido ou não encontrado.</p>
      </div>
    )
  }
}
