import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hash = searchParams.get('h')

  if (!hash) {
    return NextResponse.redirect(new URL('/login?message=Link+de+acesso+inválido.', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar erros se executado durante redirecionamento
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({
    token_hash: hash,
    type: 'magiclink',
  })

  if (error) {
    console.error('Erro ao verificar OTP pelo link curto:', error.message)
    return NextResponse.redirect(new URL('/login?message=Link+expirado+ou+já+utilizado.+Solicite+um+novo.', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard/minhas-consultas', request.url))
}
