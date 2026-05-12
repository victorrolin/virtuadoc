import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DoctorProfileForm } from '@/components/DoctorProfileForm'
import { UserCircle } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, crm, specialties, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'doctor') return redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> Meu Perfil
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Atualize sua foto e bio que aparecem para os pacientes.
        </p>
      </div>
      <DoctorProfileForm profile={profile} />
    </div>
  )
}
