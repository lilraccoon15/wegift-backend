import { v2 as cloudinary } from "cloudinary";

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: !!process.env.CLOUDINARY_API_SECRET, // true ou false
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

if (process.env.NODE_ENV === "production") {
  console.log("✅ Cloudinary config (prod):", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
}

cloudinary.api
  .ping()
  .then(() => console.log("✅ Connexion Cloudinary OK"))
  .catch((err) => console.error("❌ Connexion Cloudinary FAIL:", err));

export default cloudinary;
