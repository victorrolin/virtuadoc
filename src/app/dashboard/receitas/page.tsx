'use client'

import { useEffect, useState, useRef } from 'react'
import { getPrescriptionHistory } from '@/app/actions/prescriptionHistory'
import { uploadSignedPrescription } from '@/app/actions/uploadPrescription'
import { deletePrescription } from '@/app/actions/deletePrescription'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Send, Download, Loader2, Calendar, User, CheckCircle2, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function PrescriptionHistoryPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const res = await getPrescriptionHistory()
    if (res.success) {
      setPrescriptions(res.prescriptions || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedId) return

    try {
      setUploadingId(selectedId)
      
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedId}-${Math.random()}.${fileExt}`
      const filePath = `signed/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(filePath)

      // 3. Update DB
      const res = await uploadSignedPrescription(selectedId, publicUrl)
      
      if (res.success) {
        alert('Receita assinada enviada com sucesso!')
        load()
      } else {
        alert('Erro ao atualizar banco: ' + res.error)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      alert('Erro no upload: ' + err.message)
    } finally {
      setUploadingId(null)
      setSelectedId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta receita do histórico?')) return

    try {
      const res = await deletePrescription(id)
      if (res.success) {
        load()
      } else {
        alert('Erro ao excluir: ' + res.error)
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir receita.')
    }
  }

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function generateLink(p: any) {
    const baseUrl = window.location.origin
    const prescriptionData = JSON.stringify({
      p: p.patient_name,
      d: 'Médico', // Idealmente buscar do perfil
      m: p.medications || [],
      n: p.notes || ''
    })
    const encodedData = btoa(unescape(encodeURIComponent(prescriptionData)))
    return `${baseUrl}/prescriptions/manual-${p.id}?data=${encodedData}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 text-primary" />
            Histórico de Receitas
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">Consulte e reenvie receitas geradas anteriormente.</p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por paciente..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Carregando histórico...</p>
        </div>
      ) : filteredPrescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrescriptions.map((p) => {
            const link = generateLink(p)
            return (
              <div key={p.id} className="glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${p.is_signed ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${p.is_signed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {p.is_signed ? 'Assinada (Gov.br)' : 'Aguardando Assinatura'}
                    </span>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir receita"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                      <User className="h-3 w-3" /> Paciente
                    </p>
                    <p className="text-white font-semibold">{p.patient_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Gerada em</p>
                      <p className="text-gray-300 text-xs">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {p.last_sent_at && (
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Enviada em</p>
                        <p className="text-gray-300 text-xs">{new Date(p.last_sent_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link 
                        href={`${link}&print=true`}
                        target="_blank"
                        className="flex-1 bg-white/5 hover:bg-primary/20 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF Original
                      </Link>
                      
                      <button
                        onClick={() => {
                          const shortLink = `${window.location.origin}/r/${p.id}.pdf?v=${Date.now()}`
                          const text = `Olá ${p.patient_name}, aqui está sua RECEITA DIGITAL ${p.is_signed ? 'ASSINADA' : ''} da consulta: ${shortLink}`
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                        }}
                        className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-black text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" /> Reenviar
                      </button>
                    </div>

                    {!p.is_signed && (
                      <button 
                        onClick={() => {
                          setSelectedId(p.id)
                          setTimeout(() => fileInputRef.current?.click(), 100)
                        }}
                        disabled={uploadingId === p.id}
                        className="w-full bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all border border-green-500/20 disabled:opacity-50"
                      >
                        {uploadingId === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Anexar Receita Assinada (Gov.br)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/5">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma receita encontrada.</p>
        </div>
      )}

      {/* Input de Arquivo Escondido */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".pdf" 
        className="hidden" 
      />
    </div>
  )
}
