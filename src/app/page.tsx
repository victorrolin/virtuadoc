import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Activity, ArrowRight, Video, Calendar, Shield, CheckCircle2, Star, Clock, Users, ChevronDown, Phone, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: doctors } = await supabase
    .from('profiles')
    .select('id, full_name, specialties, price_per_consultation, bio, crm')
    .eq('role', 'doctor')
    .limit(6)

  // Extrair especialidades únicas dos médicos
  const allSpecs = doctors?.flatMap(d => 
    d.specialties ? d.specialties.split(',').map((s: string) => s.trim()) : []
  ) || []
  const uniqueSpecs = [...new Set(allSpecs)].slice(0, 8)

  const specIcons: Record<string, string> = {
    'Clínico Geral': '🩺', 'Psiquiatra': '🧠', 'Psicólogo': '💭',
    'Cardiologista': '❤️', 'Dermatologista': '🌿', 'Pediatra': '👶',
    'Ginecologista': '🌸', 'Ortopedista': '🦴', 'Clínico geral': '🩺',
  }

  const faqs = [
    { q: 'Como funciona a consulta online?', a: 'Após o pagamento, você recebe um link de videochamada por e-mail. No horário marcado, clique no link e entre na sala virtual com seu médico.' },
    { q: 'O pagamento é seguro?', a: 'Sim! Utilizamos o Mercado Pago, plataforma líder em pagamentos online no Brasil, com criptografia de ponta a ponta.' },
    { q: 'Posso cancelar ou remarcar?', a: 'Sim, cancelamentos com mais de 24h de antecedência são reembolsados integralmente. Reagendamentos podem ser feitos com 12h de antecedência.' },
    { q: 'Preciso criar uma conta?', a: 'Não é obrigatório para agendar, mas recomendamos criar uma conta para acessar seu histórico de consultas e documentos.' },
    { q: 'Qual equipamento preciso?', a: 'Basta um smartphone, tablet ou computador com câmera e microfone, além de conexão à internet.' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white">
              Lumina<span className="text-gradient">Health</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#especialidades" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Especialidades</a>
            <a href="#medicos" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Médicos</a>
            <a href="#como-funciona" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Como Funciona</a>
            <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block">Entrar</Link>
            <Link href="/medicos" className="bg-gradient-to-r from-primary to-cyan-400 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] hover:scale-105">
              Agendar Agora
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-28 pb-24 lg:pt-40 lg:pb-36 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Telemedicina Premium · 100% Online</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
              Saúde de qualidade<br />
              <span className="text-gradient">sem sair de casa</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Consulte os melhores especialistas do Brasil por videochamada. 
              Agende em minutos, pague com segurança e receba atendimento no conforto da sua casa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/medicos" className="w-full sm:w-auto bg-white text-gray-950 font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                Encontrar Meu Médico <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#como-funciona" className="w-full sm:w-auto border border-white/10 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:bg-white/5 flex items-center justify-center gap-2">
                Como Funciona
              </a>
            </div>

            {/* Social proof bar */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              {[
                { num: '500+', label: 'Consultas Realizadas' },
                { num: '50+', label: 'Especialistas' },
                { num: '4.9★', label: 'Avaliação Média' },
                { num: '24h', label: 'Suporte Disponível' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-white">{stat.num}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Especialidades */}
        <section id="especialidades" className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nossas Especialidades</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Atendimento especializado para todas as suas necessidades de saúde</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uniqueSpecs.length > 0 ? uniqueSpecs.map(spec => (
                <Link key={spec} href={`/medicos?especialidade=${encodeURIComponent(spec)}`}
                  className="group glass p-5 rounded-2xl text-center hover:bg-primary/10 hover:border-primary/20 border border-white/5 transition-all hover:scale-105">
                  <div className="text-3xl mb-3">{specIcons[spec] || '⚕️'}</div>
                  <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{spec}</p>
                </Link>
              )) : (
                // Especialidades de exemplo se não houver médicos cadastrados
                ['Clínico Geral 🩺', 'Psiquiatra 🧠', 'Cardiologista ❤️', 'Dermatologista 🌿', 'Pediatra 👶', 'Ginecologista 🌸', 'Ortopedista 🦴', 'Neurologia 🔬'].map(s => {
                  const [name, icon] = s.split(' ')
                  return (
                    <Link key={name} href="/medicos" className="group glass p-5 rounded-2xl text-center hover:bg-primary/10 border border-white/5 transition-all hover:scale-105">
                      <div className="text-3xl mb-3">{icon}</div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* Médicos */}
        {doctors && doctors.length > 0 && (
          <section id="medicos" className="py-20 border-t border-white/5 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Conheça Nossos Especialistas</h2>
                <p className="text-gray-400 max-w-xl mx-auto">Profissionais verificados e altamente qualificados prontos para te atender</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doc => (
                  <div key={doc.id} className="glass rounded-3xl p-6 hover:shadow-[0_0_30px_rgba(0,242,254,0.1)] hover:scale-[1.02] transition-all group border border-white/5">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-black font-bold text-2xl shadow-lg flex-shrink-0">
                        {doc.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{doc.full_name}</h3>
                        <p className="text-sm text-primary font-medium">{doc.specialties || 'Especialista'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />)}
                          <span className="text-xs text-gray-400 ml-1">5.0</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-5 line-clamp-2">{doc.bio || 'Especialista comprometido em oferecer atendimento humanizado e de alta qualidade por telemedicina.'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div>
                        <p className="text-xs text-gray-500">Consulta a partir de</p>
                        <p className="text-xl font-bold text-white">R$ {doc.price_per_consultation || '—'}</p>
                      </div>
                      <Link href={`/medico/${doc.id}`}
                        className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center gap-1.5">
                        Agendar <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/medicos" className="inline-flex items-center gap-2 border border-white/10 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/5 transition-all">
                  Ver todos os médicos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Como Funciona */}
        <section id="como-funciona" className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como Funciona</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Da escolha do médico até a consulta em apenas 4 passos simples</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Linha conectora */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              {[
                { icon: Users, step: '01', title: 'Escolha o Especialista', desc: 'Filtre por especialidade e escolha o médico ideal para sua necessidade', color: 'text-primary' },
                { icon: Calendar, step: '02', title: 'Selecione o Horário', desc: 'Veja a agenda em tempo real e escolha o melhor dia e hora para você', color: 'text-cyan-400' },
                { icon: Shield, step: '03', title: 'Pagamento Seguro', desc: 'Pague com cartão, Pix ou boleto via Mercado Pago com total segurança', color: 'text-green-400' },
                { icon: Video, step: '04', title: 'Consulta Online', desc: 'Receba o link da videochamada e consulte no horário marcado', color: 'text-purple-400' },
              ].map(({ icon: Icon, step, title, desc, color }) => (
                <div key={step} className="glass p-6 rounded-2xl text-center border border-white/5 relative">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 mb-4 mx-auto relative">
                    <Icon className={`h-7 w-7 ${color}`} />
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">{step.replace('0', '')}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Por que escolher a LuminaHealth?</h2>
                <div className="space-y-5">
                  {[
                    { icon: Clock, title: 'Atendimento Imediato', desc: 'Sem filas, sem espera. Agenda disponível 7 dias por semana.', color: 'text-primary' },
                    { icon: Shield, title: 'Privacidade Total', desc: 'Dados protegidos por criptografia de ponta a ponta. Sigilo médico garantido.', color: 'text-green-400' },
                    { icon: Zap, title: 'Tecnologia de Ponta', desc: 'Videochamadas em HD com zero latência. Funciona em qualquer dispositivo.', color: 'text-yellow-400' },
                    { icon: Phone, title: 'Suporte 24/7', desc: 'Nossa equipe está disponível a qualquer hora para te ajudar.', color: 'text-cyan-400' },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{title}</h3>
                        <p className="text-gray-400 text-sm">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl p-8 border border-white/5">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pronto para começar?</h3>
                  <p className="text-gray-400 text-sm">Agende sua primeira consulta agora mesmo</p>
                </div>
                <div className="space-y-3">
                  {['Médicos verificados pelo CFM', 'Receitas e atestados digitais', 'Histórico médico online', 'Prescrição enviada por e-mail'].map(f => (
                    <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/medicos" className="mt-8 w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                  Agendar Minha Consulta <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
              <p className="text-gray-400">Tire suas dúvidas antes de agendar</p>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <details key={q} className="glass rounded-2xl border border-white/5 group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-semibold text-white pr-4">{q}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Sua saúde não pode esperar.<br />
              <span className="text-gradient">Agende agora.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a centenas de pacientes que já cuidam da saúde com praticidade e segurança. 
              Primeira consulta com satisfação garantida.
            </p>
            <Link href="/medicos" className="inline-flex items-center gap-3 bg-white text-gray-950 font-bold px-10 py-5 rounded-full text-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Começar Agora <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-white">Lumina<span className="text-gradient">Health</span></span>
              </div>
              <p className="text-gray-500 text-sm">Telemedicina premium para quem valoriza saúde e tempo.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Plataforma</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <div><Link href="/medicos" className="hover:text-white transition-colors">Nossos Médicos</Link></div>
                <div><Link href="#especialidades" className="hover:text-white transition-colors">Especialidades</Link></div>
                <div><Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Suporte</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <div><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></div>
                <div><a href="mailto:suporte@luminahealth.com.br" className="hover:text-white transition-colors">Contato</a></div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <div><Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link></div>
                <div><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></div>
                <div><Link href="#" className="hover:text-white transition-colors">LGPD</Link></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-sm text-gray-600">
            © 2026 LuminaHealth. Todos os direitos reservados. · CFM · Telemedicina regulamentada no Brasil
          </div>
        </div>
      </footer>
    </div>
  )
}
