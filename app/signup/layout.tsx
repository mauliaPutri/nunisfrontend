import '../../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nunis Warung Koffie',
  description: 'Nunis Warung Koffie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        {children}
      </div>
  )
}
