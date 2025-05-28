"use client";

import { useContext, useEffect } from 'react';
import { AuthContext } from './AuthProvider';
import {useRouter } from 'next/navigation';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const router = useRouter();


  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, login, logout } = context;

  // const isAuthenticated = !!user;

  // const requireAuth = () => {
  //   if (typeof window !== 'undefined' && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // };

  // useEffect(() => {
  //   requireAuth();
  // }, [isAuthenticated]);

  return { user, login, logout};
};