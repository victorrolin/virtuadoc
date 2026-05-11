import { AdminDoctorForm } from '@/components/AdminDoctorForm'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Users } from 'lucide-react'
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
    .select('id, full_name, crm, price_per_consultation, created_at, doctor_specialties(specialties(name))')
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
        
        {/* Formulário Interativo em Client Component */}
        <AdminDoctorForm />

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
              doctors?.map((doc) => {
                const specList = doc.doctor_specialties?.map((ds: any) => ds.specialties?.name).filter(Boolean).join(', ') || 'Nenhuma especialidade'
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {doc.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{doc.full_name}</h3>
                        <p className="text-xs text-gray-400">CRM: {doc.crm} • R$ {doc.price_per_consultation}</p>
                        <p className="text-xs text-primary mt-1 font-medium">{specList}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                        Ativo
                      </div>
                      {/* Futuramente: Botões de Editar e Trocar Senha */}
                      <button className="text-xs text-gray-400 hover:text-white underline">Editar</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
