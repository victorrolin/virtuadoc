import { AdminDoctorForm } from '@/components/AdminDoctorForm'
import { DeleteDoctorButton } from '@/components/DeleteDoctorButton'
import { AdminAccountSettings } from '@/components/AdminAccountSettings'
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
    .select('id, full_name, crm, price_per_consultation, created_at, specialties')
    .eq('role', 'doctor')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie a plataforma e os profissionais cadastrados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminDoctorForm />

        <div className="glass p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-white">Médicos Cadastrados</h2>
          </div>

          <div className="space-y-4">
            {doctors && doctors.length > 0 ? (
              doctors.map((doc) => {
                const specList = doc.specialties || "Nenhuma especialidade"
                
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
                      <button className="text-xs text-gray-400 hover:text-white underline">Editar</button>
                      <DeleteDoctorButton doctorId={doc.id} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-400 text-sm">Nenhum médico cadastrado ainda.</p>
            )}
          </div>
        </div>

      </div>

      {/* Configurações de conta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminAccountSettings />
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 flex flex-col justify-center gap-3">
          <h3 className="text-white font-semibold">💡 Sobre administradores</h3>
          <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
            <li>Admins criados aqui podem acessar o painel com e-mail e senha</li>
            <li>Cada admin pode trocar sua própria senha nesta seção</li>
            <li>Admins têm acesso total ao painel, incluindo criação de médicos</li>
          </ul>
        </div>
      </div>

    </div>
  )
}
