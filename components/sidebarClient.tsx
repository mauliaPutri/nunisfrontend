'use client'
import React, { useState } from 'react'
import SidebarDekstop from './SidebarDekstop'
import { Contact, Home, LayoutGrid, SquareMenu, User } from 'lucide-react'
import { useMediaQuery } from 'usehooks-ts'
import { SidebarItems, UserData } from '@/types/sidebartypes'
import SidebarMobile from './SidebarMobile'

const sidebarItems: SidebarItems = {
    links :[
        {label : 'Beranda', href: '/Dashboard/Home', icon:Home},
        {label : 'Kategori', href: '/Dashboard/Category', icon:LayoutGrid},
        {label : 'Menu', href: '/Dashboard/Menu', icon:SquareMenu},
        {label : 'Profil', href: '/Dashboard/Profile', icon:User},
        {label : 'Kontak', href: '/Dashboard/Contact', icon:Contact}
      ]
}

// Tambahkan data pengguna dummy (ganti dengan data sebenarnya nanti)
const dummyUserData: UserData = {
  nama: 'Pengguna',
  pictures: '/path/to/default/image.jpg'
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isDekstop = useMediaQuery('(min-width:640px)', {
    initializeWithValue: false,
  })

  if (isDekstop) {
    return (
      <SidebarDekstop 
        sidebarItems={sidebarItems} 
        userData={dummyUserData}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
    )
  }
  return <SidebarMobile sidebarItems={sidebarItems} userData={dummyUserData} />
}
