import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    // Buscar o link do arquivo assinado no banco
    const { data, error } = await supabase
      .from('prescriptions')
      .select('signed_file_url')
      .eq('id', id)
      .single()

    if (data?.signed_file_url) {
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
