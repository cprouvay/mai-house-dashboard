import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAI House Café — Dashboard',
  description: 'Panel de gestión MAI House Café · Fehu Inversiones SPA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
