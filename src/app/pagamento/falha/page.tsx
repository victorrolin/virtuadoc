import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function PagamentoFalha() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="max-w-md w-full glass rounded-3xl p-10 text-center border border-red-500/20">
        <div className="h-20 w-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Pagamento não realizado</h1>
        <p className="text-gray-400 text-sm mb-8">
          O seu pagamento não foi concluído. Nenhum valor foi cobrado. Tente novamente ou escolha outra forma de pagamento.
        </p>
        <Link href="/medicos" className="w-full bg-primary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
          <ArrowLeft className="h-4 w-4" /> Tentar Novamente
        </Link>
      </div>
    </div>
  )
}
