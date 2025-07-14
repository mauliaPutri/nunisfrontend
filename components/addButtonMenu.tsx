// components/AddButton.tsx

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import axios from "axios";
import { AspectRatio } from "./ui/aspect-ratio";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { APP_BUILD_MANIFEST } from "next/dist/shared/lib/constants";
import { InputFile } from "./ui/input-file";
import { DialogClose } from "@radix-ui/react-dialog";

interface ButtonAddProps {
  onMenuAdded: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function AddButton({ onMenuAdded, onSuccess, onError, onLoading }: ButtonAddProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [error, setError] = useState<string | null>(null);

  const AddCategoryForm = ({ className }: React.ComponentProps<"form">) => {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [menuName, setMenuName] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [discountPercent, setDiscountPercent] = useState<string>("");
    const [discountAmount, setDiscountAmount] = useState<string>("");
    const [discountPercentError, setDiscountPercentError] = useState<string | null>(null);
    const [discountAmountError, setDiscountAmountError] = useState<string | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
      setIsFormValid(
        Boolean(selectedCategoryId) && 
        menuName.trim() !== "" && 
        price.trim() !== ""
      );
    }, [selectedCategoryId, menuName, price]);

    const handleMenuNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMenuName(e.target.value);
    };

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

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPrice(e.target.value);
      setDiscountPercent("");
      setDiscountAmount("");
      setDiscountPercentError(null);
      setDiscountAmountError(null);
    };

    const handleDiscountPercentChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (parseInt(value) > 100) {
        setDiscountPercentError("Diskon tidak boleh melebihi 100%");
        setDiscountPercent("100");
      } else {
        setDiscountPercent(value);
        setDiscountPercentError(null);
        if (price && value) {
          const discount = (parseInt(price) * parseInt(value)) / 100;
          setDiscountAmount(discount.toFixed(2));
        }
      }
    };

    const handleDiscountAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (price && parseInt(value) > parseInt(price)) {
        setDiscountAmountError("Diskon tidak boleh melebihi harga");
        setDiscountAmount(price);
      } else {
        setDiscountAmount(value);
        setDiscountAmountError(null);
        if (price && value) {
          const discount = (parseInt(value) / parseInt(price)) * 100;
          setDiscountPercent(discount.toFixed(2));
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES);
        setCategories(response.data);
      } catch (error) {
        console.error("Ada kesalahan saat mengambil kategori", error);
      }
    };

    useEffect(() => {
      fetchCategories();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      const formData = new FormData(event.currentTarget);
      formData.append('category_id', selectedCategoryId);
      formData.append('name', menuName);
      formData.append('price', price);
      formData.append('diskon_persen', discountPercent || '0');
      formData.append('diskon_rupiah', discountAmount || '0');
      formData.append('description', event.currentTarget.description.value);
      formData.append('image', base64Image || '');
      formData.append('statusActive', '1');
      onLoading(true);

      try {
        const response = await axios.post(API_ENDPOINTS.ADD_MENU_ITEMS, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Menu berhasil ditambahkan:", response.data);
        setOpen(false);
        onMenuAdded();
        onSuccess("Menu berhasil ditambahkan");
        onLoading(false);
      } catch (error) {
        console.error("Ada kesalahan saat menambahkan menu", error);
        onError("Ada kesalahan saat menambahkan menu. Silakan coba lagi.");
        onLoading(false);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-row gap-4 w-full", className)}
      >
        <div className="w-full lg:w-1/2 p-1">
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="category_id">
                ID Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                name="category_id"
                value={selectedCategoryId}
                onValueChange={(value) => setSelectedCategoryId(value)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue>
                    {selectedCategoryId || "Pilih Kategori"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategori</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <b>{category.id}</b> : {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">
                Nama Menu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={menuName}
                onChange={handleMenuNameChange}
                className="rounded-xl"
                placeholder="Masukkan Nama Menu"
              />
            </div>
            <div>
              <Label htmlFor="price">
                Harga <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                value={price}
                onChange={handlePriceChange}
                className="rounded-xl"
                placeholder="Masukkan Harga Menu"
              />
            </div>
            <div>
              <Label htmlFor="diskon_persen">Diskon Persen</Label>
              <Input
                id="diskon_persen"
                name="diskon_persen"
                value={discountPercent}
                onChange={handleDiscountPercentChange}
                className="rounded-xl"
                placeholder="Masukkan Diskon Persen"
              />
              {discountPercentError && <p className="text-red-500">{discountPercentError}</p>}
            </div>
            <div>
              <Label htmlFor="diskon_rupiah">Diskon Rupiah</Label>
              <Input
                id="diskon_rupiah"
                name="diskon_rupiah"
                value={discountAmount}
                onChange={handleDiscountAmountChange}
                className="rounded-xl"
                placeholder="Masukkan Diskon Rupiah"
              />
              {discountAmountError && <p className="text-red-500">{discountAmountError}</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <div className="w-full lg:w-full p-2">
            <div className="flex flex-col gap-2 w-full">
              <div >
                <Label htmlFor="image">Gambar</Label>
                <InputFile onChange={handleFileChange} />
                <div className="p-3 mt-2 rounded-xl justify-center items-center flex sm:w-[100px] sm:h-[100px] md:w-[200px] md:h-[200px] lg:w-[300px] lg:h-[300px] bg-white">
                  <AspectRatio ratio={4 / 3}>
                    <div className="relative w-full h-full rounded-xl bg-white">
                      {imagePreview ? (
                        <Image
                          className="rounded-xl object-cover"
                          fill
                          src={imagePreview}
                          alt="Gambar Menu"
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
          <div className="w-full lg:w-full p-2">
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                className="rounded-xl h-[10px] resize-none"
                placeholder="Masukkan Deskripsi Menu"
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? "Menambahkan..." : "Tambah"}
              </Button>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    );
  };

  const Content = ({ children }: { children: React.ReactNode }) => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Tambah Menu</DialogTitle>
      </DialogHeader>
      <AddCategoryForm />
    </div>
  );


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#F4F7FE] text-black rounded-full hover:bg-gray-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] sm:max--[500px] bg-light">
        <Content>
          <AddCategoryForm className="px-4" />
        </Content>
      </DialogContent>
    </Dialog>
  );
}
