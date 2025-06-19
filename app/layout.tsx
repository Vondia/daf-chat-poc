import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DAF sales agent',
  description: 'AI powered help for DAF',
  icons: {
    icon: '/daf-logo.svg',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
