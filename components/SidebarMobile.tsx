"use client"
import React, { useCallback, useEffect, useState } from "react";
import { SidebarItems, UserData } from "@/types/sidebartypes";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut, Menu, MoreHorizontal, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SideBarButtonSheet as SideBarButton } from "./SideBarButton";
import { Separator } from "./ui/separator";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useAuth } from "./Auth/useAuth";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
  userData: UserData;
}

export default function SidebarMobile({sidebarItems, userData}:SidebarMobileProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("")
  const router = useRouter();
  const { logout } = useAuth();
  // const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="p-0 fixed top-3 left-3 ">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-3 py-4" side="left">
        <SheetHeader className="flex flex-row justify-between items-center space-y-0">
          <DialogTitle className="text-lg font-semibold text-foreground mx-3">
            Nunis Warung & Koffie
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <SheetClose asChild>
            {/* <Button className="h-5 w-5 p-0" variant="ghost">
              <X size={15} className="m-0" />
            </Button> */}
          </SheetClose>
        </SheetHeader>

        <div>
          <div className="flex flex-column gap-2 mt-3">
            {sidebarItems.links.map((link, idx) => (
              <Link key={idx} href={link.href}>
                <SideBarButton
                  variant="outline"
                  className={`border-1 ${pathname === link.href ? 'border-[#61AB5B] text-[#61AB5B]' : "border-transparent text-gray-700 hover:border-[#61AB5B] hover:text-[#61AB5B]"}`} icon={link.icon}>
                  {link.label}
                </SideBarButton>
              </Link>
            ))}
          </div>
          <div className="absolute w-full bottom-4 px-1 left-0">
            <Separator className="absolute -top-3 left-0 w-full" />
            <Drawer>
              <Button variant="ghost" className="w-full justify-start">
                <DrawerTrigger asChild>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={userData.pictures} />
                        <AvatarFallback><UserRound /></AvatarFallback>
                      </Avatar>
                      <span className="align-self-center">{userData.nama}</span>
                    </div>
                    <LogOut size={20} />
                  </div>
                </DrawerTrigger>
              </Button>
              <DrawerContent className="mb-2 p-2">
                <SideBarButton size="sm" onClick={handleLogout} icon={LogOut} className="w-full">
                  Keluar
                </SideBarButton>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
