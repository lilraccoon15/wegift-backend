import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const isProduction = process.env.NODE_ENV === "production";

export const deleteImage = async (imagePath: string) => {
  if (!imagePath) return;

  if (isProduction) {
    const segments = imagePath.split("/");
    const filename = segments.pop() || "";
    const folder = segments.slice(-1)[0];
    const publicId = `${folder}/${filename.split(".")[0]}`;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Erreur suppression Cloudinary :", err);
    }
  } else {
    const fullPath = path.join(__dirname, "../../public", imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
