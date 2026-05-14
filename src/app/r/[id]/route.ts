import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    // Buscar o link do arquivo assinado no banco
    // Usamos .or para garantir que encontre tanto pelo ID da receita quanto pelo ID do agendamento
    const { data, error } = await supabase
      .from('prescriptions')
      .select('signed_file_url, is_signed')
      .or(`id.eq.${id},appointment_id.eq.${id}`)
      .maybeSingle()

    console.log('Redirect debug:', { id, hasData: !!data, isSigned: data?.is_signed, hasUrl: !!data?.signed_file_url })

    if (data?.is_signed && data?.signed_file_url) {
      // Se já estiver assinado, abre o PDF direto
      return redirect(data.signed_file_url)
    }

    // Se não achar o PDF assinado, redireciona para a página de visualização da receita.
    return redirect(`/prescriptions/${id}`)
  } catch (error) {
    console.error('Redirect error:', error)
    return redirect('/')
  }
}
