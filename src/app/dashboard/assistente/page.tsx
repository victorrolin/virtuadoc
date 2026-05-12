'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle, CheckCircle, Activity, BookOpen, Stethoscope, Paperclip, X, FileText } from 'lucide-react'

interface AssitantResponse {
  status_prioridade?: string
  hipoteses_diagnosticas?: string[]
  analise_tecnica?: string
  conduta_sugerida?: string
  alertas_seguranca?: string[]
  evidencia_base_conhecimento?: {
    fonte: string
    referencia_resumida: string
    link_ou_doi: string
  }
  mensagem?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content?: string
  structured?: AssitantResponse
  imageUrl?: string
  fileName?: string
}

export default function AssistentePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    const reader = new FileReader()
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string)
    }
    reader.readAsDataURL(selected)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() && !file) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt.trim(),
      imageUrl: filePreview.startsWith('data:image') ? filePreview : undefined,
      fileName: file ? file.name : undefined
    }

    setMessages(prev => [...prev, userMessage])
    
    const currentPrompt = prompt
    const currentFilePreview = filePreview
    
    setPrompt('')
    setFile(null)
    setFilePreview('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentPrompt,
          image: currentFilePreview || undefined 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao consultar o assistente')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        structured: data
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message)
      // Remove the last user message if it failed or show error bubble
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Erro: ' + err.message
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string = '') => {
    switch (priority.toLowerCase()) {
      case 'emergencia': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'urgente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header Premium */}
      <div className="flex-shrink-0 glass border-b border-white/5 p-4 flex items-center gap-4 rounded-t-3xl z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-12 w-12 bg-gradient-to-tr from-primary to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)] relative">
          <Stethoscope className="h-6 w-6 text-black" />
          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-[#070707] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Dr. Virtua <span className="text-primary text-[10px] font-bold uppercase tracking-wider ml-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">CDSS</span></h1>
          <p className="text-xs text-green-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online e Pronto
          </p>
        </div>
      </div>

      {/* Chat Area Premium - Light Version */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#EFEAE2] relative custom-scrollbar border-x border-white/5">
        
        {/* Fundo de Doodles do WhatsApp Claro */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0" 
          style={{ 
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
            backgroundRepeat: 'repeat'
          }} 
        />
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 z-10 relative">
            <div className="bg-yellow-100 border border-yellow-200 p-6 rounded-2xl text-sm text-gray-700 max-w-md shadow-sm relative overflow-hidden">
              <Activity className="h-10 w-10 text-yellow-600 mx-auto mb-4 opacity-80" />
              <p className="font-semibold text-gray-800 mb-2">Ambiente Clínico Seguro</p>
              Envie os sintomas, dados vitais e hipóteses do paciente abaixo para discutirmos o caso com suporte baseado em evidências.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex z-10 relative ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-sm' 
                : 'bg-white border border-gray-200 rounded-tl-sm text-[#111b21]'
            }`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="flex flex-col gap-2">
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Anexo" className="max-w-full sm:max-w-[250px] rounded-lg border border-black/10" />
                  )}
                  {!msg.imageUrl && msg.fileName && (
                    <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg border border-black/10">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-700 truncate max-w-[150px]">{msg.fileName}</span>
                    </div>
                  )}
                  {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                </div>
              )}

              {/* Assistant Message */}
              {msg.role === 'assistant' && (
                <div className="space-y-4">
                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  
                  {msg.structured?.mensagem && (
                    <p className="text-sm whitespace-pre-wrap">{msg.structured.mensagem}</p>
                  )}

                  {msg.structured && !msg.structured.mensagem && (
                    <div className="space-y-4">
                      {msg.structured.status_prioridade && (
                        <div className="flex justify-between items-start gap-4 border-b border-gray-200 pb-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-teal-600" /> Avaliação
                          </span>
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border shadow-sm ${getPriorityColor(msg.structured.status_prioridade)}`}>
                            {msg.structured.status_prioridade}
                          </span>
                        </div>
                      )}

                      {msg.structured.alertas_seguranca && msg.structured.alertas_seguranca.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <h3 className="text-red-600 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                            <AlertTriangle className="h-4 w-4" /> Red Flags Detectadas
                          </h3>
                          <ul className="list-disc list-inside text-sm text-red-800 space-y-1.5">
                            {msg.structured.alertas_seguranca.map((alerta, i) => (
                              <li key={i}>{alerta}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.structured.hipoteses_diagnosticas && msg.structured.hipoteses_diagnosticas.length > 0 && (
                        <div>
                          <h3 className="text-gray-700 font-bold mb-2.5 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <CheckCircle className="h-4 w-4 text-green-600" /> Hipóteses
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {msg.structured.hipoteses_diagnosticas.map((hd, i) => (
                              <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 shadow-sm">
                                {hd}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.structured.analise_tecnica && (
                        <div>
                          <h3 className="text-teal-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Análise Clínica</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">{msg.structured.analise_tecnica}</p>
                        </div>
                      )}

                      {msg.structured.conduta_sugerida && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600"></div>
                          <h3 className="text-gray-800 font-bold mb-2 text-xs uppercase tracking-wider">Conduta Sugerida</h3>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{msg.structured.conduta_sugerida}</p>
                        </div>
                      )}

                      {msg.structured.evidencia_base_conhecimento && msg.structured.evidencia_base_conhecimento.fonte && (
                        <div className="border-t border-gray-200 pt-4 mt-4 text-xs">
                          <h3 className="font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <BookOpen className="h-3.5 w-3.5 text-gray-500" /> Evidência Base
                          </h3>
                          <div className="text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <p><strong>Fonte:</strong> <span className="text-gray-700">{msg.structured.evidencia_base_conhecimento.fonte}</span></p>
                            <p><strong>Ref:</strong> <span className="text-gray-700">{msg.structured.evidencia_base_conhecimento.referencia_resumida}</span></p>
                            {msg.structured.evidencia_base_conhecimento.link_ou_doi && (
                              <div className="mt-2">
                                <a href={msg.structured.evidencia_base_conhecimento.link_ou_doi.startsWith('http') ? msg.structured.evidencia_base_conhecimento.link_ou_doi : `https://doi.org/${msg.structured.evidencia_base_conhecimento.link_ou_doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                  Acessar Referência ↗
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start z-10 relative">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-3 text-gray-500 text-sm font-medium">
              <span className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              Processando raciocínio clínico...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Premium */}
      <div className="flex-shrink-0 glass border-t border-x border-white/5 p-4 sm:p-5 rounded-b-3xl z-20">
        {filePreview && (
          <div className="mb-3 relative inline-block">
            {filePreview.startsWith('data:image') ? (
              <img src={filePreview} alt="Preview" className="h-16 rounded-lg border border-white/20 object-cover" />
            ) : (
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20">
                <FileText className="h-5 w-5 text-gray-300" />
                <span className="text-xs text-gray-300 max-w-[120px] truncate">{file?.name}</span>
              </div>
            )}
            <button 
              type="button" 
              onClick={() => {setFile(null); setFilePreview('')}} 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            className="hidden" 
            accept="image/*,application/pdf" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-white transition-all bg-[#1a1a1a] border border-white/10 rounded-full hover:bg-white/5"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva o quadro clínico, exames e dúvidas..."
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-black/60 focus:ring-1 focus:ring-primary/30 text-sm resize-none min-h-[52px] max-h-[150px] custom-scrollbar transition-all"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={loading || (!prompt.trim() && !file)}
            className="h-[52px] w-[52px] flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-primary to-cyan-500 text-black rounded-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)]"
          >
            <Send className="h-5 w-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
