import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { getFonts } from './font'
import { template } from './template'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
let wasmReady: Promise<void> | null = null

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
    return new Response(JSON.stringify({ error: 'Missing title' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const format = url.searchParams.get('format') || 'png'
  const fonts = await getFonts()

  const svg = await satori(template({ title, bg: url.searchParams.get('bg') || undefined, logo: url.searchParams.get('logo') || undefined }), {
    width: 1200,
    height: 630,
    fonts,
  })

  if (format === 'svg') {
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  if (!wasmReady) wasmReady = initWasm(fetch(WASM_URL))
  await wasmReady

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, background: url.searchParams.get('bg') || '#0d0d0d' })
  const blob = new Blob([resvg.render().asPng() as unknown as BlobPart], { type: 'image/png' })

  return new Response(blob, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
