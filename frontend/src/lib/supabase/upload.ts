import { createClient } from "@/lib/supabase/client";

export async function uploadFile(
  file: File,
  folder: "weighbridge" | "delivery-proof"
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  try {
    // 1. Validate file exists
    if (!file) {
      return { url: null, error: "No file selected" };
    }

    // 2. Validate file size (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { url: null, error: "File size must be less than 10MB" };
    }

    // 3. Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: "Invalid file type. Please use JPG, PNG, PDF, or MP4." };
    }

    // 4. Create unique filename to prevent overwrites
    const fileExt = file.name.split(".").pop() || "bin";
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileName = `${folder}/${Date.now()}-${randomString}.${fileExt}`;

    // 5. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("delivery-uploads")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase storage upload error:", error);
      return { url: null, error: error.message || "Failed to upload file." };
    }

    // 6. Get public URL
    const { data: urlData } = supabase.storage
      .from("delivery-uploads")
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error("❌ Upload exception:", error);
    return { url: null, error: error.message || "An unexpected error occurred during upload." };
  }
}