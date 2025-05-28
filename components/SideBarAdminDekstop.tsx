import React, { useCallback, useEffect, useState } from "react";
import SideBarButton from "./SideBarButton";
import { SidebarItems, UserData } from "@/types/sidebartypes";
import Link from "next/link";
import { LogOut, MoreHorizontal, UserRound } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import lg from '../public/profil.png';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PopoverContent } from "@radix-ui/react-popover";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "./Auth/useAuth";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface SidebarDekstopProps {
  sidebarItems: SidebarItems;
  userData: UserData;
}

export default function SidebarDekstop({sidebarItems, userData}:SidebarDekstopProps) {
  const pathname = usePathname();
  const router = useRouter();
  // const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const userinfo = localStorage.getItem('user-info');
  //     const admininfo = localStorage.getItem('admin-info');

  //     let email = null;

  //     if (userinfo && admininfo) {
  //       email = `${userinfo.replace(/["]/g, '')} ${admininfo.replace(/["]/g, '')}`;
  //     } else if (userinfo) {
  //       email = userinfo.replace(/["]/g, '');
  //     } else if (admininfo) {
  //       email = admininfo.replace(/["]/g, '');
  //     }
  //     if (!email) {
  //       setError(admininfo);
  //       return;
  //     }
  //     try {
  //       const response = await axios.get(API_ENDPOINTS.USER(email));
  //       setUserData(response.data);
  //     } catch (err) {
  //       setError('Gagal mengambil data user');
  //       console.error(err);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Jalankan navigasi dan logout secara bersamaan
      await Promise.all([
        router.push('/login'),
        logout()
      ]);
    } catch (error) {
      console.error('Terjadi kesalahan saat logout:', error);
      // Opsional: Tambahkan notifikasi error untuk pengguna
    }
  }, [router, logout]);
  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    // return <div>{localStorage.getItem("user-info")}</div>;
    return <div></div>;
  }

  return (
    <aside className="w-[260px] h-screen border-r ">
      <div className="h-full px-3 py-4 flex flex-col justify-between">
        <div className="pt-10">
          <div className="flex h-14 justify-center items-center border-b px-4 lg:h-[60px] lg:px-6 ">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/LOGO NUNIS.jpg" alt="logo" width={200} height={200}/>
            </Link>
          </div>
          <div className="flex flex-col gap-2 mt-5">
            {sidebarItems.links.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link key={index} href={link.href}>
                  <SideBarButton
                    variant="ghost"
                    className={`border-1 ${isActive ? 'bg-[#61AB5B] text-white' : 'border-transparent text-gray-700 hover:bg-[#61AB5B] hover:text-white'}`}
                    icon={link.icon}
                  >
                    {link.label}
                  </SideBarButton>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="left-0 bottom-1 w-full border-top p-1 mt-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start pt-3 pb-3">
                <div className="flex justify-between items-center w-full mb-1">
                  <div className="flex gap-2">
                    <Avatar className="h-[40px] w-[40px]">
                      <AvatarImage src="/LOGO NUNIS.jpg" />
                      <AvatarFallback><UserRound /></AvatarFallback>
                    </Avatar>
                    <span className="align-self-center">{userData.nama}</span>
                  </div>
                  <LogOut size={20} />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mb-2 w-auto h-auto p-3 rounded-[1rem]">
              <Button
                size="sm"
                onClick={handleLogout}
                className="w-[200px] h-[35px] animate-none border-[1px] bg-[#61AB5B] text-white">
                <LogOut className="mr-2" size={16} />
                Keluar
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </aside>
  );
}
