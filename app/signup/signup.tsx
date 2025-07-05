"use client";
import '../../styles/globals.css'
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import bg from "../../public/LOGO NUNIS.jpg";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { API_ENDPOINTS } from '../api/nunisbackend/api';

export default function SignUp() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const status = 2;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email : any) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e : any) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError("Masukkan alamat email yang valid");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e : any) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 8) {
      setPasswordError("Password harus memiliki minimal 8 karakter");
    } else {
      setPasswordError("");
    }
  };

  async function usersignup() {
    let item = { nama, password, email, address, phone, status};
    setIsLoading(true);
    try {
      let response = await axios.post(
        API_ENDPOINTS.REGISTER, 
        item,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );
      
      if (response.data.success) {
        localStorage.setItem("user-info", JSON.stringify(response.data));
        navigate.push("/login");
      } else {
        setErrorMessage(response.data.message);
        setShowAlert(true);
      }
    } catch (error: any) {
      console.error("Terjadi kesalahan saat mendaftar", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat mendaftar");
      }
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = () => {
    return nama && validateEmail(email) && password.length >= 8 && address && phone;
  };

  return (
    <div className="flex flex-col lg:flex-row sm:h-screen w-full bg-gradient-to-br from-blue-50 to-green-50">
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
          {/* Logo dan Gambar - Di atas pada tampilan mobile, di kanan pada desktop */}
          <div className="order-first md:order-last md:w-1/2 bg-gradient-to-br from-[#61AB5B] to-[#4e8a49] p-8 flex flex-col justify-center items-center relative overflow-hidden">
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
            <p className="text-white text-center mb-8 relative z-10 max-w-xs">Bergabunglah dengan kami dan nikmati pengalaman kuliner terbaik dengan layanan kami yang berkualitas</p>
          </div>
          
          {/* Form Signup - Di bawah pada tampilan mobile, di kiri pada desktop */}
          <div className="order-last md:order-first w-full md:w-1/2 p-8 md:p-12 flex items-center bg-white">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-[#61AB5B] to-[#4e8a49]">Buat Akun Baru</h1>
                <p className="text-gray-600 mt-2">Silakan daftar untuk melanjutkan</p>
              </div>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-gray-700 font-medium flex items-center">
                    <User size={16} className="mr-2 text-[#61AB5B]" />
                    Nama
                  </Label>
                  <div className="relative group">
                    <Input
                      id="nama"
                      placeholder="Masukkan nama lengkap"
                      autoComplete="off"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan nama yang valid"
                    />
                  </div>
                </div>
                
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
                      autoComplete="off"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan email yang valid"
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
                      title="Masukkan password yang valid"
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700 font-medium flex items-center">
                    <MapPin size={16} className="mr-2 text-[#61AB5B]" />
                    Alamat
                  </Label>
                  <div className="relative group">
                    <Input
                      id="address"
                      placeholder="Masukkan alamat lengkap"
                      autoComplete="off"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan alamat yang valid"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center">
                    <Phone size={16} className="mr-2 text-[#61AB5B]" />
                    Nomor Telepon
                  </Label>
                  <div className="relative group">
                    <Input
                      id="phone"
                      placeholder="08XXXXXXXXXX"
                      autoComplete="off"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      title="Masukkan nomor telepon yang valid"
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  className={`w-full py-3 rounded-lg transition-all duration-300 ${
                    isFormValid()
                      ? "bg-gradient-to-r from-[#61AB5B] to-[#4e8a49] hover:from-[#4e8a49] hover:to-[#61AB5B] text-white shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  onClick={isFormValid() ? usersignup : () => {}}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus size={18} className="mr-2" />
                      <span>Daftar Sekarang</span>
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
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-[#61AB5B] font-medium hover:underline transition-colors">
                      Masuk Sekarang
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