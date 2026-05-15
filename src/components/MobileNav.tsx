'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Activity, LayoutDashboard, Calendar, Video, UserCircle, FileText, Stethoscope, Settings, LogOut, LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  role?: string
  variant?: 'default' | 'primary'
}

interface MobileNavProps {
  role: string
  firstName: string
  signOut: () => void
}

export function MobileNav({ role, firstName, signOut }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  ]

  if (role === 'doctor') {
    navItems.push(
      { href: '/dashboard/agenda', label: 'Minha Agenda', icon: Calendar },
      { href: '/dashboard/consultas', label: 'Salas de Vídeo', icon: Video },
      { href: '/dashboard/perfil', label: 'Meu Perfil', icon: UserCircle },
      { href: '/dashboard/receitas', label: 'Histórico de Receitas', icon: FileText },
      { href: '/dashboard/assistente', label: 'Dr. Virtua (IA)', icon: Stethoscope, variant: 'primary' }
    )
  }

  if (role === 'patient') {
    navItems.push(
      { href: '/dashboard/minhas-consultas', label: 'Minhas Consultas', icon: Calendar },
      { href: '/medicos', label: 'Buscar Médico', icon: Activity }
    )
  }

  if (role === 'admin') {
    navItems.push(
      { href: '/dashboard/admin', label: 'Painel Administrativo', icon: Settings }
    )
  }

  return (
    <>
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:hidden bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-sm font-bold text-white uppercase tracking-tighter">VirtuaDoc</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-[#0f1115] border-l border-white/10 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{firstName}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-black">{role}</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.variant === 'primary' 
                        ? 'bg-primary/10 text-primary border border-primary/20 font-bold' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-6 border-t border-white/5 mt-auto">
                <button 
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Sair da Conta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
