'use client'

import { useState } from 'react'
import { Briefcase, Plus } from 'lucide-react'
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
        className="w-full flex items-center justify-between p-3 mt-2 rounded-xl bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20 hover:border-secondary/50 text-white transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-secondary" />
          </div>
          <span className="font-semibold text-sm group-hover:text-secondary transition-colors">Novo Exame (ASO)</span>
        </div>
        <Plus className="h-4 w-4 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>

      <ExamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        doctorName={doctorName}
      />
    </>
  )
}
