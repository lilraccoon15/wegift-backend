import fs from "fs";
import path from "path";

export function deleteFileIfExists(filePath: string) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
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
