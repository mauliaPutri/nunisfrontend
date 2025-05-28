import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { log } from "console";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { InputFile } from "./ui/input-file";

interface ButtonAddProps {
  onCategoryAdded: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function ButtonAdd({
  onCategoryAdded,
  onSuccess,
  onError,
  onLoading,
}: ButtonAddProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    onLoading(true);
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.delete("icon");

    try {
      const response = await axios.post(API_ENDPOINTS.ADD_CATEGORY, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setOpen(false);
      onCategoryAdded();
      onSuccess("Kategori berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Gagal menambahkan kategori. Silakan coba lagi.");
      onError("Gagal menambahkan kategori. Silakan coba lagi.");
    } finally {
      onLoading(false);
      setIsSubmitting(false);
    }
  };

  const AddCategoryForm = ({ className }: React.ComponentProps<"form">) => {
    const [idValue, setIdValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const isFormValid = idValue.trim() && nameValue.trim() && descriptionValue.trim() && base64Image;

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
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData(event.currentTarget);
      formData.delete("icon");

      if (base64Image) {
        formData.append("icon", base64Image);
      }

      try {
        const response = await axios.post(API_ENDPOINTS.ADD_CATEGORY, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setOpen(false);
        onCategoryAdded();
        onSuccess("Kategori berhasil ditambahkan");
      } catch (error) {
        console.error("Error adding category:", error);
        setError("Gagal menambahkan kategori. Silakan coba lagi.");
        onError("Gagal menambahkan kategori. Silakan coba lagi.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn("grid items-start gap-6 w-full", className)}>
        <div className="flex flex-row w-full gap-6">
          <div className="flex flex-col w-1/2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="id">ID Kategori</Label>
              <Input name="id" value={idValue} onChange={e => setIdValue(e.target.value)} type="text" id="id" className="rounded-xl" placeholder="ID Kategori" required title="Masukkan ID Kategori"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input name="name" value={nameValue} onChange={e => setNameValue(e.target.value)} id="name" className="rounded-xl" placeholder="Nama Kategori" required title="Masukkan Nama Kategori"/>
            </div>
            <div className="h-full">
              <Label className="mb-2" htmlFor="description">Deskripsi</Label>
              <Textarea
                name="description"
                value={descriptionValue}
                onChange={e => setDescriptionValue(e.target.value)}
                className="rounded-xl resize-none"
                id="description"
                placeholder="Deskripsi Kategori"
                title="Masukkan Deskripsi Kategori"
                required
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2 gap-4">
            <div>
              <Label htmlFor="icon">Gambar</Label>
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
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Gambar
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
          <Button type="submit" disabled={!isFormValid}>
            {isSubmitting ? "Menambahkan..." : "Tambah"}
          </Button>
        </div>
      </form>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Tambah Kategori</DialogTitle>
      </DialogHeader>
      <AddCategoryForm />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#F4F7FE] text-black rounded-full hover:bg-gray-300">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-[#F4F7FE]">
        <Content />
      </DialogContent>
    </Dialog>
  );
}
