"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface InputFileProps {
  onChange?: (file: File | null) => void
  label?: string
}

export function InputFile({ onChange }: InputFileProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null
    setError(null)

    if (file) {
      // Validasi ukuran file (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 1MB")
        setFileName(null)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        return
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        setError("File harus berupa gambar")
        setFileName(null)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        return
      }

      setFileName(file.name)
      if (onChange) {
        onChange(file)
      }
    } else {
      setFileName(null)
      if (onChange) {
        onChange(null)
      }
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" onClick={handleButtonClick} className="w-full">
          Pilih File
        </Button>
        {fileName && <p className="text-sm break-words">File terpilih: {fileName}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Input id="picture" type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
    </div>
  )
}