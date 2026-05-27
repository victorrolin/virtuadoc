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
      .select('id, signed_file_url, is_signed, medications')
      .or(`id.eq.${id},appointment_id.eq.${id}`)
      .maybeSingle()

    let isExam = false
    try {
      const meds = typeof data?.medications === 'string' ? JSON.parse(data.medications) : data?.medications
      isExam = meds && meds.isExam === true
    } catch (e) {
      isExam = false
    }

    if (data?.is_signed && data?.signed_file_url) {
      try {
        // PROXY: Em vez de redirecionar (que pode falhar em iPhones/Safari), 
        // buscamos o PDF e servimos diretamente do nosso domínio.
        const pdfResponse = await fetch(data.signed_file_url)
        
        if (!pdfResponse.ok) {
          throw new Error('Falha ao buscar o PDF original')
        }

        const pdfBuffer = await pdfResponse.arrayBuffer()
        const fileName = isExam ? 'aso-ocupacional.pdf' : 'receita-digital.pdf'

        return new Response(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
      } catch (proxyError) {
        console.error('Proxy fetch failed, redirecting client directly to Supabase URL:', proxyError)
        return redirect(data.signed_file_url)
      }
    }

    // Se não achar o PDF assinado, redireciona para a página de visualização correspondente.
    const baseUrl = new URL(request.url).origin
    const docId = data?.id || id
    if (isExam) {
      return redirect(`${baseUrl}/exames/${docId}`)
    }
    return redirect(`${baseUrl}/prescriptions/${docId}`)
  } catch (error) {
    console.error('Redirect/Proxy error:', error)
    return redirect('/')
  }
}
