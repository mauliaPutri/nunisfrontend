"use client";
import React, { useEffect, useState } from 'react';
import { CiInstagram } from 'react-icons/ci';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaPhoneVolume } from 'react-icons/fa6';
import { MdOutlineMail } from 'react-icons/md';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import SlideInLeft from '@/components/animation/slideInLeft';
import { CheckCircle } from 'lucide-react';

function Contactpage() {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [pictures, setPictures] = useState("");

    useEffect(() => {
        const userinfo = localStorage.getItem("user-info");
        let email = userinfo ? userinfo.replace(/["]/g, "") : "";
        setEmail(email!!);
        
        // Mengambil gambar user berdasarkan email
        const fetchUserPicture = async () => {
            try {
                const response = await axios.get(`${API_ENDPOINTS.USER(email)}`);
                setPictures(response.data.pictures);
            } catch (error) {
                console.error("Error fetching user picture:", error);
            }
        };

        if(email) {
            fetchUserPicture();
        }
    }, []);

    console.log(pictures)
    async function messageuser() {
        let item = { email, message, pictures };
        try {
            let response = await axios.post(
                API_ENDPOINTS.CONTACT,
                item,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error("Terjadi kesalahan!", error);
        }
    }

    const isFormValid = () => {
        return message;
    };

    const clearInput = () => {
        setMessage('');
    };

    return (
        <div className='container mx-auto px-4'>
            <SlideInLeft>
                <div className="flex flex-col sm:flex-row min-h-screen sm:ms-[-25px] py-6">
                    <div className="w-full sm:w-1/2 lg:w-2/5 p-4 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-0" style={{ background: 'linear-gradient(135deg, #4ED4F1, #61AB5B)' }}>
                        <div className='mt-2 sm:mt-4 ms-2 sm:ms-4'>
                            <h3 className='text-white font-bold text-xl sm:text-2xl'>Informasi Kontak</h3>
                        </div>
                        <div className='mt-10 sm:mt-8 ms-1 text-white'>
                            <div className='mt-4 sm:mt-5 hover:bg-white/20 p-2 sm:p-3 rounded-lg transition-all duration-300'>
                                <label htmlFor="phone" className='flex align-items-center gap-2 sm:gap-3 text-base sm:text-lg'><FaPhoneVolume className="text-lg sm:text-xl" /> 085217645464</label>
                            </div>
                            <div className='mt-4 sm:mt-5 hover:bg-white/20 p-2 sm:p-3 rounded-lg transition-all duration-300'>
                                <label htmlFor="email" className='flex align-items-center gap-2 sm:gap-3 text-base sm:text-lg'><MdOutlineMail className="text-lg sm:text-xl" /> nuniswarung@gmail.com</label>
                            </div>
                            <div className='mt-4 sm:mt-5 hover:bg-white/20 p-2 sm:p-3 rounded-lg transition-all duration-300'>
                                <label htmlFor="address" className='flex align-items-center gap-2 sm:gap-3 text-base sm:text-lg'><FaMapMarkerAlt className="text-lg sm:text-xl" /> Jl. Raya Trenggalek - Ponorogo No.Km.7, RT.17/RW.4, Setono, Kec. Tugu, Kabupaten Trenggalek, Jawa Timur 66352</label>
                            </div>
                            <div className='mt-4 sm:mt-5 hover:bg-white/20 p-2 sm:p-3 rounded-lg transition-all duration-300'>
                                <label htmlFor="instagram" className='flex align-items-center gap-2 sm:gap-3 text-base sm:text-lg'><CiInstagram className="text-lg sm:text-xl" /> @nunis.warungkoffie</label>
                            </div>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 lg:w-3/5 p-4 sm:p-6">
                        <div className='flex justify-content-text-center align-items-center h-full'>
                            <div className='w-full flex-row bg-white p-4 sm:p-6 rounded-lg shadow-md'>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800">Berikan Penilaian Anda</h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Kami sangat menghargai masukan dari Anda untuk meningkatkan layanan kami</p>
                                <label htmlFor="messages" className='mb-1 sm:mb-2 text-base sm:text-lg font-medium' style={{ color: '#61AB5B' }}>Penilaian</label>
                                <Input
                                    className="w-full mb-4 sm:mb-5 border-b focus:border-[#61AB5B] focus:ring-[#61AB5B] p-2 sm:p-3 text-base sm:text-lg"
                                    id="message"
                                    placeholder="Tulis penilaian anda di sini..."
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className='flex justify-content-end'>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="bg-[#61AB5B] hover:bg-[#4a8a47] text-white font-bold transition-all duration-300 text-sm sm:text-base" 
                                                style={{ borderRadius: '10px', padding: '10px 20px sm:12px 24px' }}
                                                type="submit"
                                                onClick={isFormValid() ? messageuser : () => { }}
                                                disabled={!isFormValid()}
                                            >
                                                Kirim Penilaian
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-2xl p-6">
                                            <DialogHeader className="text-center mb-4">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-8 h-8 text-[#61AB5B]" />
                                                </div>
                                                <DialogTitle className="text-2xl font-bold text-[#61AB5B] mb-2">Terima Kasih 🙏</DialogTitle>
                                                <DialogDescription className="text-base text-gray-600 leading-relaxed">
                                                    Terima kasih atas penilaian Anda. Masukan Anda sangat berharga bagi kami untuk terus meningkatkan kualitas layanan.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="mt-6">
                                                <DialogClose asChild>
                                                    <Button 
                                                        type="button" 
                                                        onClick={clearInput} 
                                                        className="w-full bg-[#61AB5B] hover:bg-[#4a8a47] text-white font-medium py-2.5 rounded-lg transition-all duration-300"
                                                    >
                                                        Tutup
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SlideInLeft>
        </div>
    );
}

export default Contactpage;
