// import Nav from './nav'
import '../../../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
export const metadata = {
  title: 'Nunis Warung Koffie',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  //  <div className='w-full bg-black'>
  //   {/* <Nav/> */}
  //   <div className='lg:mx-10 '>
      
  //   </div>
  //  </div>
  <div>
    {children}
  </div>
  )
}