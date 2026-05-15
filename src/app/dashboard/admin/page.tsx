import { AdminDoctorForm } from '@/components/AdminDoctorForm'
import { DeleteDoctorButton } from '@/components/DeleteDoctorButton'
import { AdminAccountSettings } from '@/components/AdminAccountSettings'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Users, DollarSign, Activity, TrendingUp, Calendar } from 'lucide-react'
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

  // Estatísticas do Sistema
  const { count: doctorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'doctor')

  const { count: patientsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')

  const { data: allAppointments } = await supabase
    .from('appointments')
    .select('amount_paid, status')

  const totalRevenue = allAppointments?.reduce((acc, appt) => acc + (Number(appt.amount_paid) || 0), 0) || 0
  const platformProfit = totalRevenue * 0.20
  const doctorPayouts = totalRevenue * 0.80
  const completedAppts = allAppointments?.filter(a => a.status === 'completed').length || 0

  const { data: doctors } = await supabase
    .from('profiles')
    .select('id, full_name, crm, price_per_consultation, created_at, specialties')
    .eq('role', 'doctor')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Gestão da Plataforma
          </h1>
          <p className="text-gray-400 text-sm mt-1">Visão geral do ecossistema VirtuaDoc.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border-b-4 border-primary bg-primary/5">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-primary opacity-50" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </h3>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black">Lucro (20%)</p>
              <p className="text-sm font-bold text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformProfit)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-black">Repasse (80%)</p>
              <p className="text-sm font-bold text-gray-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doctorPayouts)}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-b-4 border-secondary bg-secondary/5">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Médicos Ativos</p>
          <h3 className="text-2xl font-bold text-white mt-1">{doctorsCount || 0}</h3>
          <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest">Corpo Clínico Ativo</p>
        </div>

        <div className="glass p-6 rounded-2xl border-b-4 border-teal-500 bg-teal-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-teal-400" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Consultas Realizadas</p>
          <h3 className="text-2xl font-bold text-white mt-1">{completedAppts}</h3>
          <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest">Sucesso Operacional</p>
        </div>

        <div className="glass p-6 rounded-2xl border-b-4 border-orange-500 bg-orange-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Pacientes</p>
          <h3 className="text-2xl font-bold text-white mt-1">{patientsCount || 0}</h3>
          <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest">Base de Usuários</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdminDoctorForm />

        <div className="glass p-8 rounded-3xl lg:col-span-2 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-white">Corpo Clínico</h2>
            </div>
            <span className="text-xs text-gray-500">{doctorsCount} profissionais</span>
          </div>

          <div className="space-y-4">
            {doctors && doctors.length > 0 ? (
              doctors.map((doc) => {
                const specList = doc.specialties || "Nenhuma especialidade"
                
                return (
                  <div key={doc.id} className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary flex items-center justify-center font-black text-lg border border-white/10 group-hover:scale-105 transition-transform">
                        {doc.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{doc.full_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-white/5">CRM: {doc.crm}</span>
                          <span className="text-xs text-green-400 font-bold">R$ {doc.price_per_consultation}</span>
                        </div>
                        <p className="text-[10px] text-primary mt-2 font-bold uppercase tracking-tighter opacity-80">{specList}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Status</span>
                        <span className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Disponível
                        </span>
                      </div>
                      <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                      <DeleteDoctorButton doctorId={doc.id} />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 italic">
                Nenhum médico cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configurações de conta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <AdminAccountSettings />
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-center gap-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Governança & Segurança
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
              <p className="text-white text-sm font-bold mb-1">Acesso Hierárquico</p>
              <p className="text-gray-400 text-xs leading-relaxed">Admins têm permissão total para gerenciar fluxos financeiros e remover profissionais.</p>
            </div>
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
              <p className="text-white text-sm font-bold mb-1">Auditoria de CRM</p>
              <p className="text-gray-400 text-xs leading-relaxed">Certifique-se de validar os dados no portal do CFM antes de ativar novos médicos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

