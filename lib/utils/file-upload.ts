import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Uploads a file directly to Supabase Storage from the client
 * This bypasses Vercel's 4.5MB request body limit
 *
 * @param file - The file to upload
 * @param userId - User ID for organizing files
 * @param applicationId - Application ID (optional, for application documents)
 * @param type - Type of document (id, cog, cor, or custom)
 * @returns The storage path of the uploaded file
 */
export async function uploadFileToSupabase(
  file: File,
  userId: string,
  applicationId?: string,
  type: "id" | "cog" | "cor" | string = "documents"
): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("Supabase session error:", sessionError);
    throw new Error("You must be logged in to upload files");
  }

  // Generate file path
  const timestamp = Date.now();
  let filePath: string;

  if (applicationId) {
    filePath = `applications/${userId}/${applicationId}/${type}-${timestamp}-${file.name}`;
  } else {
    filePath = `${userId}/${type}/${timestamp}-${file.name}`;
  }

  console.log("Uploading file to Supabase:", {
    filePath,
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    type,
  });

  // Upload file directly to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType:
        file.type ||
        (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("File upload error details:", {
      error: uploadError,
      message: uploadError.message,
      name: uploadError.name,
      filePath,
      fileName: file.name,
    });
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  if (!uploadData) {
    throw new Error("Upload succeeded but no data returned");
  }

  console.log("✅ File uploaded successfully to Supabase:", uploadData.path);

  // Return the storage path (not public URL, as it might be in a private bucket)
  return uploadData.path;
}

/**
 * Gets the public URL for a file stored in Supabase Storage
 *
 * @param filePath - The storage path returned from uploadFileToSupabase
 * @returns The public URL
 */
export function getSupabaseFileUrl(filePath: string): string {
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Checks if a file should be uploaded directly to Supabase (bypassing API route)
 * Files larger than 3MB should be uploaded directly to avoid Vercel's 4.5MB limit
 *
 * @param file - The file to check
 * @returns true if file should be uploaded directly
 */
export function shouldUploadDirectly(file: File): boolean {
  const sizeInMB = file.size / (1024 * 1024);
  return sizeInMB > 3; // 3MB threshold (base64 adds ~33% overhead, so 3MB base64 ≈ 4MB original)
}
