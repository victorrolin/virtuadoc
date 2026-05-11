import Link from 'next/link'
import { CheckCircle2, Video, Calendar, Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function PagamentoSucesso({
  searchParams,
}: {
  searchParams: { payment_id?: string; status?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="max-w-md w-full space-y-4">

        {/* Card principal */}
        <div className="glass rounded-3xl p-8 text-center border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
          <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Pagamento Confirmado! 🎉</h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Sua consulta está agendada. Em instantes você receberá um{' '}
            <strong className="text-white">e-mail com o link da videochamada</strong> e todos os detalhes.
          </p>

          <div className="glass rounded-2xl p-4 mb-6 border border-white/5 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              Consulta agendada com sucesso
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              E-mail de confirmação sendo enviado
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Video className="h-4 w-4 text-cyan-400 flex-shrink-0" />
              Link da videochamada no e-mail
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
              Entre no horário marcado
            </div>
          </div>
        </div>

        {/* CTA Portal do Paciente - destaque */}
        <div className="glass rounded-3xl p-6 border border-primary/20 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-white font-semibold text-sm">Acompanhe sua consulta online</p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Acesse seu <strong className="text-white">Portal do Paciente</strong> para ver o link da videochamada, data, horário e histórico de consultas. Basta usar o e-mail do agendamento — sem precisar de senha!
          </p>
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-primary to-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Acessar Portal do Paciente
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link href="/" className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-2">
          Voltar à página inicial
        </Link>
      </div>
    </div>
  )
}
