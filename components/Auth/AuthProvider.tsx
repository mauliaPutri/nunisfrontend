"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';  // Import js-cookie library

interface User {
  email: string;
  status: number;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user-info');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.status == 2){
      localStorage.setItem('user-info', JSON.stringify(userData.email));
      Cookies.set('user-status', '2');
    }else{
      localStorage.setItem('admin-info', JSON.stringify(userData.email));
      Cookies.set('user-status', '1');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user-info');
    localStorage.removeItem('admin-info');
    Cookies.remove('auth_token');  // Remove the auth_token cookie
    Cookies.remove('user-status');  // Remove the auth_token cookie
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};