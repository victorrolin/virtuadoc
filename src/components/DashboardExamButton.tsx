'use client'

import { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { ExamModal } from './ExamModal'

interface Props {
  doctorName: string
}

export function DashboardExamButton({ doctorName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-gradient-to-r from-secondary to-[#f43f5e] text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] group"
      >
        <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        Emitir Exame (ASO)
      </button>

      <ExamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        doctorName={doctorName}
      />
    </>
  )
}
