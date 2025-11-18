import { getSupabaseServerClient } from "@/lib/supabase/server";

interface DocumentUploadParams {
  base64: string;
  fileName: string;
  userId: string;
  applicationId: string;
  type: "cog" | "cor" | "id";
}

export async function uploadDocumentFromBase64(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  { base64, fileName, userId, applicationId, type }: DocumentUploadParams
): Promise<string | null> {
  try {
    const cleaned = base64.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(cleaned, "base64");
    const filePath = `applications/${userId}/${applicationId}/${type}-${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: fileName.endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`${type.toUpperCase()} upload error:`, uploadError);
      return null;
    }

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error(`Failed to upload ${type} document:`, error);
    return null;
  }
}

export function resolveStoredDocumentUrl(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  path?: string | null
): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return data.publicUrl ?? null;
}

