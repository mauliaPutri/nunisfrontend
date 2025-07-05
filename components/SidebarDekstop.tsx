"use client"
import React, { useCallback, useState } from "react";
import { SidebarItems, UserData } from "@/types/sidebartypes";
import Link from "next/link";
import { LogOut, UserRound, ChevronLeft, ChevronRight, MoreHorizontal, Menu } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PopoverContent } from "@radix-ui/react-popover";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../components/Auth/useAuth";
import { Span } from "next/dist/trace";

interface SidebarDekstopProps {
  sidebarItems: SidebarItems;
  userData: UserData;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function SidebarDekstop({ sidebarItems, userData, isCollapsed, setIsCollapsed }: SidebarDekstopProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = useCallback(async () => {
    try {
      // Jalankan navigasi dan logout secara bersamaan
      await Promise.all([
        router.push('/login'),
        logout()
      ]);
    } catch (error) {
      console.error('Terjadi kesalahan saat logout:', error);
    }
  }, [router, logout]);

  return (
    <aside className={`w-[${isCollapsed ? '80px' : '270px'}] max-w-xs h-screen fixed left-0 top-0 z-40 border-r transition-all duration-300`}>
      <div className="h-full px-1 py-3">
        {isCollapsed ?
          <div className="flex mr-3 justify-center cursor-pointer">
            <Menu size={24} onClick={toggleCollapse} />
          </div>
          :
          <div className="flex mr-3 justify-end cursor-pointer">
            <Menu size={24} onClick={toggleCollapse} />
          </div>
        }

        <div className="flex justify-center mb-0 mt-3">
          {isCollapsed ? (
            <img src="/LOGO NUNIS.jpg" alt="gambar" width="100px" className="p-2 mb-5" style={{ borderRadius: '30px', marginTop: '-20px' }} />
            // <h5 className="text-center text-sm font-bold text-foreground font-poppins pb-[32px]">Godong <br /> Menu</h5>
          ) : (
            <img src="/LOGO NUNIS.jpg" alt="gambar" width="200px" className="p-2 mb-0 " style={{ borderRadius: '30px', marginTop: '-20px' }} />
            // <h2 className="text-center text-3xl font-bold text-foreground font-poppins">Godong <br /> Menu</h2>
          )}
        </div>
        <div className="flex flex-column gap-2 ">
          {sidebarItems.links.map((link, index) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            const [hovered, setHovered] = useState(false);
            return (
              <Link key={index} href={link.href}>
                <Button
                  variant="outline"
                  onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                  className={`border-1 w-full justify-start ${isActive ? 'border-[#61AB5B] text-[#61AB5B]' : 'border-transparent text-gray-700 hover:border-[#61AB5B] hover:text-[#61AB5B]'}`}>
                  {Icon && (
                    <span style={{ width: '2rem', display: 'inline-block' }}>
                      <Icon size={20} />
                    </span>
                  )}
                  {!isCollapsed && <span className="ml-2">{link.label}</span>}
                  {isCollapsed && hovered && (
                    <span style={{
                      position: 'absolute',
                      left: '100%',
                      whiteSpace: 'nowrap',
                      background: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                    }}>
                      {link.label}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="absolute left-0 bottom-1 w-full border-top p-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start pt-3 pb-3">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-2">
                    <Avatar className="h-[40px] w-[40px]">
                      <AvatarImage src={userData.pictures} />
                      <AvatarFallback><UserRound /></AvatarFallback>
                    </Avatar>
                    {!isCollapsed && <span className="align-self-center">{userData.nama}</span>}
                  </div>
                  {!isCollapsed && <LogOut size={20} />}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mb-2 w-auto h-auto p-3 rounded-[1rem]">
              {isCollapsed &&
                <LogOut className=" cursor-pointer h-[30px]" onClick={handleLogout} size={20} />
              }
              {!isCollapsed &&
                <Button
                  size="sm"
                  onClick={handleLogout}
                  className="w-[200px] h-[35px] animate-none border-[1px] bg-[#61AB5B] text-white">
                  <LogOut className="mr-2" size={16} />
                  Keluar
                </Button>
              }
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </aside>
  );
}