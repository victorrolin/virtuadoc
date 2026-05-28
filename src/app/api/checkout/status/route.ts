import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Polling: verifica status de um pagamento MP
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id')
  const extRef = req.nextUrl.searchParams.get('external_reference')
  
  if (!paymentId && !extRef) return NextResponse.json({ error: 'payment_id or external_reference required' }, { status: 400 })

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) return NextResponse.json({ error: 'no token' }, { status: 500 })

  let data;

  if (paymentId && paymentId !== 'null') {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    data = await res.json()
  } else if (extRef) {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${extRef}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    const searchData = await res.json()
    if (searchData.results && searchData.results.length > 0) {
      data = searchData.results[0] // pega a tentativa mais recente
    } else {
      return NextResponse.json({ status: 'pending', msg: 'not found yet' })
    }
  }

  return NextResponse.json({
    status: data?.status || 'pending',
    statusDetail: data?.status_detail,
    id: data?.id,
  })
}
