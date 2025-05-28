// src/components/sidebar.tsx
'use client'
import React, { useState, useEffect } from 'react'
import SidebarDekstop from './SidebarDekstop'
import { Contact, History, Home, LayoutGrid, SquareMenu, User } from 'lucide-react'
import { useMediaQuery } from 'usehooks-ts'
import { SidebarItems, UserData } from '@/types/sidebartypes'
import SidebarMobile from './SidebarMobile'
import axios from 'axios'
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api'
import SidebarDesktopSkeleton from '@/app/skeleton/skeletonSidebarDesktop'

const sidebarItems: SidebarItems = {
  links: [
    { label: 'Beranda', href: '/dashboard/home', icon: Home },
    { label: 'Kategori', href: '/dashboard/category', icon: LayoutGrid },
    { label: 'Menu', href: '/dashboard/menu', icon: SquareMenu },
    { label: 'Profil', href: '/dashboard/profile', icon: User },
    { label: 'Penilaian', href: '/dashboard/contact', icon: Contact },
    { label: 'Riwayat', href: '/dashboard/history', icon: History }
  ]
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const isDekstop = useMediaQuery('(min-width:640px)', {
    initializeWithValue: false,
  })
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchUserData = async () => {
      const userinfo = localStorage.getItem('user-info');
      let email = userinfo ? userinfo.replace(/["]/g, '') : null;
      if (!email) {
        setError('Email tidak ditemukan di localStorage');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<UserData>(API_ENDPOINTS.USER(email));
        setUserData(response.data);
      } catch (err) {
        setError('Gagal mengambil data user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <SidebarDesktopSkeleton />;
  }
  
  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div></div>;
  }

  if (isDekstop) {
    return (
      <SidebarDekstop
        sidebarItems={sidebarItems}
        userData={userData}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
    )
  }

  return <SidebarMobile 
  sidebarItems={sidebarItems} 
  userData={userData}
  />


}