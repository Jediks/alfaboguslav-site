"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { SavedAsset } from "@/types/database";

type UploadAssetRecordInput = {
  fileUrl: string;
  fileName: string;
};

export async function listAssets(): Promise<SavedAsset[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[listAssets]", error);
    return [];
  }

  return data;
}

export async function uploadAssetRecord(
  input: UploadAssetRecordInput
): Promise<{ ok: boolean; asset?: SavedAsset; error?: string }> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const fileUrl = input.fileUrl.trim();
  const fileName = input.fileName.trim();
  if (!fileUrl || !fileName) {
    return { ok: false, error: "Invalid asset payload" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("saved_assets")
    .insert({
      user_id: user.id,
      file_url: fileUrl,
      file_name: fileName,
    } as never)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[uploadAssetRecord]", error);
    return { ok: false, error: "Failed to save asset record" };
  }

  return { ok: true, asset: data as SavedAsset };
}
