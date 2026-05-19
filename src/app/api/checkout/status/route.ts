import { NextRequest, NextResponse } from 'next/server'

// Polling: verifica status de um pagamento MP
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id')
  if (!paymentId) return NextResponse.json({ error: 'payment_id required' }, { status: 400 })

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) return NextResponse.json({ error: 'no token' }, { status: 500 })

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const data = await res.json()

  return NextResponse.json({
    status: data.status,           // approved | pending | rejected
    statusDetail: data.status_detail,
    id: data.id,
  })
}
