'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Activity, ArrowLeft, Calendar, Clock, User, Mail, Phone, CreditCard, CheckCircle2, Video, Loader2, FileText, Zap, Check, Copy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const doctorId = searchParams.get('doctor')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const doctorName = searchParams.get('name') || 'Médico'
  const specialty = searchParams.get('specialty') || ''
  const price = searchParams.get('price') || '0'

  const [step, setStep] = useState<'info' | 'review' | 'payment' | 'pix' | 'confirmed' | 'mp_opened'>('info')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [mpCheckoutUrl, setMpCheckoutUrl] = useState('')

  // Estado do Pix inline
  const [pixData, setPixData] = useState<{
    paymentId: string; qrCode: string; qrCodeBase64: string; meetLink: string
  } | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixStatus, setPixStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', reason: '', notes: '' })
  const handleInputChange = (key: string, value: string) => {
    let v = value
    if (key === 'phone') {
      v = v.replace(/\D/g, '').slice(0, 11)
      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
      if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`
    } else if (key === 'cpf') {
      v = v.replace(/\D/g, '').slice(0, 11)
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    setForm(prev => ({ ...prev, [key]: v }))
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  }

  // Polling de status do MP (Checkout Pro ou Pix inline)
  const startPolling = useCallback((params: { externalRef?: string; paymentId?: string }) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const query = params.paymentId 
          ? `payment_id=${params.paymentId}` 
          : `external_reference=${params.externalRef}`
          
        const res = await fetch(`/api/checkout/status?${query}`)
        const data = await res.json()
        
        if (data.status === 'approved') {
          clearInterval(pollingRef.current!)
          if (params.paymentId) {
            setPixStatus('approved')
            setTimeout(() => {
              router.push(`/pagamento/sucesso?payment_id=${data.id}`)
            }, 2000)
          } else {
            router.push(`/pagamento/sucesso?payment_id=${data.id}`)
          }
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          if (params.paymentId) {
            setPixStatus('rejected')
            clearInterval(pollingRef.current!)
          }
        }
      } catch { /* continua tentando */ }
    }, 5000)
  }, [router, setPixStatus])

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current) }, [])

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Se for Pix, chamamos o endpoint de Pix direto (Checkout Transparente)
    if (paymentMethod === 'pix') {
      try {
        const res = await fetch('/api/checkout/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId, date, time, ...form, price, doctorName, specialty }),
        })
        const data = await res.json()
        if (data.success && data.paymentId) {
          setPixData({
            paymentId: data.paymentId,
            qrCode: data.qrCode,
            qrCodeBase64: data.qrCodeBase64,
            meetLink: data.meetLink
          })
          setPixStatus('pending')
          setStep('pix')
          
          // Inicia polling com o paymentId
          startPolling({ paymentId: data.paymentId })
        } else {
          alert('Erro ao gerar Pix: ' + (data.error || 'Tente novamente'))
        }
      } catch (err) {
        console.error('Erro de conexão ao gerar Pix:', err)
        alert('Erro de conexão. Tente novamente.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Para outros métodos (Cartão, Boleto), usamos Checkout Pro
    let newWindow: Window | null = null
    
    if (!isMobile) {
      try {
        // Abre a janela de forma síncrona para não ser bloqueada pelo pop-up blocker no desktop
        newWindow = window.open('about:blank', '_blank')
      } catch (err) {
        console.error('Falha ao abrir nova aba:', err)
      }
    }
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, date, time, ...form, price, doctorName, specialty, paymentMethod }),
      })
      const data = await res.json()
      
      if (data.success && data.checkoutUrl) {
        setMpCheckoutUrl(data.checkoutUrl)
        
        if (isMobile) {
          // No celular, redireciona diretamente na mesma aba para evitar pop-up blocker
          window.location.assign(data.checkoutUrl)
        } else {
          // No computador
          if (newWindow) {
            newWindow.location.href = data.checkoutUrl
            setStep('mp_opened')
            
            // Inicia o polling na aba original
            if (data.externalReference) {
              startPolling({ externalRef: data.externalReference })
            }
          } else {
            // Se o popup blocker do desktop bloqueou a nova aba síncrona
            window.location.assign(data.checkoutUrl)
          }
        }
      } else {
        if (newWindow) newWindow.close()
        alert('Erro ao iniciar pagamento: ' + (data.error || 'Tente novamente'))
      }
    } catch { 
      if (newWindow) newWindow.close()
      alert('Erro de conexão. Tente novamente.') 
    }
    finally { setLoading(false) }
  }

  function copyPix() {
    if (!pixData?.qrCode) return
    navigator.clipboard.writeText(pixData.qrCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 3000)
  }

  // ── Tela Pix inline ──────────────────────────────────────────
  if (step === 'pix' && pixData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">

          {/* Status do pagamento */}
          {pixStatus === 'approved' && (
            <div className="glass rounded-3xl p-8 text-center border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
              <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Pix Confirmado! 🎉</h1>
              <p className="text-gray-400 text-sm mb-4">Sua consulta está agendada. Redirecionando...</p>
              <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />
            </div>
          )}

          {pixStatus === 'pending' && (
            <div className="glass rounded-3xl p-6 border border-primary/20">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  Aguardando pagamento...
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Pague com Pix</h2>
                <p className="text-gray-400 text-xs">Escaneie o QR code ou copie o código abaixo</p>
              </div>

              {/* QR Code */}
              {pixData.qrCodeBase64 && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.1)]">
                    <Image
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code Pix"
                      width={180} height={180}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Valor */}
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-white">R$ {price}</p>
                <p className="text-xs text-gray-500">Válido por 30 minutos</p>
              </div>

              {/* Código copia-e-cola */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Código Pix (Copia e Cola)</p>
                <div className="flex gap-2">
                  <input
                    readOnly value={pixData.qrCode}
                    className="flex-1 bg-black/40 border border-white/10 text-gray-300 rounded-xl px-3 py-2.5 text-[10px] font-mono focus:outline-none truncate"
                  />
                  <button
                    onClick={copyPix}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      pixCopied ? 'bg-green-500 text-black' : 'bg-primary text-black hover:bg-primary/90'
                    }`}
                  >
                    {pixCopied ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                  </button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1.5 mb-4">
                {['Abra o app do seu banco', 'Vá em Pix → Pagar com QR Code ou Copia e Cola', 'Confirme o pagamento', 'Esta página atualiza automaticamente ✓'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                    <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verificando pagamento automaticamente...
              </div>
            </div>
          )}

          {pixStatus === 'rejected' && (
            <div className="glass rounded-3xl p-8 text-center border border-red-500/20">
              <h2 className="text-xl font-bold text-white mb-2">Pagamento não realizado</h2>
              <p className="text-gray-400 text-sm mb-4">O código Pix expirou ou foi cancelado.</p>
              <button onClick={() => setStep('payment')} className="bg-primary text-black font-bold px-6 py-3 rounded-xl">
                Tentar novamente
              </button>
            </div>
          )}

          <Link href="/" className="block text-center text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Cancelar e voltar
          </Link>
        </div>
      </div>
    )
  }

  // ── Tela confirmada (Cartão aprovado — raramente usada, MP redireciona) ──
  if (step === 'confirmed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center border border-primary/20">
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Consulta Confirmada!</h1>
          <Link href="/dashboard/minhas-consultas" className="mt-6 w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            <Video className="h-4 w-4" /> Ver Minhas Consultas
          </Link>
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
          {['Dados', 'Revisão', 'Pagamento'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
               <div className={`flex items-center gap-2 text-sm font-medium ${
                (i === 0 && step === 'info') || (i === 1 && step === 'review') || (i === 2 && step === 'payment') ? 'text-primary' : 'text-gray-500'
              }`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                  ((i === 0 && step === 'info') || (i === 1 && step === 'review') || (i === 2 && step === 'payment'))
                    ? 'bg-primary text-black font-bold'
                    : (step === 'payment' || (step === 'review' && i === 0)) ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'
                }`}>
                  {(step === 'payment' && i < 2) || (step === 'review' && i === 0) ? '✓' : i + 1}
                </span>
                {s}
              </div>
              {i < 2 && <div className={`flex-1 h-px ${(step === 'payment' || (step === 'review' && i === 0)) ? 'bg-primary/30' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Order Summary */}
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
                  <div className="flex items-center gap-2 text-gray-400"><Calendar className="h-4 w-4 text-primary" /><span>{date ? formatDate(date) : ''}</span></div>
                  <div className="flex items-center gap-2 text-gray-400"><Clock className="h-4 w-4 text-primary" /><span>{time}</span></div>
                  <div className="flex items-center gap-2 text-gray-400"><Video className="h-4 w-4 text-primary" /><span>Videochamada HD</span></div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span><span>R$ {price}</span>
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
              <form onSubmit={(e) => { e.preventDefault(); setStep('review') }} className="glass rounded-2xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Seus Dados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {[
                    { col: 2, label: 'Nome Completo *', key: 'name', type: 'text', ph: 'Seu nome completo', pattern: undefined, title: '' },
                    { col: 1, label: 'E-mail *', key: 'email', type: 'email', ph: 'seu@email.com', pattern: undefined, title: '' },
                    { col: 1, label: 'WhatsApp *', key: 'phone', type: 'tel', ph: '(11) 99999-9999', pattern: '^\\(\\d{2}\\) \\d{5}-\\d{4}$', title: 'O telefone deve estar no formato (99) 99999-9999' },
                    { col: 1, label: 'CPF *', key: 'cpf', type: 'text', ph: '000.000.000-00', pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$', title: 'O CPF deve estar no formato 000.000.000-00' },
                  ].map(f => (
                    <div key={f.key} className={f.col === 2 ? 'md:col-span-2' : ''}>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                      <input required type={f.type} value={form[f.key as keyof typeof form]} onChange={e => handleInputChange(f.key, e.target.value)}
                        pattern={f.pattern} title={f.title}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                        placeholder={f.ph} />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Motivo da Consulta *</label>
                    <input required value={form.reason} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="Ex: Consulta de rotina, ansiedade..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Observações (opcional)</label>
                    <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={3}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                      placeholder="Medicamentos em uso, sintomas..." />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  Continuar para Pagamento <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </form>
            )}

            {step === 'review' && (
              <form onSubmit={(e) => { e.preventDefault(); setStep('payment') }} className="glass rounded-2xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Confirme seus Dados
                </h2>
                <p className="text-gray-400 text-sm mb-8">Verifique se as informações estão corretas.</p>
                <div className="space-y-4 mb-10">
                  {[
                    { label: 'Paciente', value: form.name, icon: User },
                    { label: 'E-mail', value: form.email, icon: Mail },
                    { label: 'WhatsApp', value: form.phone, icon: Phone },
                    { label: 'CPF', value: form.cpf, icon: CheckCircle2 },
                    { label: 'Motivo', value: form.reason, icon: Activity },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-0.5">{item.label}</p>
                        <p className="text-white font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('info')} className="flex-1 border border-white/10 text-gray-400 hover:text-white font-semibold py-4 rounded-xl transition-all">Corrigir Dados</button>
                  <button type="submit" className="flex-[2] bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    Tudo Correto, Pagar <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePayment} className="glass rounded-2xl p-8 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Pagamento
                </h2>
                <p className="text-gray-400 text-sm mb-6">Escolha a forma de pagamento</p>

                <div className="space-y-3 mb-8">
                  {[
                    { id: 'pix', label: 'Pix', desc: 'QR Code gerado aqui mesmo — sem sair da página', badge: 'Recomendado', icon: '⚡' },
                    { id: 'card', label: 'Cartão de Crédito/Débito', desc: 'Visa, Mastercard, Elo e outros', badge: '', icon: '💳' },
                    { id: 'boleto', label: 'Boleto Bancário', desc: 'Vence em 3 dias úteis', badge: '', icon: '📄' },
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10">
                      <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="accent-primary h-4 w-4" />
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

                {paymentMethod === 'pix' && (
                  <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-3">
                    <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      O QR Code Pix será gerado <strong className="text-white">aqui mesmo</strong> — você não será redirecionado para o Mercado Pago. Após pagar, esta página detecta automaticamente e confirma sua consulta.
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                  <p className="text-xs text-gray-400 text-center">🔒 Pagamento processado com segurança pelo <strong className="text-white">Mercado Pago</strong>.</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('review')} className="flex-1 border border-white/10 text-gray-400 hover:text-white font-semibold py-4 rounded-xl transition-all">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirmar Pagamento · R$ {price}</>}
                  </button>
                </div>
              </form>
            )}

            {step === 'mp_opened' && (
              <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white mb-4">Pagamento aberto em nova guia</h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Conclua o pagamento na aba do Mercado Pago que acabou de ser aberta.<br/>
                  Assim que finalizar, a nova aba confirmará sua consulta automaticamente.
                </p>
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-8">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Se a nova aba não abriu, seu navegador pode ter bloqueado o pop-up. Clique no botão abaixo para abrir manualmente.
                  </p>
                </div>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <a href={mpCheckoutUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    Abrir Mercado Pago Novamente <ArrowLeft className="h-4 w-4 rotate-180" />
                  </a>
                  <button onClick={() => setStep('payment')} className="w-full border border-white/10 text-gray-400 hover:text-white font-semibold py-3 rounded-xl transition-all text-sm">
                    Voltar e escolher outro método
                  </button>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Verificando status do pagamento automaticamente...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
