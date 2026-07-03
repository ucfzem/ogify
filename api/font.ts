const FONT_SANS_URL = 'https://github.com/vercel/satori/raw/main/playground/fonts/inter-regular.woff'
const FONT_BOLD_URL = 'https://github.com/vercel/satori/raw/main/playground/fonts/inter-bold.woff'

export async function getFonts() {
  const [sans, bold] = await Promise.all([
    fetch(FONT_SANS_URL).then(r => r.arrayBuffer()),
    fetch(FONT_BOLD_URL).then(r => r.arrayBuffer()),
  ])
  return [
    { name: 'Inter', data: sans, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: bold, weight: 700 as const, style: 'normal' as const },
  ]
}
