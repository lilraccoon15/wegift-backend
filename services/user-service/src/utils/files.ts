import path from "path";

export function getUploadFolderPath(folder: string) {
    return path.join(__dirname, `../../public/uploads/${folder}`);
}
