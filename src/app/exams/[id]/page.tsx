import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ClipboardList, Calendar, User, Printer, FileText, CheckCircle2, Download, AlertTriangle, Building2, Briefcase, FileSignature } from 'lucide-react'

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

    // Decodificar dados passados via URL
    const rawData = Array.isArray(searchParams.data) ? searchParams.data[0] : searchParams.data
    
    let manualPatient = Array.isArray(searchParams.p) ? searchParams.p[0] : searchParams.p
    let manualDoctor = Array.isArray(searchParams.d) ? searchParams.d[0] : searchParams.d
    let manualExamType = Array.isArray(searchParams.et) ? searchParams.et[0] : searchParams.et
    let manualPatientCpf = Array.isArray(searchParams.cpf) ? searchParams.cpf[0] : searchParams.cpf
    let manualCompanyName = Array.isArray(searchParams.cn) ? searchParams.cn[0] : searchParams.cn
    let manualRole = Array.isArray(searchParams.r) ? searchParams.r[0] : searchParams.r
    let manualRisksRaw = Array.isArray(searchParams.rk) ? searchParams.rk[0] : searchParams.rk
    let manualOpinion = Array.isArray(searchParams.o) ? searchParams.o[0] : searchParams.o
    let manualNotes = Array.isArray(searchParams.n) ? searchParams.n[0] : searchParams.n

    // Se houver dados em Base64, decodifica-os (evita cortes nas URLs)
    if (rawData) {
      try {
        const decoded = JSON.parse(Buffer.from(rawData, 'base64').toString())
        manualPatient = decoded.p
        manualDoctor = decoded.d
        manualExamType = decoded.et
        manualPatientCpf = decoded.cpf
        manualCompanyName = decoded.cn
        manualRole = decoded.r
        manualRisksRaw = decoded.rk
        manualOpinion = decoded.o
        manualNotes = decoded.n
      } catch (e) {
        console.error('Erro ao decodificar Base64 do Exame:', e)
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

    // Buscar dados do banco na tabela de 'prescriptions' (onde salvamos o exame)
    const { data: dbPrescription } = await supabase
      .from('prescriptions')
      .select('is_signed, signed_file_url, patient_name, medications, notes, created_at')
      .or(`appointment_id.eq.${id},id.eq.${id.replace('manual-', '')}`)
      .maybeSingle()

    const isSigned = dbPrescription?.is_signed || false
    const signedUrl = dbPrescription?.signed_file_url
    
    // Processar o payload flexível se houver registro no banco
    const dbExam = dbPrescription?.medications && !Array.isArray(dbPrescription.medications) && dbPrescription.medications.type === 'exam' 
      ? dbPrescription.medications 
      : null

    // Fallbacks
    const doctor = { 
      full_name: manualDoctor || appointment?.doctor?.full_name || 'Dr(a). Médico Responsável', 
      specialties: appointment?.doctor?.specialties || 'Medicina do Trabalho', 
      crm: appointment?.doctor?.crm || 'Consulte o Assinador' 
    }
    
    const patient = { 
      full_name: manualPatient || dbPrescription?.patient_name || appointment?.patient?.full_name || 'Paciente',
      cpf: manualPatientCpf || dbExam?.patientCpf || '000.000.000-00'
    }
    
    const companyName = manualCompanyName || dbExam?.companyName || 'Empresa Empregadora Não Informada'
    const role = manualRole || dbExam?.role || 'Cargo Não Informado'
    const examType = manualExamType || dbExam?.examType || 'admissional'
    const opinion = manualOpinion || dbExam?.opinion || 'apto'
    const dateStr = dbPrescription?.created_at || appointment?.appointment_date || new Date().toISOString()
    
    let risks: string[] = ['Ausência de Riscos']
    if (manualRisksRaw) {
      if (Array.isArray(manualRisksRaw)) {
        risks = manualRisksRaw
      } else {
        try {
          risks = JSON.parse(manualRisksRaw)
        } catch {
          risks = [manualRisksRaw]
        }
      }
    } else if (dbExam?.risks) {
      risks = dbExam.risks
    }

    if (!manualNotes && dbPrescription?.notes) {
      manualNotes = dbPrescription.notes
    }

    return (
      <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-8 font-serif overflow-x-hidden">
        {/* Carregar a fonte da assinatura visual e estilos */}
        <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: portrait; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            #aso-card { transform: scale(1) !important; margin: 0 !important; width: 100% !important; border: none !important; shadow: none !important; }
          }
          @media (max-width: 640px) {
            #aso-wrapper {
              display: flex;
              justify-content: center;
              overflow-x: auto;
              padding-bottom: 20px;
            }
            #aso-card {
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
                <p className="font-bold text-lg leading-tight text-white">BAIXAR ASO ASSINADO</p>
                <p className="text-green-100 text-xs">Atestado validado via GOV.BR / ICP-Brasil</p>
              </div>
              <Download className="h-6 w-6 ml-auto opacity-50" />
            </a>
          </div>
        )}

        <div id="aso-wrapper">
          <div id="aso-card" className="max-w-3xl w-full mx-auto border-2 border-gray-100 p-8 sm:p-12 shadow-sm relative overflow-hidden bg-white min-h-[1050px] flex flex-col justify-between">
            <div>
              {/* Watermark */}
              <div className="absolute top-1/3 left-1/3 p-4 opacity-[0.02] pointer-events-none select-none">
                <ClipboardList className="h-96 w-96 text-primary rotate-12" />
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-primary/20 pb-6 mb-8 relative gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">VIRTUA<span className="text-primary">DOC</span></h1>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Serviço Integrado de Telemedicina Ocupacional</p>
                </div>
                <div className="text-center sm:text-right font-sans">
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Atestado de Saúde Ocupacional</h2>
                  <p className="text-xs text-gray-400">ASO DIGITAL | ID: {id?.slice(0, 12).toUpperCase()}</p>
                </div>
              </div>

              {/* Título Principal */}
              <div className="text-center my-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800 border-b border-gray-200 pb-2 w-fit mx-auto">
                  Exame Médico {examType === 'admissional' ? 'Admissional' : 'Demissional'}
                </h2>
              </div>

              {/* Quadros de Dados */}
              <div className="space-y-6 font-sans">
                {/* Dados da Empresa */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-200/50 pb-1">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Identificação da Empresa Empregadora
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Razão Social / Nome Fantasia</p>
                      <p className="text-sm font-bold text-gray-800">{companyName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Classificação</p>
                      <p className="text-sm font-bold text-gray-800">Serviços Laborais Terceirizados / Geral</p>
                    </div>
                  </div>
                </div>

                {/* Dados do Trabalhador */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-200/50 pb-1">
                    <User className="h-3.5 w-3.5 text-primary" /> Identificação do Trabalhador
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1.5">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Nome do Funcionário</p>
                      <p className="text-sm font-bold text-gray-800">{patient.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">CPF do Trabalhador</p>
                      <p className="text-sm font-bold text-gray-800">{patient.cpf}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Cargo / Função</p>
                      <p className="text-sm font-bold text-gray-800">{role}</p>
                    </div>
                  </div>
                </div>

                {/* Riscos Ocupacionais */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-200/50 pb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" /> Riscos Ocupacionais Específicos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {risks.map((risk, index) => (
                      <span 
                        key={index}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          risk === 'Ausência de Riscos'
                            ? 'bg-green-500/10 text-green-700 border-green-200'
                            : 'bg-yellow-500/10 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parecer Clínico */}
                <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">Parecer Médico de Aptidão</span>
                  </div>
                  
                  {opinion === 'apto' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-200">
                        <CheckCircle2 className="h-10 w-10 text-green-600 animate-pulse" />
                      </div>
                      <div className="text-3xl font-black text-green-600 uppercase tracking-widest">
                        APTO
                      </div>
                      <p className="text-xs text-gray-500 max-w-md">
                        O trabalhador em questão foi submetido a exame clínico completo e encontra-se com aptidão física e mental para exercer a função proposta/atual.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-200">
                        <AlertTriangle className="h-10 w-10 text-red-600 animate-pulse" />
                      </div>
                      <div className="text-3xl font-black text-red-600 uppercase tracking-widest">
                        INAPTO
                      </div>
                      <p className="text-xs text-gray-500 max-w-md">
                        O trabalhador apresenta contraindicações físicas/clínicas temporárias ou permanentes para o exercício seguro da função avaliada.
                      </p>
                    </div>
                  )}
                </div>

                {/* Notas Clínicas */}
                {manualNotes && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Parecer Técnico e Exames Complementares</p>
                    <p className="text-sm text-gray-600 font-sans leading-relaxed whitespace-pre-wrap">{manualNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer com o Carimbo e a Assinatura */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-2 font-sans" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-green-600 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  ASO EMITIDO VIA TELEMEDICINA
                </div>
                <p className="text-[9px] text-gray-400">Validação legal baseada no parecer CFM 04/2020 e Portaria MTP 671</p>
                <p className="text-[9px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="h-3 w-3" /> Data de Emissão: {new Date(dateStr).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {/* Box de Assinatura Limpo e Profissional para Gov.br */}
              <div className="flex flex-col items-center">
                <div className="w-48 sm:w-64 h-[1px] bg-gray-300 mb-2" />
                <p className="text-[11px] sm:text-xs font-bold text-gray-800">{doctor.full_name}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-tighter">Médico Responsável / CRM: {doctor.crm}</p>
                <p className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-widest">{doctor.specialties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Impressão */}
        <div className="mt-12 flex justify-center no-print">
          <PrintButton />
        </div>
        
        {/* Script de Download PDF Automático */}
        {searchParams.print && (
          <>
            <div id="download-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white no-print">
              <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xl font-bold uppercase tracking-widest text-primary">Iniciando Download do ASO...</p>
              <p className="text-gray-400 text-sm mt-2">Seu atestado médico ocupacional está sendo formatado.</p>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <script dangerouslySetInnerHTML={{ __html: `
              function runPDF() {
                if (typeof html2pdf === 'undefined') {
                  setTimeout(runPDF, 300);
                  return;
                }
                const element = document.getElementById('aso-card');
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
          Este é um Atestado de Saúde Ocupacional digital válido em todo o território nacional. Verifique a assinatura no portal do ITI.
        </p>
      </div>
    )
  } catch (err) {
    console.error('Critical render error in ASO:', err)
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold">Erro ao carregar Exame Ocupacional</h1>
        <p className="text-gray-500 mt-2">Dados incompletos ou inválidos na URL.</p>
      </div>
    )
  }
}
