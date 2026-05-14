'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Send, X, Download, Plus, Trash2, Pill, ClipboardList, CheckCircle2, ShieldCheck, FileUp, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadSignedPrescription } from '@/app/actions/uploadPrescription'

import { saveAndSendPrescription } from '@/app/actions/prescriptions'
import { MemedPrescriber } from './MemedPrescriber'

interface PrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  patientName: string
  doctorName: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  instructions: string
}

export function PrescriptionModal({ isOpen, onClose, appointmentId, patientName: initialPatientName, doctorName }: PrescriptionModalProps) {
  const [patientName, setPatientName] = useState(initialPatientName || '')
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '', dosage: '', instructions: '' }
  ])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ id: string, shareLink: string, whatsappLink: string } | null>(null)
  const [isSigned, setIsSigned] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName)
  }, [initialPatientName])

  const addMedication = () => {
    setMedications([...medications, { id: Math.random().toString(36).substr(2, 9), name: '', dosage: '', instructions: '' }])
  }

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(m => m.id !== id))
    }
  }

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleGenerate = async () => {
    if (!patientName) {
      alert('Por favor, informe o nome do paciente.')
      return
    }
    if (medications.some(m => !m.name)) {
      alert('Por favor, preencha o nome de todos os medicamentos.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await saveAndSendPrescription({
        appointmentId: appointmentId || 'manual-' + Date.now(),
        medications,
        notes: additionalNotes,
        patientName,
        doctorName
      })
      
      if (res.success && res.shareLink) {
        console.log('DEBUG: Generated shareLink', res.shareLink)
        setResult({ 
          id: res.id, 
          shareLink: res.shareLink, 
          whatsappLink: res.whatsappLink || '' 
        })
      } else {
        alert(res.error || 'Erro ao gerar os links da receita.')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao gerar receita.')
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
        alert('Receita assinada anexada com sucesso!')
      } else {
        throw new Error(updateRes.error)
      }
    } catch (error: any) {
      alert('Erro no upload: ' + error.message)
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
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">Nova Receita Digital</h2>
                  {!appointmentId ? (
                    <div className="mt-1 flex flex-col">
                      <label className="text-[9px] uppercase tracking-widest font-black text-primary mb-1">Paciente</label>
                      <input 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Clique aqui e digite o nome completo..."
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-base font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none placeholder-gray-600 w-full transition-all"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">Paciente: <span className="text-white font-bold">{patientName}</span></p>
                  )}
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
                      <h3 className="text-2xl font-bold text-white">Receita Pronta!</h3>
                      <p className="text-gray-400 mt-2">O documento foi gerado com sucesso.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl space-y-2">
                    <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Passo Importante para Validade Jurídica
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Para que esta receita seja aceita em todas as farmácias (medicamentos controlados), você deve baixar o PDF e assiná-lo digitalmente no portal <a href="https://assinador.iti.br" target="_blank" className="text-primary hover:underline">assinador.iti.br</a> usando seu e-CPF.
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
                          Baixar PDF
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
                            `Olá ${patientName}, aqui está sua RECEITA DIGITAL ASSINADA da consulta com Dr(a). ${doctorName}: ${window.location.origin}/r/${result.id}?v=${Date.now()}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-black font-extrabold rounded-xl hover:bg-[#25D366]/90 transition-all shadow-lg shadow-[#25D366]/20"
                        >
                          <Send className="h-5 w-5" />
                          ENVIAR VIA WHATSAPP
                        </a>
                      )}

                      {/* Botão de Upload ou Status */}
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
                          <span>Receita Assinada Anexada!</span>
                        </div>
                      )}
                    </div>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Pill className="h-4 w-4 text-secondary" />
                        Medicamentos
                      </h3>
                      <button 
                        onClick={addMedication}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-medium"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar
                      </button>
                    </div>

                    {medications.map((med, index) => (
                      <motion.div 
                        layout
                        key={med.id} 
                        className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative group"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Medicamento</label>
                            <input
                              value={med.name}
                              onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                              placeholder="Ex: Amoxicilina 500mg"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Posologia / Dose</label>
                            <input
                              value={med.dosage}
                              onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                              placeholder="Ex: 1 comprimido"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Instruções de Uso</label>
                          <textarea
                            value={med.instructions}
                            onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                            placeholder="Ex: Tomar de 8 em 8 horas por 7 dias"
                            rows={2}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                          />
                        </div>
                        {medications.length > 1 && (
                          <button 
                            onClick={() => removeMedication(med.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-yellow-400" />
                      Observações Adicionais
                    </h3>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Orientações de repouso, dieta ou outros cuidados..."
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
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
                  Gerador de PDF Profissional
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
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Gerar Receita
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
