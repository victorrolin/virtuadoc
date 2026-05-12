'use client'

import { useState } from 'react'
import { Bot, Send, AlertTriangle, CheckCircle, Activity, Loader2, BookOpen } from 'lucide-react'

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
  // Fallback se não for estruturado
  mensagem?: string
}

export default function AssistentePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AssitantResponse | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao consultar o assistente')
      }

      setResponse(data)
    } catch (err: any) {
      setError(err.message)
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
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" /> Assistente Clínico (CDSS)
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Descreva o caso clínico, exames e suas dúvidas para obter suporte à decisão médica baseado em evidências.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-2 custom-scrollbar">
        {!response && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <Bot className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-xl font-semibold text-white">Como posso ajudar hoje, Doutor?</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-md">
              Digite os sintomas, dados vitais e hipóteses do paciente abaixo para discutirmos o caso e condutas.
            </p>
          </div>
        )}

        {error && (
          <div className="glass p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-400 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-primary font-medium animate-pulse">Analisando caso clínico e buscando evidências...</p>
            </div>
          </div>
        )}

        {response && (
          <div className="glass p-6 rounded-3xl border border-primary/20 space-y-6 shadow-[0_0_40px_rgba(0,242,254,0.05)] animate-fade-in">
            {/* Fallback msg */}
            {response.mensagem && (
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {response.mensagem}
              </div>
            )}

            {/* Structured Data */}
            {!response.mensagem && (
              <>
                {response.status_prioridade && (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Avaliação</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getPriorityColor(response.status_prioridade)}`}>
                      {response.status_prioridade}
                    </span>
                  </div>
                )}

                {response.alertas_seguranca && response.alertas_seguranca.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2 text-sm">
                      <AlertTriangle className="h-4 w-4" /> Alertas de Segurança (Red Flags)
                    </h3>
                    <ul className="list-disc list-inside text-sm text-red-200/80 space-y-1">
                      {response.alertas_seguranca.map((alerta, i) => (
                        <li key={i}>{alerta}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {response.hipoteses_diagnosticas && response.hipoteses_diagnosticas.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-cyan-400" /> Hipóteses Diagnósticas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {response.hipoteses_diagnosticas.map((hd, i) => (
                        <span key={i} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-sm text-gray-300">
                          {hd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {response.analise_tecnica && (
                  <div>
                    <h3 className="text-white font-bold mb-2 text-sm text-primary">Análise Clínica</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{response.analise_tecnica}</p>
                  </div>
                )}

                {response.conduta_sugerida && (
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <h3 className="text-white font-bold mb-2 text-sm">Conduta Sugerida</h3>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{response.conduta_sugerida}</p>
                  </div>
                )}

                {response.evidencia_base_conhecimento && response.evidencia_base_conhecimento.fonte && (
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2">
                      <BookOpen className="h-3.5 w-3.5" /> Evidência Científica
                    </h3>
                    <div className="text-sm text-gray-400">
                      <strong>Fonte:</strong> {response.evidencia_base_conhecimento.fonte} <br/>
                      <strong>Ref:</strong> {response.evidencia_base_conhecimento.referencia_resumida}
                      {response.evidencia_base_conhecimento.link_ou_doi && (
                        <div className="mt-1">
                          <a href={response.evidencia_base_conhecimento.link_ou_doi.startsWith('http') ? response.evidencia_base_conhecimento.link_ou_doi : `https://doi.org/${response.evidencia_base_conhecimento.link_ou_doi}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Acessar Referência ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Paciente masc, 45a, dor torácica atípica há 2h..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none min-h-[60px] max-h-[200px]"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2 bottom-2 h-10 w-10 flex items-center justify-center bg-primary text-black rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          O assistente é uma ferramenta de suporte à decisão. A responsabilidade clínica final é sempre do médico assistente.
        </p>
      </div>
    </div>
  )
}
