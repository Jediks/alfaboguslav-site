"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAssetRecord } from "@/lib/actions/assets";
import type { SavedAsset } from "@/types/database";

type AccountAssetsClientProps = {
  initialAssets: SavedAsset[];
};

export function AccountAssetsClient({ initialAssets }: AccountAssetsClientProps) {
  const t = useTranslations("account");
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState(initialAssets);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFile = async (file: File) => {
    if (!file.type.match(/image\/(png|svg\+xml|jpeg|webp)/)) return;
    if (file.size > 5 * 1024 * 1024) return;

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasSupabase) {
      setStatus("error");
      return;
    }

    setIsUploading(true);
    setStatus("idle");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `assets/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("branding").upload(path, file);

      if (uploadError) {
        setStatus("error");
        return;
      }

      const { data } = supabase.storage.from("branding").getPublicUrl(path);

      startTransition(() => {
        void (async () => {
          const result = await uploadAssetRecord({
            fileUrl: data.publicUrl,
            fileName: file.name,
          });

          if (!result.ok || !result.asset) {
            setStatus("error");
            return;
          }

          const saved = result.asset;
          setAssets((prev) => [saved, ...prev]);
          setStatus("success");
          if (inputRef.current) inputRef.current.value = "";
        })();
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || isPending}
          className="flex w-full flex-col items-center gap-3 py-4 text-center transition-colors hover:text-primary disabled:opacity-60"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{t("assetsUpload")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("assetsHint")}</p>
          </div>
        </button>
      </div>

      {status === "success" && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {t("assetsUploadSuccess")}
        </p>
      )}
      {status === "error" && <p className="text-sm text-destructive">{t("assetsUploadError")}</p>}

      {assets.length === 0 ? (
        <p className="text-muted-foreground">{t("assetsEmpty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="surface-panel rounded-2xl p-4"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-xl border bg-white">
                <Image
                  src={asset.file_url}
                  alt={asset.file_name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <p className="mt-3 truncate text-sm font-medium">{asset.file_name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
