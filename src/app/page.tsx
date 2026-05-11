import Link from 'next/link';
import { Calendar, Video, Activity, Users, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b-0 border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white">
              Lumina<span className="text-gradient">Health</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#especialidades" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Especialidades</Link>
            <Link href="#medicos" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Médicos</Link>
            <Link href="#como-funciona" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Como Funciona</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Entrar</Link>
            <Link href="/agendar" className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-gray-900 font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)]">
              Agendar Consulta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-gray-300">Telemedicina do Futuro, Agora</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
              Sua saúde a um clique <br className="hidden md:block" />
              de <span className="text-gradient">distância</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Conecte-se com os melhores especialistas do país através de videochamadas seguras. Agende sua consulta em minutos, sem sair de casa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/especialidades" className="w-full sm:w-auto bg-white text-gray-950 font-bold px-8 py-4 rounded-full text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                Encontrar Médico <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#como-funciona" className="w-full sm:w-auto glass text-white font-semibold px-8 py-4 rounded-full text-lg transition-transform hover:scale-105 flex items-center justify-center">
                Saber Mais
              </Link>
            </div>
          </div>
        </section>

        {/* Features/Stats Section */}
        <section className="py-20 border-t border-white/5 relative bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Video className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Vídeo HD</h3>
                <p className="text-gray-400 text-sm">Consultas em alta definição com tecnologia de ponta, sem interrupções.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                  <Calendar className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Agendamento Fácil</h3>
                <p className="text-gray-400 text-sm">Escolha o horário que melhor se adapta à sua rotina diretamente na agenda do médico.</p>
              </div>

              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                  <Shield className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Seguro & Privado</h3>
                <p className="text-gray-400 text-sm">Dados criptografados de ponta a ponta e pagamentos seguros com Mercado Pago.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <span className="text-gray-400 font-semibold text-sm">LuminaHealth © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
