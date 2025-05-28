import '../../styles/globals.css';
import SidebarDekstop from '@/components/SidebarDekstop';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Sidebar from '../../components/sidebarAdmin';

export const metadata = {
  title: 'Nunis Warung Koffie',
  description: 'Nunis Warung Koffie',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between" style={{ overflow: "hidden" }}>
      <div className='fixed w-[300px] '><Sidebar /></div>
      <main className=' overflow-auto sm:ml-[260px] w-screen h-screen sm:p-0 p-10'>
        {children}
      </main>
    </div>
  );
}
