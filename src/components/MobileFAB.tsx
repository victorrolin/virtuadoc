'use client'

import { useState } from 'react'
import { FilePlus } from 'lucide-react'
import { PrescriptionModal } from './PrescriptionModal'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  doctorName: string
}

export function MobileFAB({ doctorName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-40">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-black"
      >
        <FilePlus className="h-6 w-6" />
      </motion.button>

      <PrescriptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        appointmentId=""
        patientName=""
        doctorName={doctorName}
      />
    </div>
  )
}
