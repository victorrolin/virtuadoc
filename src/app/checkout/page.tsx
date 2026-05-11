'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Activity, ArrowLeft, Calendar, Clock, User, Mail, Phone, CreditCard, CheckCircle2, Video, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const doctorId = searchParams.get('doctor')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const doctorName = searchParams.get('name') || 'Médico'
  const specialty = searchParams.get('specialty') || ''
  const price = searchParams.get('price') || '0'

  const [step, setStep] = useState<'info' | 'payment' | 'confirmed'>('info')
  const [loading, setLoading] = useState(false)
  const [appointmentId, setAppointmentId] = useState('')
  const [meetLink, setMeetLink] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', reason: '', notes: ''
  })

  function formatDate(d: string) {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('payment')
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, date, time, ...form, price, doctorName, specialty })
      })
      const data = await res.json()
      
      if (data.success && data.checkoutUrl) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.checkoutUrl
      } else {
        alert('Erro ao iniciar pagamento: ' + (data.error || 'Tente novamente'))
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center border border-primary/20 shadow-[0_0_40px_rgba(0,242,254,0.1)]">
          <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Consulta Confirmada!</h1>
          <p className="text-gray-400 mb-6 text-sm">Enviamos os detalhes para <strong className="text-white">{form.email}</strong></p>
          
          <div className="glass rounded-2xl p-5 mb-6 border border-white/5 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-gray-300">{doctorName} · {specialty}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-gray-300">{date ? formatDate(date) : ''} às {time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Video className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-gray-300 break-all">{meetLink}</span>
            </div>
          </div>

          <a href={meetLink} target="_blank" rel="noopener noreferrer"
            className="w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-3 hover:bg-primary/90 transition-all">
            <Video className="h-4 w-4" /> Entrar na Sala de Vídeo
          </a>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/medico/${doctorId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-white">Virtua<span className="text-gradient">Doctor</span></span>
          </div>
          <div className="text-xs text-gray-500">Checkout Seguro 🔒</div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-8">
          {['Seus Dados', 'Pagamento'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 text-sm font-medium ${i === 0 && step === 'info' ? 'text-primary' : i === 1 && step === 'payment' ? 'text-primary' : 'text-gray-500'}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${(i === 0 && step === 'info') || (i === 1 && step === 'payment') ? 'bg-primary text-black font-bold' : step === 'payment' && i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}>
                  {step === 'payment' && i === 0 ? '✓' : i + 1}
                </span>
                {s}
              </div>
              {i < 1 && <div className={`flex-1 h-px ${step === 'payment' ? 'bg-primary/30' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Summary (always visible) */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="glass rounded-2xl p-6 border border-white/5 sticky top-24">
              <h3 className="text-white font-bold mb-4">Resumo da Consulta</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-black font-bold flex-shrink-0">
                    {doctorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{doctorName}</p>
                    <p className="text-xs text-primary">{specialty}</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{date ? formatDate(date) : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Video className="h-4 w-4 text-primary" />
                    <span>Videochamada HD</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Consulta</span>
                  <span>R$ {price}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {price}</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-400">Pagamento 100% seguro via Mercado Pago</p>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2">
            {step === 'info' && (
              <form onSubmit={handleInfoSubmit} className="glass rounded-2xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Seus Dados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Nome Completo *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">E-mail *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Telefone / WhatsApp *</label>
                    <input required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">CPF *</label>
                    <input required value={form.cpf} onChange={e => setForm(f => ({...f, cpf: e.target.value}))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="000.000.000-00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Motivo da Consulta *</label>
                    <input required value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="Ex: Consulta de rotina, ansiedade, dor no peito..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Observações (opcional)</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                      placeholder="Medicamentos em uso, histórico relevante, sintomas..." />
                  </div>
                </div>
                <button type="submit"
                  className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,242,254,0.2)]">
                  Continuar para Pagamento <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePayment} className="glass rounded-2xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Pagamento
                </h2>
                <p className="text-gray-400 text-sm mb-6">Escolha a forma de pagamento de sua preferência</p>
                
                <div className="space-y-3 mb-8">
                  {[
                    { id: 'pix', label: 'Pix', desc: 'Aprovação instantânea', badge: 'Recomendado', icon: '⚡' },
                    { id: 'card', label: 'Cartão de Crédito/Débito', desc: 'Visa, Mastercard, Elo e outros', badge: '', icon: '💳' },
                    { id: 'boleto', label: 'Boleto Bancário', desc: 'Vence em 3 dias úteis', badge: '', icon: '📄' },
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10">
                      <input type="radio" name="payment" value={opt.id} defaultChecked={opt.id === 'pix'} className="accent-primary h-4 w-4" />
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{opt.label}</span>
                          {opt.badge && <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-semibold">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <p className="text-xs text-gray-400 text-center">
                    🔒 Pagamento processado com segurança pelo <strong className="text-white">Mercado Pago</strong>.
                    Seus dados financeiros nunca são armazenados em nossos servidores.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6 text-left">
                  <p className="text-xs text-primary font-semibold mb-1">📧 Como funciona após o pagamento:</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Após confirmar o pagamento, você receberá um <strong className="text-white">e-mail com o link da videochamada</strong> e todos os detalhes da consulta. 
                    Para Pix, pode levar até 5 minutos para a confirmação chegar.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('info')}
                    className="flex-1 border border-white/10 text-gray-400 hover:text-white font-semibold py-4 rounded-xl transition-all">
                    Voltar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-2 flex-[2] bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirmar Pagamento · R$ {price}</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

