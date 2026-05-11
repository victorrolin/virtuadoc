import { createDoctor } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, UserPlus, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/dashboard')
  }

  const { data: doctors } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'doctor')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-gray-400">Gerencie a plataforma e os profissionais cadastrados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação de Médico */}
        <div className="glass p-6 rounded-2xl h-fit lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-white">Novo Médico</h2>
          </div>
          
          <form action={createDoctor} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Nome Completo</label>
              <input name="full_name" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">E-mail de Login</label>
              <input type="email" name="email" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Senha Inicial</label>
              <input type="password" name="password" required minLength={6} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-xs font-medium text-gray-400">CRM</label>
                <input name="crm" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-xs font-medium text-gray-400">Valor (R$)</label>
                <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary text-sm" />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-all">
              Cadastrar Médico
            </button>
          </form>
        </div>

        {/* Lista de Médicos */}
        <div className="glass p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-white">Médicos Cadastrados</h2>
          </div>

          <div className="space-y-4">
            {doctors?.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum médico cadastrado ainda.</p>
            ) : (
              doctors?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {doc.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{doc.full_name}</h3>
                      <p className="text-xs text-gray-400">CRM: {doc.crm} • R$ {doc.price_per_consultation}</p>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                    Ativo
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
