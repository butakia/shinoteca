import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

if (cloudinaryEnabled) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

// Free hosts like Vercel don't give the app a persistent, writable disk, so in
// production uploads go to Cloudinary. Locally, with no Cloudinary
// credentials set, this falls back to writing into public/uploads.
export async function uploadPublicFile(
  bytes: Buffer,
  filename: string,
  options: { resourceType?: "image" | "video" } = {},
): Promise<string> {
  if (cloudinaryEnabled) {
    const dataUri = `data:application/octet-stream;base64,${bytes.toString("base64")}`;
    const publicId = filename.replace(/\.[^.]+$/, "");
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "shinoteca",
      public_id: publicId,
      resource_type: options.resourceType ?? "image",
      overwrite: false,
    });
    return result.secure_url;
  }

  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
