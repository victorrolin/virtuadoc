'use client'

import { useState } from 'react'
import { KeyRound, UserPlus, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { changeAdminPassword, createAdminUser } from '@/app/actions/adminSettings'

function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await changeAdminPassword(formData)
    setResult(res)
    setLoading(false)
    if (res.success) (e.target as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Senha Atual</label>
        <div className="relative">
          <input
            name="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 pr-10 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nova Senha</label>
        <div className="relative">
          <input
            name="newPassword"
            type={showNew ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="w-full px-4 py-2.5 pr-10 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Confirmar Nova Senha</label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Repita a nova senha"
          required
          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
      </div>

      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${result.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.success ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          {result.success || result.error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50 text-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {loading ? 'Atualizando...' : 'Atualizar Senha'}
      </button>
    </form>
  )
}

function CreateAdminForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await createAdminUser(formData)
    setResult(res)
    setLoading(false)
    if (res.success) (e.target as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nome Completo</label>
        <input
          name="fullName"
          type="text"
          placeholder="Nome do administrador"
          required
          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">E-mail</label>
        <input
          name="email"
          type="email"
          placeholder="admin@email.com"
          required
          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Senha Inicial</label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="w-full px-4 py-2.5 pr-10 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500">O admin pode trocar a senha após o primeiro login.</p>
      </div>

      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${result.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {result.success ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
          {result.success || result.error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold py-2.5 rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50 text-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {loading ? 'Criando...' : 'Criar Administrador'}
      </button>
    </form>
  )
}

export function AdminAccountSettings() {
  const [tab, setTab] = useState<'password' | 'new-admin'>('password')

  return (
    <div className="glass p-6 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-white">Configurações de Conta</h2>
      </div>

      {/* Mini tabs */}
      <div className="flex rounded-xl bg-black/30 p-1 mb-5 border border-white/5">
        <button
          onClick={() => setTab('password')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'password' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <KeyRound className="h-3.5 w-3.5" /> Minha Senha
        </button>
        <button
          onClick={() => setTab('new-admin')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'new-admin' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Novo Admin
        </button>
      </div>

      {tab === 'password' && <ChangePasswordForm />}
      {tab === 'new-admin' && <CreateAdminForm />}
    </div>
  )
}
