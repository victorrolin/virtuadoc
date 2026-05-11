'use client'

import { useState } from 'react'
import { deleteDoctor } from '@/app/actions/admin'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteDoctorButton({ doctorId }: { doctorId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Tem certeza que deseja excluir este médico? Esta ação não pode ser desfeita e excluirá toda a agenda dele.')) {
      return
    }

    setLoading(true)
    try {
      const res = await deleteDoctor(doctorId)
      if (res?.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Erro de conexão ao tentar excluir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      Excluir
    </button>
  )
}
