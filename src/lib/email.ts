interface SendConfirmationEmailParams {
  to: string
  patientName: string
  doctorName: string
  specialty: string
  date: string
  time: string
  meetLink: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
}

export async function sendConfirmationEmail(params: SendConfirmationEmailParams) {
  const { to, patientName, doctorName, specialty, date, time, meetLink } = params
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'VirtuaDoctor <noreply@virtuadoc.automatech.tech>'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://virtuadoc.automatech.tech'

  if (!apiKey) {
    console.warn('RESEND_API_KEY não configurada — e-mail não enviado')
    return { success: false, error: 'API key não configurada' }
  }

  const formattedDate = formatDate(date)

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Consulta Confirmada – VirtuaDoctor</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00f2fe,#4facfe);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#000;font-size:28px;font-weight:800;letter-spacing:-0.5px;">✅ Consulta Confirmada!</h1>
              <p style="margin:8px 0 0;color:#000;font-size:15px;opacity:0.75;">VirtuaDoctor – Telemedicina Premium</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#141414;padding:32px;border-left:1px solid #222;border-right:1px solid #222;">
              <p style="color:#ccc;font-size:16px;margin:0 0 24px;">Olá, <strong style="color:#fff;">${patientName}</strong>! 👋</p>
              <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Seu pagamento foi confirmado e sua teleconsulta está agendada. Abaixo estão todos os detalhes:
              </p>

              <!-- Appointment Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #222;">
                          <span style="color:#666;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Médico</span><br/>
                          <span style="color:#fff;font-size:15px;font-weight:600;">${doctorName}</span>
                          <span style="color:#00f2fe;font-size:13px;"> · ${specialty}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #222;">
                          <span style="color:#666;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Data e Hora</span><br/>
                          <span style="color:#fff;font-size:15px;font-weight:600;">📅 ${formattedDate} às ${time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#666;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Modalidade</span><br/>
                          <span style="color:#fff;font-size:15px;font-weight:600;">🎥 Videochamada Online</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Meeting Link -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(0,242,254,0.05),rgba(79,172,254,0.05));border-radius:12px;border:1px solid rgba(0,242,254,0.15);margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="color:#aaa;font-size:13px;margin:0 0 12px;">🔗 Seu link de acesso à consulta:</p>
                    <a href="${meetLink}" style="color:#00f2fe;font-size:13px;word-break:break-all;text-decoration:none;">${meetLink}</a>
                    <p style="color:#666;font-size:11px;margin:12px 0 0;">Guarde este link! Acesse-o no horário agendado para entrar na videochamada.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${meetLink}" 
                       style="display:inline-block;background:linear-gradient(135deg,#00f2fe,#4facfe);color:#000;font-weight:800;font-size:16px;padding:16px 40px;border-radius:100px;text-decoration:none;letter-spacing:-0.3px;">
                      Entrar na Videochamada
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tips -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#aaa;font-size:12px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px;">💡 Dicas para a consulta</p>
                    <ul style="color:#888;font-size:13px;margin:0;padding-left:16px;line-height:1.8;">
                      <li>Acesse o link <strong style="color:#aaa;">5 minutos antes</strong> do horário</li>
                      <li>Verifique câmera e microfone antes de entrar</li>
                      <li>Use um local tranquilo e com boa iluminação</li>
                      <li>Tenha em mãos documentos e medicamentos em uso</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;border-radius:0 0 16px 16px;border:1px solid #222;border-top:0;padding:20px;text-align:center;">
              <p style="color:#555;font-size:12px;margin:0 0 8px;">
                Dúvidas? Fale conosco: <a href="mailto:suporte@virtuadoc.automatech.tech" style="color:#00f2fe;text-decoration:none;">suporte@virtuadoc.automatech.tech</a>
              </p>
              <p style="color:#444;font-size:11px;margin:0;">
                © 2026 VirtuaDoctor – Telemedicina Premium · <a href="${appUrl}" style="color:#555;text-decoration:none;">virtuadoc.automatech.tech</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'noreply@virtuadoc.automatech.tech'
    const fromWithName = `VirtuaDoctor <${fromAddress}>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromWithName,
        to: [to],
        reply_to: fromAddress,
        subject: `Consulta confirmada com ${doctorName} - ${formattedDate} as ${time}`,
        html,
        text: `CONSULTA CONFIRMADA!\n\nOla, ${patientName}!\n\nSeu pagamento foi confirmado.\n\nMedico: ${doctorName} (${specialty})\nData: ${formattedDate} as ${time}\nLink da videochamada: ${meetLink}\n\nAcesse o link no horario agendado.\n\nDuvidas? suporte@virtuadoc.automatech.tech\nVirtuaDoctor - Telemedicina Premium`,
        headers: {
          'X-Entity-Ref-ID': `appt-${Date.now()}`,
        },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return { success: false, error: data.message }
    }

    console.log('✅ E-mail enviado para:', to, '| ID:', data.id)
    return { success: true, id: data.id }
  } catch (err: any) {
    console.error('Email send error:', err)
    return { success: false, error: err.message }
  }
}

// ──────────────────────────────────────────
// Notificação para o MÉDICO quando há nova consulta
// ──────────────────────────────────────────
interface SendDoctorNotificationParams {
  to: string
  doctorName: string
  patientName: string
  patientPhone: string
  date: string
  time: string
  meetLink: string
  reason?: string
}

export async function sendDoctorNotificationEmail(params: SendDoctorNotificationParams) {
  const { to, doctorName, patientName, patientPhone, date, time, meetLink, reason } = params
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { success: false }

  const fromAddress = process.env.RESEND_FROM_EMAIL || 'noreply@virtuadoc.automatech.tech'
  const formattedDate = formatDate(date)

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>Nova Consulta Agendada</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">📅 Nova Consulta Agendada!</h1>
            <p style="margin:8px 0 0;color:#e9d5ff;font-size:14px;">Um paciente agendou uma consulta com você</p>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;padding:32px;border-left:1px solid #222;border-right:1px solid #222;">
            <p style="color:#ccc;font-size:16px;margin:0 0 24px;">Olá, <strong style="color:#fff;">Dr(a). ${doctorName}</strong>! 👋</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;">Paciente</span><br/>
                    <span style="color:#fff;font-size:16px;font-weight:600;">${patientName}</span>
                  </td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;">Telefone</span><br/>
                    <span style="color:#fff;font-size:15px;">📱 ${patientPhone || 'Não informado'}</span>
                  </td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;">Data e Hora</span><br/>
                    <span style="color:#fff;font-size:15px;font-weight:600;">📅 ${formattedDate} às ${time}</span>
                  </td></tr>
                  ${reason ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222;">
                    <span style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;">Motivo da Consulta</span><br/>
                    <span style="color:#aaa;font-size:14px;">${reason}</span>
                  </td></tr>` : ''}
                  <tr><td style="padding:8px 0;">
                    <span style="color:#666;font-size:11px;text-transform:uppercase;font-weight:700;">Link da Sala</span><br/>
                    <a href="${meetLink}" style="color:#a855f7;font-size:13px;word-break:break-all;">${meetLink}</a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr><td align="center">
                <a href="${meetLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none;">
                  Abrir Sala da Consulta
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#111;border-radius:0 0 16px 16px;border:1px solid #222;border-top:0;padding:16px;text-align:center;">
            <p style="color:#444;font-size:11px;margin:0;">VirtuaDoctor – Telemedicina Premium</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `VirtuaDoctor <${fromAddress}>`,
        to: [to],
        subject: `Nova consulta agendada - ${patientName} - ${formattedDate} as ${time}`,
        html,
        text: `Nova consulta agendada!\n\nPaciente: ${patientName}\nTelefone: ${patientPhone}\nData: ${formattedDate} as ${time}\nLink: ${meetLink}`,
      }),
    })
    const data = await res.json()
    if (!res.ok) { console.error('Doctor email error:', data); return { success: false } }
    console.log('✅ E-mail médico enviado | ID:', data.id)
    return { success: true }
  } catch (err: any) {
    console.error('Doctor email error:', err)
    return { success: false }
  }
}
