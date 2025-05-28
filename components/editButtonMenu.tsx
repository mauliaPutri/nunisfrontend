import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pen } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { InputFile } from "./ui/input-file";

interface EditButtonProps {
  menu: {
    kode_menu: string;
    category_id: string;
    name: string;
    image: string;
    description: string;
    price: string;
    diskon_persen: string;
    diskon_rupiah: string;
    statusActive: number;
  };
  onMenuEdited: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function EditButton({ menu, onMenuEdited, onSuccess, onError, onLoading }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(menu);

  useEffect(() => {
    setFormData(menu);
  }, [menu]);

  const EditMenuForm = ({ className }: React.ComponentProps<"form">) => {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(formData.category_id);
    const [price, setPrice] = useState(formData.price);
    const [discountPercent, setDiscountPercent] = useState(formData.diskon_persen || "");
    const [discountAmount, setDiscountAmount] = useState(formData.diskon_rupiah || "");
    const [discountPercentError, setDiscountPercentError] = useState<string | null>(null);
    const [discountAmountError, setDiscountAmountError] = useState<string | null>(null);
    const [status, setStatus] = useState(formData.statusActive);

    useEffect(() => {
      setPrice(formData.price);
      setDiscountPercent(formData.diskon_persen || "");
      setDiscountAmount(formData.diskon_rupiah || "");
      setSelectedCategoryId(formData.category_id);
      setStatus(formData.statusActive);
    }, [formData]);

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
    //   const base64String = reader.result as string;
    //   const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, "");
    //   setBase64Image(base64WithoutPrefix);
    //   setImagePreview(URL.createObjectURL(file));
    // };
    //     reader.readAsDataURL(file);
    //   }
    // };

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

    const handleStatusChange = () => {
      setStatus(status === 1 ? 0 : 1);
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES);
        setCategories(response.data);
      } catch (error) {
        console.error("Ada kesalahan saat mengambil kategori:", error);
      }
    };

    useEffect(() => {
      fetchCategories();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      const formData = new FormData(event.currentTarget);
      formData.delete("image");
      if (base64Image) {
        formData.append("image", base64Image);
      }
      formData.append("statusActive", status.toString());
      

      try {
        const response = await axios.post(
          API_ENDPOINTS.EDIT_MENU,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Menu berhasil diubah:", response.data);
        setOpen(false);
        onMenuEdited();
        onSuccess("Menu berhasil diubah");
        onLoading(false);
      } catch (error) {
        console.error("Ada kesalahan saat mengubah menu:", error);
        onError("Gagal mengubah menu. Silakan coba lagi.");
        onLoading(false);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn("flex flex-row gap-4 w-full", className)}>
        <div className="w-full lg:w-1/2 p-1">
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="kode_menu">Kode Menu</Label>
              <Input
                id="kode_menu"
                name="kode_menu"
                defaultValue={formData.kode_menu}
                className="rounded-xl"
                placeholder="ID Menu"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="category_id">Kategori</Label>
              <Select
                name="category_id"
                value={selectedCategoryId}
                onValueChange={(value) => setSelectedCategoryId(value)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue>
                    {selectedCategoryId ? `${selectedCategoryId}` : "Pilih Kategori"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategori</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.id} : {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                className="rounded-xl"
                placeholder="Masukkan Nama Menu"
              />
            </div>
            <div>
              <Label htmlFor="price">Harga</Label>
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
            <div>
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={status === 1}
                  onCheckedChange={handleStatusChange}
                />
                <span>{status === 1 ? 'Aktif' : 'Tidak Aktif'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-2 w-full">
          <div className="w-full lg:w-full p-2">
            <div className="flex flex-col gap-2 w-full">
              <div>
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
                      ) : formData.image ? (
                        <Image
                          className="rounded-xl object-cover"
                          fill
                          src={`data:image/jpeg;base64,${formData.image}`}
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
                defaultValue={formData.description}
                className="rounded-xl h-[10px] resize-none"
                placeholder="Masukkan Deskripsi Menu"
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mengubah..." : "Ubah"}
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
        <DialogTitle>Ubah Menu</DialogTitle>
      </DialogHeader>
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[50px] p-2">
            <Pen className="sm:mr-2" size={12} />
            <span className="hidden sm:inline text-[12px]">Ubah</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] sm:max-h-[700px] bg-white">
          <Content>
            <EditMenuForm />
          </Content>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[30px] p-2">
          <Pen className="sm:mr-2" size={12} />
          <span className="hidden sm:inline text-[12px]">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] sm:max-h-[700px] bg-white">
        <Content>
          <EditMenuForm className="px-4" />
        </Content>
      </DialogContent>
    </Dialog>
  );
}