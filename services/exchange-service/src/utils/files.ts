export function getUploadedPicturePath(
    file: Express.Multer.File | undefined,
    folder = "uploads"
): string | undefined {
    return file ? `/uploads/${folder}/${file.filename}` : undefined;
}
