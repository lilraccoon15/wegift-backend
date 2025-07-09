import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { UUIDV4 } from "sequelize";

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format d’image non supporté"));
  }
};

const uploadConfig = [
  {
    match: ["/create-wishlist", "/update-wishlist"],
    folder: "public/uploads/wishlistPictures/",
    prefix: "wishlist_picture",
  },
  {
    match: ["/create-wish", "/update-wish"],
    folder: "public/uploads/wishPictures/",
    prefix: "wish_picture",
  },
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const url = req.originalUrl;

    const config = uploadConfig.find((c) =>
      c.match.some((m) => url.includes(m))
    );

    const folder = config?.folder || "public/uploads/others/";

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const url = req.originalUrl;
    const config = uploadConfig.find((c) =>
      c.match.some((m) => url.includes(m))
    );

    const prefix = config?.prefix || "file";
    const uniqueName = UUIDV4();
    const ext = path.extname(file.originalname);

    cb(null, `${prefix}_${uniqueName}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
