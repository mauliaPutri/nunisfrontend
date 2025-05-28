"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import profileIcon from '../../../public/UserEdit.png';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ProfileSkeleton } from "@/app/skeleton/skeletonProfile";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { motion } from "framer-motion";
import { Mail, MapPin, Pencil, Phone, User } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "recharts";
import { InputFile } from "@/components/ui/input-file";

function Profilepage() {
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [editField, setEditField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleEditClick = (field: string, value: string) => {
        setEditField(field);
        setEditValue(value);
        console.log(editValue);
    };

    const handleUpdateSingleField = async () => {
        if (!editField) return;

        try {
            const updateData = {
                email: userData.email,
                [editField]: editValue
            };

            const response = await axios.post(API_ENDPOINTS.UPDATE_USER_PROFILE, updateData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setUserData({
                    ...userData,
                    [editField]: editValue
                });
                alert("Data berhasil diperbarui!");
                setEditField(null);
                setEditValue("");
                console.log(userData);
            } else {
                throw new Error("Gagal memperbarui data");
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat memperbarui data', error);
            alert("Gagal memperbarui data");
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const userinfo = localStorage.getItem("user-info");
            let email = userinfo ? userinfo.replace(/["]/g, "") : "";
            if (!email) {
                setError("Email tidak ditemukan di localStorage");
                return;
            }

            try {
                const response = await axios.get(
                    API_ENDPOINTS.USER(email)
                );
                setUserData(response.data);
            } catch (err) {
                setError("Gagal mengambil data user");
                console.error(err);
            }
        };

        fetchUserData();
    }, []);

    const handleImageChange = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setSelectedImage(base64String);
            };
            reader.onerror = (error) => {
                console.error("Error membaca file:", error);
            };
            reader.readAsDataURL(file);
        }
        console.log("File dipilih:", file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedImage || !userData) {
            return;
        }

        setIsUploading(true);

        try {
            const response = await axios.post(
                API_ENDPOINTS.UPLOAD_PROFILE_PICTURE,
                {
                    image: selectedImage,
                    email: userData.email
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setUserData({ ...userData, pictures: response.data.image_url });
                alert("Gambar profil berhasil diperbarui!");
                setIsDialogOpen(false);
            } else {
                throw new Error("Gagal mengunggah gambar");
            }
        } catch (error) {
            console.error("Terjadi kesalahan saat mengunggah gambar:", error);
            alert("Gagal mengunggah gambar");
        } finally {
            setIsUploading(false);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!userData) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="container vh-100 flex items-center justify-center sm:w-full">
            <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                id="box" className="p-5 shadow-lg rounded-lg bg-light sm:w-1/2">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative group">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <div className="relative cursor-pointer transition-all duration-300 hover:scale-105">
                                    <Avatar className="h-[180px] w-[180px] border-4 border-[#61AB5B] shadow-lg">
                                        <AvatarImage 
                                            src={userData.pictures || profileIcon.src} 
                                            width={180} 
                                            height={180} 
                                            alt="profil"
                                            className="object-cover" 
                                        />
                                        <AvatarFallback className="bg-[#4ED4F1] text-white text-3xl font-bold">
                                            {userData.nama?.substring(0, 2).toUpperCase() || "CN"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white text-sm font-medium">Ubah Foto</span>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[450px] bg-white rounded-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-center">Unggah Foto Profil</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 flex flex-col items-center">
                                    <form onSubmit={handleSubmit} className="w-full">
                                        <div className="mb-6 flex justify-center">
                                            <Avatar className="w-[220px] h-[220px] border-4 border-[#61AB5B] shadow-lg">
                                                <AvatarImage 
                                                    src={selectedImage || userData.pictures || profileIcon.src} 
                                                    alt="profil"
                                                    className="object-cover" 
                                                />
                                                <AvatarFallback className="bg-[#4ED4F1] text-white text-4xl font-bold">
                                                    {userData.nama?.substring(0, 2).toUpperCase() || "CN"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="mb-6">
                                            <InputFile onChange={handleImageChange}/>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsDialogOpen(false)}
                                                className="px-4 py-2"
                                            >
                                                Batal
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={isUploading}
                                                className="bg-[#61AB5B] hover:bg-[#4c8a48] text-white px-4 py-2"
                                            >
                                                {isUploading ? 'Mengunggah...' : 'Simpan Perubahan'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">Nama</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {editField === 'nama' ? (
                                    <>
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-40"
                                        />
                                        <Button onClick={handleUpdateSingleField}>Simpan</Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-600">{userData.nama}</span>
                                        <Pencil
                                            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            onClick={() => handleEditClick('nama', userData.nama)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">Email</span>
                            </div>
                            <span className="text-gray-600">{userData.email}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">Alamat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {editField === 'address' ? (
                                    <>
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-40"
                                        />
                                        <Button onClick={handleUpdateSingleField}>Simpan</Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-600">{userData.address}</span>
                                        <Pencil
                                            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            onClick={() => handleEditClick('address', userData.address)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span className="font-medium">No.Telepon</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {editField === 'phone' ? (
                                    <>
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-40"
                                        />
                                        <Button onClick={handleUpdateSingleField}>Simpan</Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-600">{userData.phone}</span>
                                        <Pencil
                                            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            onClick={() => handleEditClick('phone', userData.phone)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 text-gray-400">
                        <p>copyright@byNunisWarung</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
export default Profilepage;
