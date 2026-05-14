import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    // Buscar os dados frescos do banco sem cache
    const { data, error } = await supabase
      .from('prescriptions')
      .select('signed_file_url, is_signed')
      .or(`id.eq.${id},appointment_id.eq.${id}`)
      .maybeSingle()

    if (error) {
      console.error('Database error in redirect:', error)
    }

    if (data?.is_signed && data?.signed_file_url) {
      // Retornar um redirecionamento 302 (temporário) com headers de no-cache
      return new Response(null, {
        status: 302,
        headers: {
          'Location': data.signed_file_url,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
    }

    // Se não achar o PDF assinado, redireciona para a página de visualização da receita.
    const baseUrl = new URL(request.url).origin
    return redirect(`${baseUrl}/prescriptions/${id}`)
  } catch (error) {
    console.error('Redirect error:', error)
    return redirect('/')
  }
}
