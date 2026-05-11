'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Não mostrar na página principal do dashboard
  if (pathname === '/dashboard') return null

  return (
    <button
      onClick={() => router.back()}
      className="group flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-all mb-6 hover:-translate-x-1"
    >
      <span className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/10 transition-all">
        <ArrowLeft className="h-4 w-4" />
      </span>
      Voltar
    </button>
  )
}
