const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700'

export async function getFonts() {
  const css = await fetch(GOOGLE_FONTS_URL).then(r => r.text())

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }> = []

  // Parse each @font-face block
  const blocks = css.split('@font-face')
  for (const block of blocks) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/)
    const urlMatch = block.match(/url\(([^)]+)\)/)
    if (!weightMatch || !urlMatch) continue

    const weight = parseInt(weightMatch[1]) as 400 | 700
    if (weight !== 400 && weight !== 700) continue

    const url = urlMatch[1]
    const data = await fetch(url).then(r => r.arrayBuffer())
    fonts.push({ name: 'Inter', data, weight, style: 'normal' })
  }

  if (fonts.length < 2) {
    // Fallback: Inter regular only
    if (fonts.length === 0) throw new Error('Failed to load any font')
  }

  return fonts
}
