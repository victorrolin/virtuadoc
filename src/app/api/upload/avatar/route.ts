import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })

    // Validar tipo e tamanho
    if (!file.type.startsWith('image/'))
      return NextResponse.json({ error: 'Apenas imagens são permitidas.' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true, // sobrescreve se já existir
      })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = adminClient.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Salvar URL no perfil
    await adminClient.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
