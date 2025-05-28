import '../../../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
export const metadata = {
  title: 'Nunis Warung Koffie',
}

export default function CategoryLayout({
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