import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RACHAPP',
  description: 'Tu tracker de hábitos diarios',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RACHAPP',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/icon-512.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-rach-yellow antialiased">
        {children}
      </body>
    </html>
  )
}
