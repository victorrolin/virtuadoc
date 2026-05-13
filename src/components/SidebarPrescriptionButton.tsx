'use client'

import { useState } from 'react'
import { FilePlus } from 'lucide-react'
import { PrescriptionModal } from './PrescriptionModal'

interface Props {
  doctorName: string
}

export function SidebarPrescriptionButton({ doctorName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 font-bold transition-all bg-primary/5 border border-primary/10 hover:border-primary/30 group"
      >
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FilePlus className="h-5 w-5 text-primary" />
        </div>
        <span>Emitir Receita</span>
      </button>

      <PrescriptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        appointmentId=""
        patientName=""
        doctorName={doctorName}
      />
    </>
  )
}
