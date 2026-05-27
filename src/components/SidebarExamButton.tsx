'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { ExamModal } from './ExamModal'

interface Props {
  doctorName: string
}

export function SidebarExamButton({ doctorName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 font-bold transition-all bg-primary/5 border border-primary/10 hover:border-primary/30 group cursor-pointer"
      >
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <span>Emitir ASO Ocupacional</span>
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
