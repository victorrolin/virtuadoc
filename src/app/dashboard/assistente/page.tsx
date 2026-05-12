'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, AlertTriangle, CheckCircle, Activity, BookOpen, User } from 'lucide-react'

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
}

export default function AssistentePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setPrompt('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
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
      {/* Header tipo WhatsApp */}
      <div className="flex-shrink-0 bg-[#070707] border-b border-white/5 p-4 flex items-center gap-4 rounded-t-2xl z-10">
        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 relative">
          <Bot className="h-6 w-6 text-primary" />
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#070707] rounded-full"></div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Assistente IA (CDSS)</h1>
          <p className="text-xs text-primary">online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0a0a0a] custom-scrollbar border-x border-white/5 bg-[url('/bg-chat.png')] bg-repeat">
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <div className="bg-black/50 p-4 rounded-2xl text-sm text-gray-400 max-w-sm border border-white/5">
              Envie os sintomas, dados vitais e hipóteses do paciente abaixo para discutirmos o caso e condutas.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-black rounded-tr-sm' 
                : 'bg-[#1a1a1a] border border-white/10 rounded-tl-sm text-gray-200'
            }`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Assistant Message */}
              {msg.role === 'assistant' && (
                <div className="space-y-4">
                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap text-gray-300">{msg.content}</p>
                  )}
                  
                  {msg.structured?.mensagem && (
                    <p className="text-sm whitespace-pre-wrap text-gray-300">{msg.structured.mensagem}</p>
                  )}

                  {msg.structured && !msg.structured.mensagem && (
                    <div className="space-y-4">
                      {msg.structured.status_prioridade && (
                        <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-3">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <Activity className="h-4 w-4" /> Avaliação
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getPriorityColor(msg.structured.status_prioridade)}`}>
                            {msg.structured.status_prioridade}
                          </span>
                        </div>
                      )}

                      {msg.structured.alertas_seguranca && msg.structured.alertas_seguranca.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          <h3 className="text-red-400 font-bold flex items-center gap-1.5 mb-1.5 text-xs">
                            <AlertTriangle className="h-3.5 w-3.5" /> Red Flags
                          </h3>
                          <ul className="list-disc list-inside text-xs text-red-200/80 space-y-1">
                            {msg.structured.alertas_seguranca.map((alerta, i) => (
                              <li key={i}>{alerta}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.structured.hipoteses_diagnosticas && msg.structured.hipoteses_diagnosticas.length > 0 && (
                        <div>
                          <h3 className="text-gray-300 font-bold mb-2 flex items-center gap-1.5 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-cyan-400" /> Hipóteses
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.structured.hipoteses_diagnosticas.map((hd, i) => (
                              <span key={i} className="px-2 py-1 bg-black/40 border border-white/5 rounded-lg text-xs text-gray-300">
                                {hd}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.structured.analise_tecnica && (
                        <div>
                          <h3 className="text-primary font-bold mb-1 text-xs">Análise Clínica</h3>
                          <p className="text-gray-400 text-xs leading-relaxed">{msg.structured.analise_tecnica}</p>
                        </div>
                      )}

                      {msg.structured.conduta_sugerida && (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <h3 className="text-white font-bold mb-1 text-xs">Conduta</h3>
                          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{msg.structured.conduta_sugerida}</p>
                        </div>
                      )}

                      {msg.structured.evidencia_base_conhecimento && msg.structured.evidencia_base_conhecimento.fonte && (
                        <div className="border-t border-white/5 pt-3 mt-3 text-[10px]">
                          <h3 className="font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1">
                            <BookOpen className="h-3 w-3" /> Evidência
                          </h3>
                          <div className="text-gray-400">
                            <strong>Fonte:</strong> {msg.structured.evidencia_base_conhecimento.fonte} <br/>
                            <strong>Ref:</strong> {msg.structured.evidencia_base_conhecimento.referencia_resumida}
                            {msg.structured.evidencia_base_conhecimento.link_ou_doi && (
                              <div className="mt-1">
                                <a href={msg.structured.evidencia_base_conhecimento.link_ou_doi.startsWith('http') ? msg.structured.evidencia_base_conhecimento.link_ou_doi : `https://doi.org/${msg.structured.evidencia_base_conhecimento.link_ou_doi}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  Ver fonte ↗
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
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2 text-primary text-sm font-medium">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
              digitando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-[#070707] border-t border-x border-white/5 p-4 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mensagem..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 text-sm resize-none min-h-[48px] max-h-[120px] custom-scrollbar"
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
            disabled={loading || !prompt.trim()}
            className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary text-black rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-md"
          >
            <Send className="h-5 w-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
