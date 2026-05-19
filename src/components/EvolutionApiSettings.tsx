'use client'

import { useState, useEffect } from 'react'
import { Save, Smartphone, Loader2, CheckCircle2 } from 'lucide-react'

export function EvolutionApiSettings() {
  const [apiUrl, setApiUrl] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        if (data.settings) {
          setApiUrl(data.settings.EVOLUTION_API_URL || '')
          setInstanceName(data.settings.EVOLUTION_INSTANCE_NAME || '')
          setApiKey(data.settings.EVOLUTION_API_KEY || '')
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
      } finally {
        setFetching(false)
      }
    }
    loadSettings()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EVOLUTION_API_URL: apiUrl,
          EVOLUTION_INSTANCE_NAME: instanceName,
          EVOLUTION_API_KEY: apiKey
        })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert('Erro ao salvar configurações.')
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="glass p-8 rounded-3xl border border-white/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Configuração do WhatsApp</h2>
          <p className="text-xs text-gray-400">Credenciais da Evolution API</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5 block">URL da API</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-400/50 focus:ring-1 focus:ring-green-400/30 transition-all"
            placeholder="Ex: https://api.seudominio.com"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5 block">Nome da Instância</label>
          <input
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-400/50 focus:ring-1 focus:ring-green-400/30 transition-all"
            placeholder="Ex: teste"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5 block">API Key (Global ou da Instância)</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-400/50 focus:ring-1 focus:ring-green-400/30 transition-all"
            placeholder="Ex: 80B23F49E8BF-..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar Configurações</>}
        </button>
      </div>
      
      {success && (
        <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1.5 animate-fade-in">
          <CheckCircle2 className="h-3.5 w-3.5" /> Salvo com sucesso!
        </div>
      )}
    </form>
  )
}
