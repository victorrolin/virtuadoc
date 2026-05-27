'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Send, X, Download, ShieldCheck, FileUp, Check, Loader2, CheckCircle2, ClipboardList, Briefcase, Building2, User, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveAndSendExam } from '@/app/actions/exams'
import { uploadSignedPrescription } from '@/app/actions/uploadPrescription'
import { useToast } from '@/components/Toast'

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId?: string
  patientName: string
  doctorName: string
}

export function ExamModal({ isOpen, onClose, appointmentId, patientName: initialPatientName, doctorName }: ExamModalProps) {
  const { toast } = useToast()
  
  // Form fields
  const [patientName, setPatientName] = useState(initialPatientName || '')
  const [patientCpf, setPatientCpf] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [examType, setExamType] = useState<'admissional' | 'demissional'>('admissional')
  const [risks, setRisks] = useState<string[]>(['Ausência de Riscos'])
  const [opinion, setOpinion] = useState<'apto' | 'inapto'>('apto')
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Execution states
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ id: string, shareLink: string, whatsappLink: string } | null>(null)
  const [isSigned, setIsSigned] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName)
  }, [initialPatientName])

  // CPF formatter helper
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // remove all non-digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14)
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientCpf(formatCPF(e.target.value))
  }

  // Handle Risks toggle
  const toggleRisk = (risk: string) => {
    if (risk === 'Ausência de Riscos') {
      setRisks(['Ausência de Riscos'])
      return
    }

    let updatedRisks = risks.filter(r => r !== 'Ausência de Riscos')
    if (updatedRisks.includes(risk)) {
      updatedRisks = updatedRisks.filter(r => r !== risk)
      if (updatedRisks.length === 0) {
        updatedRisks = ['Ausência de Riscos']
      }
    } else {
      updatedRisks.push(risk)
    }
    setRisks(updatedRisks)
  }

  const handleGenerate = async () => {
    if (!patientName) {
      alert('Por favor, informe o nome do paciente.')
      return
    }
    if (!patientCpf || patientCpf.length < 14) {
      alert('Por favor, informe um CPF válido para o trabalhador.')
      return
    }
    if (!companyName) {
      alert('Por favor, informe o nome da empresa empregadora.')
      return
    }
    if (!role) {
      alert('Por favor, informe o cargo/função do trabalhador.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await saveAndSendExam({
        appointmentId: appointmentId || 'manual-' + Date.now(),
        examType,
        patientName,
        patientCpf,
        companyName,
        role,
        risks,
        opinion,
        notes: additionalNotes,
        doctorName
      })
      
      if (res.success && res.shareLink) {
        setResult({ 
          id: res.id, 
          shareLink: res.shareLink, 
          whatsappLink: res.whatsappLink || '' 
        })
        toast('ASO Ocupacional gerado com sucesso!', 'success')
      } else {
        toast(res.error || 'Erro ao gerar o exame ocupacional.', 'error')
      }
    } catch (error) {
      console.error(error)
      toast('Erro ao gerar ASO.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !result) return

    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileName = `${result.id}_signed.pdf`
      
      const { data, error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName)

      const updateRes = await uploadSignedPrescription(result.id, publicUrl)
      if (updateRes.success) {
        setIsSigned(true)
        setSignedUrl(publicUrl)
        toast('Exame ASO assinado anexado com sucesso!', 'success')
      } else {
        throw new Error(updateRes.error)
      }
    } catch (error: any) {
      toast('Erro no upload: ' + error.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setPatientName(initialPatientName || '')
    setPatientCpf('')
    setCompanyName('')
    setRole('')
    setExamType('admissional')
    setRisks(['Ausência de Riscos'])
    setOpinion('apto')
    setAdditionalNotes('')
    setIsSigned(false)
    setSignedUrl(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4 w-full mr-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="text-primary h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">Novo ASO (Exame Ocupacional)</h2>
                  <p className="text-xs text-gray-400 mt-1">Gere atestados admissionais e demissionais validados com assinatura e carimbo</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  resetForm()
                  onClose()
                }} 
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 custom-scrollbar">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-4"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">ASO Gerado com Sucesso!</h3>
                      <p className="text-gray-400 mt-2">O Atestado de Saúde Ocupacional foi montado com o seu carimbo e assinatura digital.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl space-y-2">
                    <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Assinatura Eletrônica Governamental
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Embora o documento já possua seu carimbo profissional e assinatura visual, recomendamos assinar o PDF digitalmente no portal <a href="https://assinador.iti.br" target="_blank" className="text-primary hover:underline">assinador.iti.br</a> usando o e-CPF (Gov.br) para plena validade jurídica laboral.
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`${result.shareLink}&print=true`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                      >
                        <Download className="h-5 w-5" />
                        Baixar PDF ASO
                      </a>
                      <a 
                        href="https://assinador.iti.br"
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
                      >
                        <ShieldCheck className="h-5 w-5" />
                        Assinar (ITI)
                      </a>
                    </div>

                    {isSigned && result && (
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Olá ${patientName}, aqui está seu ASO DIGITAL ASSINADA da consulta com Dr(a). ${doctorName}: ${window.location.origin}/r/${result.id}.pdf?v=${Date.now()}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-black font-extrabold rounded-xl hover:bg-[#25D366]/90 transition-all shadow-lg shadow-[#25D366]/20"
                      >
                        <Send className="h-5 w-5" />
                        ENVIAR VIA WHATSAPP
                      </a>
                    )}

                    {!isSigned ? (
                      <label className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border-2 border-dashed border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <FileUp className="h-5 w-5 group-hover:text-primary" />
                        )}
                        <span>{isUploading ? 'Enviando...' : 'Anexar PDF Assinado (Gov.br)'}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full py-4 bg-green-500/10 border border-green-500/30 text-green-500 font-bold rounded-xl">
                        <Check className="h-5 w-5" />
                        <span>ASO Assinado Anexado com Sucesso!</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Identificação do Trabalhador
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Nome Completo</label>
                        <input
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Digite o nome do trabalhador..."
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">CPF</label>
                        <input
                          value={patientCpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações de Trabalho */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-secondary" />
                      Dados Ocupacionais
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Empresa / Empregadora</label>
                        <input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: ACME Corporation Ltda"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Cargo / Função</label>
                        <input
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="Ex: Desenvolvedor Fullstack"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Exame */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                      Tipo de Exame Ocupacional
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setExamType('admissional')}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 font-bold cursor-pointer ${
                          examType === 'admissional'
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <span className="text-xl">📥</span>
                        <span>Exame Admissional</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExamType('demissional')}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 font-bold cursor-pointer ${
                          examType === 'demissional'
                            ? 'bg-secondary/10 border-secondary text-secondary shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <span className="text-xl">📤</span>
                        <span>Exame Demissional</span>
                      </button>
                    </div>
                  </div>

                  {/* Riscos Ocupacionais */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                      Riscos Ocupacionais Identificados
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Físico',
                        'Químico',
                        'Biológico',
                        'Ergonômico',
                        'Acidente / Mecânico',
                        'Ausência de Riscos'
                      ].map((risk) => {
                        const isSelected = risks.includes(risk)
                        return (
                          <button
                            key={risk}
                            type="button"
                            onClick={() => toggleRisk(risk)}
                            className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-primary/20 border-primary/50 text-white font-bold'
                                : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                          >
                            {risk}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Parecer de Aptidão */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                      Conclusão Médica (Aptidão)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setOpinion('apto')}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 font-bold cursor-pointer ${
                          opinion === 'apto'
                            ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <span>APTO para a Função</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpinion('inapto')}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 font-bold cursor-pointer ${
                          opinion === 'inapto'
                            ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                        }`}
                      >
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <span>INAPTO para a Função</span>
                      </button>
                    </div>
                  </div>

                  {/* Observações / Notas */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-yellow-400" />
                      Parecer Clínico e Exames Complementares
                    </h3>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Indique exames complementares realizados (Audiometria, Hemograma) ou pareceres clínicos de suporte..."
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none animate-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!result && (
              <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Validador e Carimbo Ativos
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      resetForm()
                      onClose()
                    }}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                        Emitindo ASO...
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4" />
                        Emitir ASO
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
