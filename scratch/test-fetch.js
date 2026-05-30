const url = 'https://vghfzvevlfxtpitmqmsv.supabase.co/storage/v1/object/public/prescriptions/bfe3ffcc-af13-4084-b2ab-45d81f436a6a_signed.pdf'

async function test() {
  console.log(`Fetching: ${url}`)
  try {
    const res = await fetch(url)
    console.log(`Status: ${res.status} ${res.statusText}`)
    console.log(`Content-Type: ${res.headers.get('content-type')}`)
  } catch (err) {
    console.error('Error fetching:', err)
  }
}

test()
