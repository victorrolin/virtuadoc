import Link from 'next/link'
import { Clock, Mail, Video, CheckCircle2, ArrowRight, Smartphone } from 'lucide-react'

export default function PagamentoPendente({
  searchParams,
}: {
  searchParams: { payment_id?: string; preference_id?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="max-w-md w-full space-y-4">
        {/* Card principal */}
        <div className="glass rounded-3xl p-8 text-center border border-primary/20 shadow-[0_0_40px_rgba(0,242,254,0.08)]">
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Aguardando Pagamento</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Seu <strong className="text-white">Pix foi gerado!</strong> Escaneie o QR code ou copie o código no app do seu banco para concluir o pagamento.
          </p>

          <div className="glass rounded-2xl p-5 border border-white/5 text-left space-y-4 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">O que acontece depois:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Pague o Pix no seu banco</p>
                  <p className="text-gray-500 text-xs">Escaneie o QR code ou copie e cole o código</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Confirmação automática</p>
                  <p className="text-gray-500 text-xs">Em até 5 minutos após o pagamento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Receba o link da consulta</p>
                  <p className="text-gray-500 text-xs">Enviamos por e-mail com todos os detalhes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3 text-left mb-6">
            <Smartphone className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400 leading-relaxed">
              <strong>Dica:</strong> Volte ao Mercado Pago e escaneie o QR code. Após confirmar no seu app bancário, aguarde o e-mail de confirmação com o link da videochamada.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="https://www.mercadopago.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all text-sm"
            >
              Voltar ao Mercado Pago <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/" className="w-full border border-white/10 text-gray-400 hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm">
              Ir para a página inicial
            </Link>
          </div>
        </div>

        {/* Info extra */}
        <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Ficou com dúvidas? Entre em contato: <strong className="text-white">suporte@virtuadoc.automatech.tech</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
