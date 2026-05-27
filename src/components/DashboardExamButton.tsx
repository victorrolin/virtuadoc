'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
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
        className="w-full bg-gradient-to-r from-primary to-secondary text-black font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] group cursor-pointer"
      >
        <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <ClipboardList className="h-5 w-5" />
        </div>
        Emitir ASO (Admissional/Demissional)
      </button>

      <ExamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        appointmentId=""
        patientName=""
        doctorName={doctorName}
      />
    </>
  )
}
