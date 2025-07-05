"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link'
import axios from "axios";
import { Card, CardHeader } from "@/components/ui/card";
import { CategorySkeleton } from "@/app/skeleton/skeletonCategory";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { motion } from "framer-motion";
import FadeUp from "@/components/animation/fadeUp";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    name: string;
    icon: string | null;
    description: string;
}
function Categorypage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES);
                setCategories(response.data);
            } catch (error) {
                console.error('Terjadi kesalahan saat mengambil kategori!', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);
    if (loading) {
        return <CategorySkeleton />;
    }

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/dashboard/menu?categoryId=${categoryId}`);
    };

    return (
        <div className="container px-4 py-10 ">
            <FadeUp>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-green-700">Kategori Menu</h1>
                    <div className="w-40 h-1 bg-green-600 mx-auto mt-3 rounded-full"></div>
                </div>
            </FadeUp>

            <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                {categories.map((category, index) => (
                    <motion.div
                        key={index}
                        onClick={() => handleCategoryClick(category.id)}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="cursor-pointer group transition-transform duration-300 hover:scale-[1.04]"
                    >
                        <Card className="rounded-3xl shadow-lg hover:shadow-2xl border border-green-200 transition-shadow duration-300 bg-gradient-to-tr from-white to-green-50">
                            <CardHeader className="flex justify-center items-center pt-6 pb-0">
                                <div className="w-40 h-40 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-4 border-green-300">
                                    {category.icon ? (
                                        <img
                                            src={`data:image/jpeg;base64,${category.icon}`}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No Img</span>
                                    )}
                                </div>
                            </CardHeader>

                            <div className="px-6 pt-4 pb-6 text-center">
                                <h2 className="text-2xl font-bold text-green-700 mb-3">{category.name}</h2>
                                <p className="text-base text-gray-700 leading-relaxed max-h-[120px] overflow-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
                                    {category.description}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Categorypage