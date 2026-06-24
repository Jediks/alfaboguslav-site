"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LogoUploadProps = {
  onUploaded: (url: string) => void;
  currentUrl?: string;
};

export function LogoUpload({ onUploaded, currentUrl }: LogoUploadProps) {
  const t = useTranslations("product");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  const handleFile = async (file: File) => {
    if (!file.type.match(/image\/(png|svg\+xml|jpeg|webp)/)) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      if (hasSupabase) {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `logos/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("branding")
          .upload(path, file);

        if (!error) {
          const { data } = supabase.storage.from("branding").getPublicUrl(path);
          setPreview(data.publicUrl);
          onUploaded(data.publicUrl);
        }
      } else {
        const url = URL.createObjectURL(file);
        setPreview(url);
        onUploaded(url);
      }
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-white">
            <Image src={preview} alt="Logo" fill className="object-contain p-1" />
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {t("logoUploaded")}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={clear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-3 py-4 text-center transition-colors hover:text-primary"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{t("logoUpload")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("logoHint")}</p>
          </div>
        </button>
      )}
    </div>
  );
}
