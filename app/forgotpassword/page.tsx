'use client'
import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import bg from "../../public/LOGO NUNIS.jpg";
import Image from "next/image";
import { API_ENDPOINTS } from "../api/nunisbackend/api";
import axios from "axios";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordconfirm, setShowPasswordconfirm] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordVisibilityconfirm = () => setShowPasswordconfirm(!showPasswordconfirm);
  const [loadingOTP, setLoadingOTP] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verify, setVerify] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingOTP(true);
    try {
      const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD(email));
      if (response.data.success) {
        console.log(response.data);
        setSubmitted(true);
        setLoadingOTP(false);
      } else {
        setError(response.data.message);
        setLoadingOTP(false);
      }  
    } catch (error) {
      setError("Gagal mengirim email. Silakan coba lagi.");
      setLoadingOTP(false);
    }  
  };  


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingVerify(true);
    try {
      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, {
        email: email,
        otp: otp
      });  

      if (response.data.success) {
        setVerify(true);
        setLoadingVerify(false);
        // Redirect ke halaman reset password jika OTP valid
        // window.location.href = `/resetpassword?email=${email}`;

      } else {
        setVerifyError(response.data.message);
        setLoadingVerify(false);
      }  
    } catch (error: any) {
      setVerifyError(error.response?.data?.message || "Gagal memverifikasi OTP. Silakan coba lagi.");
      setLoadingVerify(false);
    }  
  };  

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    // Validasi password
    if (newPassword.length < 8) {
      setResetError("Kata sandi minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Kata sandi tidak cocok");
      return;
    }

    try {
      setLoadingReset(true);

      const response = await axios.post(API_ENDPOINTS.RESET_PASSWORD, {
        email: email,
        password: newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        setLoadingReset(false);
        // Redirect ke halaman login setelah 3 detik
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        setResetError(response.data.message);
        setLoadingReset(false);
      }
    } catch (error: any) {
      setResetError(error.response?.data?.message || "Gagal memperbarui kata sandi. Silakan coba lagi.");
      setLoadingReset(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#61AB5B]/10 to-[#4e8a49]/10">
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Bagian Kiri - Gambar dan Logo */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#61AB5B] to-[#4e8a49] p-8 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#FFFFFF" d="M42.8,-65.2C54.9,-56.3,63.7,-43.2,70.1,-28.8C76.5,-14.4,80.5,1.3,77.2,15.3C73.9,29.3,63.3,41.5,50.8,51.1C38.3,60.7,23.9,67.6,8.2,71.2C-7.5,74.8,-24.5,75.1,-38.3,68.1C-52.1,61.1,-62.7,46.9,-69.6,31.1C-76.5,15.3,-79.7,-2,-75.9,-17.8C-72.1,-33.6,-61.3,-47.9,-47.8,-56.7C-34.3,-65.5,-17.1,-68.8,-0.5,-68C16.1,-67.2,30.7,-74.1,42.8,-65.2Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="mb-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-3 shadow-xl relative z-10 border-4 border-white overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-2xl">
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
          <p className="text-white text-center mb-8 relative z-10 max-w-xs">Perbarui kata sandi Anda dengan mudah dan aman</p>
        </div>

        {/* Bagian Kanan - Form Reset Password */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-[#61AB5B] to-[#4e8a49]">Lupa Kata Sandi?</h1>
              <p className="text-gray-600 mt-2">Masukkan email Anda untuk menerima link perbarui kata sandi</p>
            </div>

            {verify ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-600">Verifikasi OTP berhasil. Silakan masukkan kata sandi baru Anda.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                      <Lock size={16} className="mr-2 text-[#61AB5B]" />
                      Kata Sandi Baru
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan kata sandi baru"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#61AB5B] transition-colors duration-300"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                      <Lock size={16} className="mr-2 text-[#61AB5B]" />
                      Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative group">
                      <Input
                        type={showPasswordconfirm ? "text" : "password"}
                        required
                        placeholder="Konfirmasi kata sandi baru"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibilityconfirm}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#61AB5B] transition-colors duration-300"
                      >
                        {showPasswordconfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>
                  {resetError && (
                    // <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-600">{resetError}</p>
                    // </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#61AB5B] to-[#4e8a49] text-white font-semibold hover:from-[#4e8a49] hover:to-[#61AB5B] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    disabled={loadingReset}
                  >
                    {loadingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Kata Sandi"}
                  </Button>
                </form>
                <Link
                  href="/login"
                  className="inline-flex items-center text-[#61AB5B] hover:text-[#4e8a49] transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            ) : submitted ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-600">Kode OTP telah dikirim ke email Anda. Silakan masukkan kode OTP di bawah ini.</p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700 font-medium flex items-center">
                      <KeyRound size={16} className="mr-2 text-[#61AB5B]" />
                      Kode OTP
                    </Label>
                    <div className="relative group">
                      <Input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Masukkan 6 digit kode OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#61AB5B] to-[#4e8a49] text-white font-semibold hover:from-[#4e8a49] hover:to-[#61AB5B] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    disabled={loadingVerify}
                  >
                    {loadingVerify ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verifikasi OTP"}
                  </Button>
                </form>
                <Link
                  href="/login"
                  className="inline-flex items-center text-[#61AB5B] hover:text-[#4e8a49] transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                    <Mail size={16} className="mr-2 text-[#61AB5B]" />
                    Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#61AB5B] focus:border-transparent transition-all duration-300 group-hover:border-[#61AB5B]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#61AB5B] to-[#4e8a49] text-white font-semibold hover:from-[#4e8a49] hover:to-[#61AB5B] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  disabled={loadingOTP}
                >
                  {loadingOTP ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirim OTP"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-[#61AB5B] hover:text-[#4e8a49] transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 