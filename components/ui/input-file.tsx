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
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null

    if (file) {
      setFileName(file.name)
    } else {
      setFileName(null)
    }

    // Memanggil fungsi onChange yang diberikan dari prop
    if (onChange) {
      onChange(file)
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
        <Input id="picture" type="file" ref={inputRef} onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}