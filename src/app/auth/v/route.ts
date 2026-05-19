import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('t')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
  const baseUrl = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`

  if (!token) {
    return NextResponse.redirect(new URL('/login?message=Link+de+acesso+inválido.', baseUrl))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vghfzvevlfxtpitmqmsv.supabase.co'
  const cleanSupabaseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  
  const callbackUrl = `${baseUrl}/auth/callback?next=/dashboard/minhas-consultas`

  // Reconstrói e redireciona direto para a rota oficial e segura de verificação do Supabase
  const officialVerifyUrl = `${cleanSupabaseUrl}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(callbackUrl)}`

  return NextResponse.redirect(officialVerifyUrl)
}
