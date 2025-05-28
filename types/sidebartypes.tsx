// src/types/sidebartypes.ts
'use client'
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarItems {
  links: SidebarItem[];
}

export interface UserData {
  nama: string;
  pictures: string;
  // Add other user data fields as necessary
}