import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let { id } = await params
  
  // Remover .pdf se estiver presente para buscar no banco apenas pelo ID original
  if (id.endsWith('.pdf')) {
    id = id.replace('.pdf', '')
  }

  try {
    // Usar Service Client para ignorar RLS e encontrar a receita para o paciente (que não está logado)
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select('signed_file_url, is_signed')
      .or(`id.eq.${id},appointment_id.eq.${id}`)
      .maybeSingle()

    if (data?.is_signed && data?.signed_file_url) {
      // PROXY: Em vez de redirecionar (que pode falhar em iPhones/Safari), 
      // buscamos o PDF e servimos diretamente do nosso domínio.
      const pdfResponse = await fetch(data.signed_file_url)
      
      if (!pdfResponse.ok) {
        throw new Error('Falha ao buscar o PDF original')
      }

      const pdfBuffer = await pdfResponse.arrayBuffer()

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="receita-digital.pdf"',
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
    console.error('Redirect/Proxy error:', error)
    return redirect('/')
  }
}
