import { ImageResponse } from '@vercel/og'
import { getFonts } from './font'
import { template } from './template'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' },
    })
  }

  const title = url.searchParams.get('title')
  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const fonts = await getFonts()
    const bg = url.searchParams.get('bg') || '#0d0d0d'

    return new ImageResponse(
      template({ title, bg, logo: url.searchParams.get('logo') || undefined }),
      { width: 1200, height: 630, fonts },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
