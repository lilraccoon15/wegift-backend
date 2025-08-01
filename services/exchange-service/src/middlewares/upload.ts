import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

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
    match: ["/create-exchange", "/update-exchange"],
    folder: "exchangePictures",
    prefix: "exchange_picture",
  },
];

const isProduction = process.env.NODE_ENV === "production";

let storage: StorageEngine;

if (isProduction) {
  // Cloudinary en production
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinary = require("../config/cloudinary").default;

  const getConfig = (req: Request) =>
    uploadConfig.find((c) =>
      c.match.some((m) => req.originalUrl.includes(m))
    ) ?? { folder: "misc", prefix: "file" };

  storage = new CloudinaryStorage({
    cloudinary,
    params: (req: Request) => {
      const { folder, prefix } = getConfig(req);
      const publicId = `${prefix}_${uuidv4()}`;

      return {
        folder,
        public_id: publicId,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      };
    },
  });
} else {
  // Stockage local en développement
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const url = req.originalUrl;

      const config = uploadConfig.find((c) =>
        c.match.some((m) => url.includes(m))
      );

      const folder = `public/uploads/${config?.folder || "others"}/`;

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
      const uniqueName = uuidv4();
      const ext = path.extname(file.originalname);

      cb(null, `${prefix}_${uniqueName}${ext}`);
    },
  });
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
