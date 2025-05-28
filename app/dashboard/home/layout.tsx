import '../../../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
export const metadata = {
  title: 'Nunis Warung Koffie',
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='text-sm'>
      {children}
    </div>
  )
}