"use client";

import "../../styles/globals.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bg from "../../public/LOGO NUNIS.jpg";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../components/Auth/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { API_ENDPOINTS } from "../api/nunisbackend/api";
// `import ForgotPassword from "../forgotpassword/page";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail) ? "" : "Masukkan alamat email yang valid");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(newPassword.length >= 8 ? "" : "Kata sandi harus minimal 8 karakter");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.LOGIN,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        login(response.data.user);
        document.cookie = `auth_token=${response.data.token}; path=/;`;
        setIsNavigating(true);
        router.push(response.data.status === 2 ? "/dashboard/home" : "/admin/dashboard");
      } else {
        setErrorMessage("Email atau password salah");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Terjadi kesalahan!", error);
      setErrorMessage("Email atau password salah");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => validateEmail(email) && password.length >= 8;

  useEffect(() => {
    const timeout = setTimeout(() => setIsNavigating(false), 3000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  return (
    
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-blue-50 to-green-50">
      
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block">{errorMessage}</span>
            <button 
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setShowAlert(false)}
            >
              <span className="text-red-500">&times;</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Logo dan Gambar - Sekarang di sebelah kanan */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#61AB5B] to-[#4e8a49] p-8 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="#FFFFFF" d="M42.8,-65.2C54.9,-56.3,63.7,-43.2,70.1,-28.8C76.5,-14.4,80.5,1.3,77.2,15.3C73.9,29.3,63.3,41.5,50.8,51.1C38.3,60.7,23.9,67.6,8.2,71.2C-7.5,74.8,-24.5,75.1,-38.3,68.1C-52.1,61.1,-62.7,46.9,-69.6,31.1C-76.5,15.3,-79.7,-2,-75.9,-17.8C-72.1,-33.6,-61.3,-47.9,-47.8,-56.7C-34.3,-65.5,-17.1,-68.8,-0.5,-68C16.1,-67.2,30.7,-74.1,42.8,-65.2Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            {/* Logo responsif untuk semua ukuran layar */}
            <div className="mb-8 w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-white p-3 shadow-xl relative z-10 border-4 border-white overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-2xl">
              <Image
                src={bg}
                alt="Nunis Logo"
                className="w-full h-full object-cover rounded-full"
                width={160}
                height={160}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center relative z-10 drop-shadow-md">Nunis Warung & Koffie</h2>
            <p className="text-white text-center mb-8 relative z-10 max-w-xs">Nikmati pengalaman kuliner terbaik dengan layanan kami yang berkualitas</p>
          </div>

          {/* Form Login - Sekarang di sebelah kiri */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center bg-white">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-[#61AB5B] to-[#4e8a49]">Selamat Datang Kembali</h1>
                <p className="text-gray-600 mt-2">Silakan masuk untuk melanjutkan</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                    <Mail size={16} className="mr-2 text-[#61AB5B]" />
                    Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@gmail.com"
                      required
                      value={email}
                      autoComplete="off"
                      onChange={handleEmailChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan alamat email yang valid" // Menambahkan tooltip dalam bahasa Indonesia
                    />
                  </div>
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                    <Lock size={16} className="mr-2 text-[#61AB5B]" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent pr-10 transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan kata sandi yang valid" // Menambahkan tooltip dalam bahasa Indonesia
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#61AB5B] transition-colors duration-300"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                  <div className="text-right">
                    <Link href="/forgotpassword" className="text-[#61AB5B] text-sm hover:underline">
                      Lupa kata sandi?
                    </Link>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className={`w-full py-3 rounded-lg transition-all duration-300 ${
                    isFormValid()
                      ? "bg-gradient-to-r from-[#61AB5B] to-[#4e8a49] hover:from-[#4e8a49] hover:to-[#61AB5B] text-white shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid() || isLoading || isNavigating}
                >
                  {isLoading || isNavigating ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn size={18} className="mr-2" />
                      <span>Masuk</span>
                    </div>
                  )}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">atau</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600">
                    Belum punya akun?{" "}
                    <Link href="/signup" className="text-[#61AB5B] font-medium hover:underline transition-colors">
                      Daftar Sekarang
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
