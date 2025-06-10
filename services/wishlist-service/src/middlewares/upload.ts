import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/wishlistPictures/");
    },
    filename: function (req, file, cb) {
        const wishlistId = (req as any).wishlist?.id || "unknown";
        const ext = path.extname(file.originalname);
        cb(null, `wishlist_${wishlistId}_pp${ext}`);
    },
});

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format d’image non supporté"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});