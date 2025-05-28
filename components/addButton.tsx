import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";

export default function AddButton() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const AddCategoryForm = ({ className }: React.ComponentProps<"form">) => {
    return (
      <form className={cn("grid items-start gap-4 w-full", className)}>
        <div className="flex flex-row w-full gap-2 ">
          <div className="flex flex-col w-1/2" >
            <div className="grid gap-2">
              <Label htmlFor="category-id">ID Kategori</Label>
              <Input type="text" id="category-id" className="rounded-xl" placeholder="ID Kategori" />
            </div>
            <div className="h-full mt-2 ">
              <Label className="w-full mb-2 h-fit" htmlFor="description">Deskripsi</Label>
              <Textarea
              className="rounded-xl h-full"
                id="description"
                placeholder="Deskripsi Kategori"
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input id="category-name" className="rounded-xl" placeholder="Nama Kategori" />
            </div>
            <div className="mt-9 flex items-center h-full justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Pilih Gambar</span>
                  </p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </form>
    );
  };

  const Content = ({ children }: { children: React.ReactNode }) => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Tambah Kategori</DialogTitle>
      </DialogHeader>
      {children}
      <DialogFooter className="border-t mt-4"> 
        <Button type="button" className="mt-3" variant="secondary">
          Batal
        </Button>
        <Button type="submit" className="mt-3">Tambah</Button>
      </DialogFooter>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-[#F4F7FE] text-black">
            <Plus className="mr-2 h-4 w-4" /> Tambah
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] sm:max--[500px] bg-[#F4F7FE] ">
          <Content>
            <AddCategoryForm />
          </Content>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="bg-[#F4F7FE] text-black">
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Tambah Kategori</DrawerTitle>
        </DrawerHeader>
        <Content>
          <AddCategoryForm className="px-4" />
        </Content>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
