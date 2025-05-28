import '../styles/globals.css'
import { AuthProvider } from '../components/Auth/AuthProvider';


export const metadata = {
  title: 'Nunis Warung & Koffie',
  description: 'Nunis Warung & Koffie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/LOGO NUNIS.jpg" type="icon" />
      </head>
      <body>
        <div>
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>  
        </body>
    </html>
  )
}
