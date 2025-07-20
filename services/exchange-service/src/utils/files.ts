import path from "path";
import fs from "fs";

export function getUploadedPicturePath(
    file: Express.Multer.File | undefined,
    folder = "uploads"
): string | undefined {
    return file ? `/uploads/${folder}/${file.filename}` : undefined;
}

export function getUploadFolderPath(folder: string) {
    return path.join(__dirname, `../../public/uploads/${folder}`);
}

export function tryDeleteLocalImage(
    relativePath: string | null,
    folder: string
): void {
    if (!relativePath || relativePath.startsWith("http")) return;

    const uploadDir = getUploadFolderPath(folder);
    const filename = path.basename(relativePath);
    const fullPath = path.join(uploadDir, filename);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
