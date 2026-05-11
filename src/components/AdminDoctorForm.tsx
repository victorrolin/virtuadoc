'use client'

import { useState } from 'react'
import { createDoctor } from '@/app/actions/admin'
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react'

export function AdminDoctorForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const res = await createDoctor(formData)

      if (res?.error) {
        setErrorMsg(res.error)
        setSuccess(false)
      } else {
        setSuccess(true)
        setErrorMsg('')
        e.currentTarget.reset() // Limpar o formulário
        
        // Esconder mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao cadastrar o médico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-6 rounded-2xl h-fit lg:col-span-1 relative">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6 text-secondary" />
        <h2 className="text-xl font-bold text-white">Novo Médico</h2>
      </div>
      
      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>Médico cadastrado com sucesso!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl animate-fade-in">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Nome Completo</label>
          <input name="full_name" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">E-mail de Login</label>
          <input type="email" name="email" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Senha Inicial</label>
          <input type="password" name="password" required minLength={6} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-1/2">
            <label className="text-xs font-medium text-gray-400">CRM</label>
            <input name="crm" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <label className="text-xs font-medium text-gray-400">Valor (R$)</label>
            <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">Especialidades (separadas por vírgula)</label>
          <input 
            name="specialties" 
            placeholder="Ex: Clínico Geral, Psiquiatra, Pediatra" 
            required 
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm placeholder-gray-600" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Cadastrar Médico'}
        </button>
      </form>
    </div>
  )
}
