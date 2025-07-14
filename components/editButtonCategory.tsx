// File: src/components/EditButtonCategory.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Pen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import { InputFile } from './ui/input-file';

interface EditButtonProps {
  category: {
    id: string;
    name: string;
    icon: string | null;
    description: string;
  };
  onCategoryEdited: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function EditButton({ category, onCategoryEdited, onSuccess, onError, onLoading }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
  });


  useEffect(() => {
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
    });
  }, [category]);

  const EditCategoryForm = ({ className }: React.ComponentProps<'form'>) => {
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const handleFileChange = (file: File | null) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, "");
          setBase64Image(base64WithoutPrefix);
          setImagePreview(URL.createObjectURL(file));
        };
        reader.onerror = (error) => {
          console.error("Error membaca file:", error);
        };
        reader.readAsDataURL(file);
      }
      console.log("File dipilih:", file);
    };

    // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    //   const file = e.target.files?.[0];
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       const base64String = reader.result as string;
    //       const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, "");
    //       setBase64Image(base64WithoutPrefix);
    //       setImagePreview(URL.createObjectURL(file));
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      onLoading(true);
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      const form = new FormData(event.currentTarget);
      form.delete("icon");
      if (base64Image) {
        form.append("icon", base64Image);
      }
      try {
        const response = await axios.post(API_ENDPOINTS.EDIT_CATEGORY, form);
        console.log('Category edited successfully:', response.data);
        setOpen(false);
        onCategoryEdited(); // Call the function to refresh the category list
        onSuccess("Kategori berhasil diubah");
        onLoading(false);
      } catch (error) {
        console.error('Error editing category:', error);
        onError("Gagal mengubah kategori. Silakan coba lagi.");
        onLoading(false);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn("grid items-start gap-6 w-full", className)}>
        <div className="flex flex-row w-full gap-6">
          <div className="flex flex-col w-1/2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="id">
                ID Kategori <span className="text-red-500">*</span>
              </Label>
              <Input name="id" type="text" id="id" className="rounded-xl" value={formData.id} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nama Kategori <span className="text-red-500">*</span>
              </Label>
              <Input name="name" defaultValue={formData.name} id="name" className="rounded-xl" placeholder="Masukkan Nama Kategori" />
            </div>
            <div className="h-full">
              <Label className="mb-2" htmlFor="description">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                name="description"
                className="rounded-xl resize-none"
                id="description"
                placeholder="Masukkan Deskripsi Kategori"
                defaultValue={formData.description}
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2 gap-4">
            <div>
              <Label htmlFor="icon">
                Gambar <span className="text-red-500">*</span>
              </Label>
              <InputFile onChange={handleFileChange}/>
              <div className="p-3 mt-2 rounded-xl justify-center items-center flex md:w-[300px] md:h-[200px] lg:w-[385px] lg:h-[200px] bg-white">
                <AspectRatio ratio={16/9}>
                  <div className="relative w-full h-full rounded-xl bg-white">
                    {imagePreview ? (
                      <Image
                        className="rounded-xl object-cover"
                        fill
                        src={imagePreview}
                        alt="Gambar Kategori"
                      />
                    ) : formData.icon ? (
                      <Image
                        className="rounded-xl object-cover"
                        fill
                        src={`data:image/jpeg;base64,${formData.icon}`}
                        alt="Current"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Preview Gambar
                      </div>
                    )}
                  </div>
                </AspectRatio>
              </div>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end gap-4 border-t pt-6 mt-6">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mengubah..." : "Ubah"}
          </Button>
        </div>
      </form>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Ubah Kategori</DialogTitle>
      </DialogHeader>
      <EditCategoryForm />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[50px] p-2">
          <Pen className="sm:mr-2" size={12} />
          <span className="hidden sm:inline text-[12px]">Ubah</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] sm:max--[500px] bg-[#F4F7FE]">
        <Content />
      </DialogContent>
    </Dialog>
  );
}
