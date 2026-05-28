'use client'

import { useState, useRef } from 'react'
import { Camera, Save, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react'
import { updateDoctorProfile } from '@/app/actions/doctorProfile'
import Image from 'next/image'

interface Props {
  profile: {
    id: string
    full_name: string
    bio: string | null
    avatar_url: string | null
    crm: string | null
    specialties: string | null
  }
}

export function DoctorProfileForm({ profile }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) {
        setResult({ error: data.error })
      } else {
        setAvatarUrl(data.url + '?t=' + Date.now()) // cache bust
        setResult({ success: true })
      }
    } catch {
      setResult({ error: 'Erro ao enviar imagem.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await updateDoctorProfile(formData)
    setResult(res)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" /> Foto de Perfil
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-28 w-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {profile.full_name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              {uploading
                ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                : <Camera className="h-6 w-6 text-white" />}
            </button>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all text-sm font-semibold disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {uploading ? 'Enviando...' : 'Alterar Foto'}
            </button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WebP. Máximo 5MB.</p>
          </div>
        </div>
      </div>

      {/* Dados do perfil */}
      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-secondary" /> Informações do Perfil
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Nome Completo
            </label>
            <input
              name="fullName"
              defaultValue={profile.full_name || ''}
              required
              className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Especialidade (ex: Clínico Geral, Médico do Trabalho)
            </label>
            <input
              name="specialties"
              defaultValue={profile.specialties || ''}
              placeholder="Ex: Clínico Geral"
              className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              CRM
            </label>
            <input
              name="crm"
              defaultValue={profile.crm || ''}
              placeholder="Ex: 123456-SP"
              className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Bio / Apresentação
            </label>
            <textarea
              name="bio"
              defaultValue={profile.bio || ''}
              rows={4}
              placeholder="Ex: Médico especialista em cardiologia com 10 anos de experiência. Formado pela USP, atua com foco em prevenção e tratamento de doenças cardiovasculares..."
              className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Aparece no seu perfil público para os pacientes.</p>
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${result.success ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {result.success ? 'Perfil atualizado com sucesso!' : result.error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
