import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

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

  const baseUrl = new URL(request.url).origin

  try {
    // Usar Service Client para ignorar RLS e encontrar a receita para o paciente (que não está logado)
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select('id, signed_file_url, is_signed, medications')
      .or(`id.eq.${id},appointment_id.eq.${id}`)
      .maybeSingle()

    // Detectar se é um exame (ASO) pelo campo isExam no JSON de medications
    let isExam = false
    try {
      const meds = typeof data?.medications === 'string' ? JSON.parse(data.medications) : data?.medications
      isExam = !!(meds && meds.isExam === true)
    } catch (e) {
      isExam = false
    }

    // Se o documento está assinado e tem URL do PDF, servir o PDF diretamente (proxy)
    if (data?.is_signed && data?.signed_file_url) {
      try {
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
        // Usa NextResponse.redirect() que NÃO lança exceção
        return NextResponse.redirect(data.signed_file_url)
      }
    }

    // Se não achar o PDF assinado, redireciona para a página de visualização correspondente
    const docId = data?.id || id
    if (isExam) {
      return NextResponse.redirect(`${baseUrl}/exames/${docId}`)
    }
    return NextResponse.redirect(`${baseUrl}/prescriptions/${docId}`)

  } catch (error) {
    console.error('Redirect/Proxy error:', error)
    // Último recurso: vai para a home (não deveria chegar aqui normalmente)
    return NextResponse.redirect(`${baseUrl}/`)
  }
}
