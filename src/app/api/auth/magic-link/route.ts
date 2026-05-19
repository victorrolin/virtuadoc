import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'
    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'noreply@virtuadoc.automatech.tech'

    // Redirecionar para /auth/callback que vai estabelecer a sessão
    // antes do middleware interceptar a rota protegida /dashboard
    const callbackUrl = `${appUrl}/auth/callback?next=/dashboard/minhas-consultas`

    // Usar Admin API para gerar o link (bypassa o Site URL do Supabase)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: callbackUrl,
      },
    })

    if (error) {
      console.error('generateLink error:', error.message)
      if (error.message.includes('not found') || error.message.includes('User not found')) {
        return NextResponse.json({ error: 'E-mail não encontrado. Verifique se usou o mesmo e-mail do agendamento.' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Não foi possível gerar o link. Tente novamente.' }, { status: 500 })
    }

    let magicLink = data.properties?.action_link
    if (!magicLink) {
      return NextResponse.json({ error: 'Erro ao gerar link.' }, { status: 500 })
    }

    // Corrigir o redirect_to que o Supabase pode colocar como localhost
    const redirectTarget = encodeURIComponent(callbackUrl)
    magicLink = magicLink.replace(
      /redirect_to=[^&]*/,
      `redirect_to=${redirectTarget}`
    )
    // Garantir que o domínio base seja o do Supabase (não localhost)
    magicLink = magicLink.replace(
      /^https?:\/\/localhost:\d+/,
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://vghfzvevlfxtpitmqmsv.supabase.co'
    )

    if (!apiKey) {
      console.warn('RESEND_API_KEY não configurada')
      return NextResponse.json({ error: 'Serviço de e-mail não configurado.' }, { status: 500 })
    }

    // Enviar o magic link pelo nosso Resend com template bonito
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#00f2fe,#4facfe);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#000;font-size:26px;font-weight:800;">✨ Seu link de acesso</h1>
            <p style="margin:8px 0 0;color:#000;font-size:14px;opacity:0.75;">VirtuaDoctor – Portal do Paciente</p>
          </td>
        </tr>

        <tr>
          <td style="background:#141414;padding:32px;border-left:1px solid #222;border-right:1px solid #222;">
            <p style="color:#ccc;font-size:16px;margin:0 0 16px;">Olá! 👋</p>
            <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Recebemos uma solicitação de acesso ao seu <strong style="color:#fff;">Portal do Paciente</strong> no VirtuaDoctor.
              Clique no botão abaixo para acessar suas consultas agendadas — sem precisar de senha.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <a href="${magicLink}"
                   style="display:inline-block;background-color:#00f2fe;color:#000;font-weight:800;font-size:16px;padding:18px 48px;border-radius:100px;text-decoration:none;letter-spacing:-0.3px;">
                  Acessar Minhas Consultas
                </a>
              </td></tr>
            </table>

            <div style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;padding:16px;margin-bottom:20px;">
              <p style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;margin:0 0 6px;">Se o botão acima não funcionar, clique no link abaixo:</p>
              <a href="${magicLink}" style="color:#00f2fe;font-size:12px;word-break:break-all;margin:0;text-decoration:underline;">${magicLink}</a>
            </div>

            <div style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;padding:16px;">
              <p style="color:#888;font-size:12px;margin:0;line-height:1.6;">
                ⚠️ Este link é válido por <strong style="color:#aaa;">1 hora</strong> e só pode ser usado uma vez.<br/>
                Se você não solicitou este acesso, pode ignorar este e-mail com segurança.
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#111;border-radius:0 0 16px 16px;border:1px solid #222;border-top:0;padding:20px;text-align:center;">
            <p style="color:#555;font-size:12px;margin:0 0 4px;">
              Dúvidas? <a href="mailto:suporte@virtuadoc.automatech.tech" style="color:#00f2fe;text-decoration:none;">suporte@virtuadoc.automatech.tech</a>
            </p>
            <p style="color:#444;font-size:11px;margin:0;">© 2026 VirtuaDoctor – Telemedicina Premium</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `VirtuaDoctor <${fromAddress}>`,
        to: [email],
        subject: 'Seu link de acesso ao Portal do Paciente – VirtuaDoctor',
        html,
        text: `Acesse suas consultas no VirtuaDoctor:\n\n${magicLink}\n\nEste link expira em 1 hora.\n\nVirtuaDoctor – Telemedicina Premium`,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.json()
      console.error('Resend error sending magic link:', err)
      return NextResponse.json({ error: 'Erro ao enviar e-mail.' }, { status: 500 })
    }

    // Tentar enviar WhatsApp também
    try {
      let foundUserId = data.user?.id
      
      if (!foundUserId) {
        // Busca paginada caso a API não tenha retornado o usuário
        let page = 1
        while (true) {
          const { data: usersData } = await adminClient.auth.admin.listUsers({ page, perPage: 100 })
          if (!usersData || !usersData.users || usersData.users.length === 0) break
          const u = usersData.users.find(u => u.email === email)
          if (u) {
            foundUserId = u.id
            break
          }
          page++
        }
      }

      if (foundUserId) {
        const { data: profile } = await adminClient.from('profiles').select('phone, full_name').eq('id', foundUserId).single()
        if (profile?.phone) {
          // Encurtar o link antes de enviar no WhatsApp
          let linkParaEnviar = magicLink
          try {
            const shortRes = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(magicLink)}`)
            if (shortRes.ok) {
              const shortUrl = await shortRes.text()
              if (shortUrl.startsWith('http')) linkParaEnviar = shortUrl.trim()
            }
          } catch {
            // Se o encurtador falhar, usa o link original
          }

          const firstName = profile.full_name?.split(' ')[0] || ''
          const wpMessage = `Olá${firstName ? `, *${firstName}*` : ''}! 👋\nVocê solicitou acesso ao Portal do Paciente do VirtuaDoctor.\n\n🔑 Clique no link abaixo para entrar sem senha:\n${linkParaEnviar}\n\n⚠️ _Válido por 1 hora. Uso único._`
          await sendWhatsAppMessage({ to: profile.phone, text: wpMessage })
        }
      } else {
        console.log('Sem userId retornado pelo generateLink nem listUsers para enviar o zap.')
      }
    } catch (wpErr) {
      console.error('Erro ao tentar enviar zap:', wpErr)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Magic link error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
