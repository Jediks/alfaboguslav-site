"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProductImageUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const next = [...images];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 8 * 1024 * 1024) continue;

        if (hasSupabase) {
          const supabase = createClient();
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from("branding").upload(path, file);
          if (!error) {
            const { data } = supabase.storage.from("branding").getPublicUrl(path);
            next.push(data.publicUrl);
          }
        } else {
          next.push(URL.createObjectURL(file));
        }
      }
      onChange(next);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <Image src={url} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1 h-4 w-4" />
        {uploading ? "Завантаження…" : "Додати фото"}
      </Button>
    </div>
  );
}
