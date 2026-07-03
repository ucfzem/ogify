interface Props {
  title: string
  bg?: string
  logo?: string
}

export function template({ title, bg = '#0d0d0d', logo }: Props) {
  const children: any[] = []

  if (logo) {
    children.push({
      type: 'img',
      props: {
        src: logo,
        style: { width: 80, height: 80, borderRadius: 16, marginBottom: 32 },
      },
    })
  }

  children.push(
    {
      type: 'div',
      props: {
        style: {
          fontSize: 64,
          fontWeight: 700,
          color: '#f5f0e8',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: 24,
        },
        children: title,
      },
    },
    {
      type: 'div',
      props: {
        style: { width: 120, height: 4, background: '#c9a050', borderRadius: 2 },
      },
    },
    {
      type: 'div',
      props: {
        style: { fontSize: 24, color: '#8a7a6a', marginTop: 24 },
        children: 'ucfzem.github.io',
      },
    },
  )

  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        padding: '80px',
        fontFamily: 'Inter',
      },
      children,
    },
  }
}
