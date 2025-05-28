import '../../../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
export const metadata = {
  title: 'Nunis Warung Koffie',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='ml-0 sm:ml-[-20px]'>
      {children}
    </div>
  )
}