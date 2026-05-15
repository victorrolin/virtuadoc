'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 5000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[300px] ${
                t.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-primary/10 border-primary/20 text-primary'
              }`}>
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5" />}
                {t.type === 'info' && <Info className="h-5 w-5" />}
                
                <p className="text-sm font-medium flex-1">{t.message}</p>
                
                <button 
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
