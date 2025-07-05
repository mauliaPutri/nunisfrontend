"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import HomepageSkeleton from '../../skeleton/skeletonHome';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import { useMediaQuery } from 'react-responsive';

import img1 from '../../../public/ic_category.png';
import img2 from '../../../public/ic_menu.png';
import img3 from '../../../public/ic_cart_2.png';
import img4 from '../../../public/ic_cart.png';

interface Review {
  email: string;
  message: string;
  pictures: string;
}

const Homepage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review[]>([]);
  
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  const menuSteps = [
    { img: img1, name: 'Pilih Kategori', description: 'Pilih kategori menu: Makanan, Minuman, dan Snack.' },
    { img: img2, name: 'Pilih Menu', description: 'Pilih dan temukan berbagai diskon pada menu.' },
    { img: img3, name: 'Tambah ke Keranjang', description: 'Tambahkan menu ke keranjang dan siap checkout.' },
    { img: img4, name: 'Pesan', description: 'Periksa kembali pesanan dan selesaikan pemesanan.' },
  ];

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await axios.get(API_ENDPOINTS.CONTACT);
        setReview(res.data);
      } catch (err) {
        console.error('Fetch review error:', err);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userinfo = localStorage.getItem('user-info');
      if (!userinfo) return setLoading(false);
      const email = userinfo.replace(/"/g, '');
      try {
        const res = await axios.get(API_ENDPOINTS.USER(email));
        setUserData(res.data);
      } catch (err) {
        console.error('User fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <HomepageSkeleton />;
  if (!userData) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="pt-4 sm:pt-6 px-3 sm:px-4 max-w-7xl mx-auto">
      <h1 className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 pt-4">Selamat Datang, {userData.nama}</h1>

      <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 items-center mb-6 sm:mb-8 md:mb-10">
        <motion.img 
          src="/LOGO NUNIS.jpg" 
          alt="logo" 
          width={400} 
          className="mx-auto w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px]" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }} 
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }}
          className="text-center px-4 sm:px-0 "
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 sm:mb-2 md:mb-4">Nunis Warung & Koffie</h2>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg text-justify">
          Nikmati suasana hangat dan kenyamanan dalam setiap tegukan kopi dan hidangan lezat di Nunis Warung & Koffie. Kami menyajikan kopi 
          pilihan dengan rasa yang menggugah selera, dipadukan dengan hidangan lokal yang kaya rasa, untuk menemani setiap momen istimewa Anda. 
          Terletak di hati kota, Nunis Warung & Koffie adalah tempat sempurna untuk bersantai, 
          bekerja, atau menikmati waktu bersama teman-teman. Bergabunglah bersama kami dan temukan kenikmatan sejati dalam setiap sajian!
          </p>
        </motion.div>
      </div>

      <h2 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 pb-6">Cara Order Nunis Warung & Koffie</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-14">
        {menuSteps.map((step, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            transition={{ duration: 0.5, delay: i * 0.3 }}
            className="flex"
          >
            <Card className="text-center p-3 sm:p-4 shadow-lg w-full h-full flex flex-col">
              <CardHeader className="flex-1 flex items-center justify-center p-2 sm:p-3">
                <div className="w-full h-[80px] sm:h-[100px] md:h-[120px] flex items-center justify-center">
                  <Image src={step.img} alt={step.name} className="mx-auto rounded-lg object-contain max-h-full" />
                </div>
              </CardHeader>
              <div className="flex-1 flex flex-col p-2">
                <h3 className="text-base sm:text-lg font-bold mt-1 sm:mt-2 mb-1">{step.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 flex-grow">{step.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <h2 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">Penilaian Pelanggan</h2>
      <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
        <Carousel className="w-full max-w-5xl px-6 sm:px-8">
          <CarouselContent className="mx-2 sm:mx-4">
            {review.map((rev, idx) => (
              <CarouselItem key={idx} className="basis-full sm:basis-1/2 lg:basis-1/3 p-1">
                <Card className="p-2 sm:p-3 md:p-4 shadow-md h-full">
                  <CardHeader className="p-2 sm:p-3">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 sm:mb-2">
                      {rev.pictures ? (
                        <Image src={rev.pictures} alt="reviewer" width={50} height={50} className="rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px]" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] rounded-full bg-gray-300"></div>
                      )}
                      <h4 className="text-xs md:text-sm font-semibold truncate">{rev.email}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-3">{rev.message}</p>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-6 sm:-left-8" />
          <CarouselNext className="hidden sm:flex -right-6 sm:-right-8" />
        </Carousel>
      </div>

      {/* <div className="text-center mb-6 sm:mb-8 md:mb-10">
        <Link href="/dashboard/menu">
          <Button className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-sm sm:text-base md:text-lg rounded-lg hover:bg-green-700 w-full sm:w-auto">
            Pesan Sekarang <ShoppingCart className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Button>
        </Link>
      </div> */}
    </div>
  );
};

export default Homepage;
