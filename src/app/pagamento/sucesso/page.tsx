import Link from 'next/link'
import { CheckCircle2, Video, Calendar, ArrowRight } from 'lucide-react'

export default function PagamentoSucesso({
  searchParams,
}: {
  searchParams: { payment_id?: string; status?: string; external_reference?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="max-w-md w-full glass rounded-3xl p-10 text-center border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
        <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Pagamento Confirmado!</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Seu pagamento foi aprovado! Em instantes você receberá um <strong className="text-white">e-mail com o link da videochamada</strong> e todos os detalhes da sua consulta.
        </p>

        <div className="glass rounded-2xl p-5 mb-8 border border-white/5 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
            Consulta agendada com sucesso
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Video className="h-4 w-4 text-primary flex-shrink-0" />
            Link da sala enviado por e-mail
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
            Entre no horário marcado
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/" className="w-full border border-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-sm">
            Voltar ao início
          </Link>
        </div>

        {searchParams.payment_id && (
          <p className="text-xs text-gray-600 mt-6">
            ID do pagamento: {searchParams.payment_id}
          </p>
        )}
      </div>
    </div>
  )
}
