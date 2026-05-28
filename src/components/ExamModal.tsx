'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Send, X, Download, ShieldCheck, CheckCircle2, ClipboardList, Briefcase, FileUp, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveAndSendExam } from '@/app/actions/exams'
import { uploadSignedPrescription } from '@/app/actions/uploadPrescription' // Reusing for signed exam
import { useToast } from '@/components/Toast'

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
}

export function ExamModal({ isOpen, onClose, doctorName }: ExamModalProps) {
  const { toast } = useToast()
  const [patientName, setPatientName] = useState('')
  const [patientCpf, setPatientCpf] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [examType, setExamType] = useState('Admissional')
  const [risks, setRisks] = useState('')
  const [opinion, setOpinion] = useState('Apto')
  const [notes, setNotes] = useState('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ id: string, shareLink: string, whatsappLink: string } | null>(null)
  
  const [isSigned, setIsSigned] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Resetar todo o estado quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setPatientName('')
      setPatientCpf('')
      setCompanyName('')
      setRole('')
      setExamType('Admissional')
      setRisks('')
      setOpinion('Apto')
      setNotes('')
      setResult(null)
      setIsSigned(false)
      setSignedUrl(null)
      setIsUploading(false)
      setIsGenerating(false)
    }
  }, [isOpen])

  const handleGenerate = async () => {
    if (!patientName || !companyName || !role) {
      alert('Por favor, preencha nome do paciente, empresa e função.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await saveAndSendExam({
        patientName,
        patientCpf,
        companyName,
        role,
        examType,
        risks,
        opinion,
        notes,
        doctorName
      })
      
      if (res.success && res.shareLink) {
        setResult({ 
          id: res.id, 
          shareLink: res.shareLink, 
          whatsappLink: res.whatsappLink || '' 
        })
        toast('Exame (ASO) gerado com sucesso!', 'success')
      } else {
        toast(res.error || 'Erro ao gerar exame.', 'error')
      }
    } catch (error) {
      console.error(error)
      toast('Erro ao gerar exame.', 'error')
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
      const fileName = `${result.id}_signed_exam.pdf`
      
      const { data, error: uploadError } = await supabase.storage
        .from('prescriptions') // Reusing prescriptions bucket
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName)

      const updateRes = await uploadSignedPrescription(result.id, publicUrl)
      if (updateRes.success) {
        setIsSigned(true)
        setSignedUrl(publicUrl)
        toast('Exame assinado anexado com sucesso!', 'success')
      } else {
        throw new Error(updateRes.error)
      }
    } catch (error: any) {
      toast('Erro no upload: ' + error.message, 'error')
    } finally {
      setIsUploading(false)
    }
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
                <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="text-secondary h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">Emitir Exame Ocupacional (ASO)</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Preencha os dados do atestado</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
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
                      <h3 className="text-2xl font-bold text-white">ASO Gerado!</h3>
                      <p className="text-gray-400 mt-2">O atestado foi gerado com sucesso.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl space-y-2">
                    <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Passo Importante para Validade Jurídica
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Para que o ASO tenha validade, você deve baixar o PDF e assiná-lo digitalmente no portal <a href="https://assinador.iti.br" target="_blank" className="text-secondary hover:underline">assinador.iti.br</a> usando seu e-CPF.
                    </p>
                  </div>

                  {/* Botão para gerar um novo ASO */}
                  <button
                    onClick={() => {
                      setResult(null)
                      setIsSigned(false)
                      setSignedUrl(null)
                      setPatientName('')
                      setPatientCpf('')
                      setCompanyName('')
                      setRole('')
                      setExamType('Admissional')
                      setRisks('')
                      setOpinion('Apto')
                      setNotes('')
                    }}
                    className="w-full py-2 text-xs text-gray-500 hover:text-secondary transition-colors font-semibold tracking-wider uppercase"
                  >
                    + Emitir Novo ASO
                  </button>

                  <div className="flex flex-col w-full gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`${result.shareLink}?print=true`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                      >
                        <Download className="h-5 w-5" />
                        Baixar PDF
                      </a>
                      <a 
                        href="https://assinador.iti.br"
                        target="_blank"
                        className="flex items-center justify-center gap-2 py-3.5 bg-secondary/10 text-secondary font-bold rounded-xl hover:bg-secondary/20 transition-all border border-secondary/20"
                      >
                        <ShieldCheck className="h-5 w-5" />
                        Assinar (ITI)
                      </a>
                    </div>

                    {isSigned && result && (
                      <a 
                        href={result.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-black font-extrabold rounded-xl hover:bg-[#25D366]/90 transition-all shadow-lg shadow-[#25D366]/20"
                      >
                        <Send className="h-5 w-5" />
                        ENVIAR VIA WHATSAPP
                      </a>
                    )}

                    {!isSigned ? (
                      <label className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border-2 border-dashed border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 hover:border-secondary/30 transition-all cursor-pointer group">
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                        ) : (
                          <FileUp className="h-5 w-5 group-hover:text-secondary" />
                        )}
                        <span>{isUploading ? 'Enviando...' : 'Anexar PDF Assinado (Gov.br)'}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full py-4 bg-green-500/10 border border-green-500/30 text-green-500 font-bold rounded-xl">
                        <Check className="h-5 w-5" />
                        <span>ASO Assinado Anexado!</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Tipo de Exame</label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      >
                        <option value="Admissional">Admissional</option>
                        <option value="Demissional">Demissional</option>
                        <option value="Periódico">Periódico</option>
                        <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                        <option value="Mudança de Função">Mudança de Função</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Parecer Médico</label>
                      <select
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      >
                        <option value="Apto">Apto para a função</option>
                        <option value="Inapto">Inapto para a função</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Paciente</label>
                      <input
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Nome completo do paciente"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">CPF</label>
                      <input
                        value={patientCpf}
                        onChange={(e) => setPatientCpf(e.target.value)}
                        placeholder="CPF do paciente"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Empresa</label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Razão Social ou Nome Fantasia"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Função</label>
                      <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Cargo do funcionário"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Riscos Ocupacionais</label>
                    <textarea
                      value={risks}
                      onChange={(e) => setRisks(e.target.value)}
                      placeholder="Ex: Físico (ruído), Químico (poeira), Ergonômico. Se não houver, digite 'Ausência de riscos ocupacionais específicos'."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1 flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 text-yellow-400" />
                      Observações Adicionais (Opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Outras observações médicas..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!result && (
              <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  ASO Digital Premium
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-secondary text-black font-bold text-sm hover:bg-secondary/90 shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Gerar ASO
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
