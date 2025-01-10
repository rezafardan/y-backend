import sharp from "sharp";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

const compressImage = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const { path: tempPath, filename } = req.file;
    const outputFolder = `public/assets/${folder}`;
    const tempFolder = `public/assets/temp/uploads`; // Temporary folder
    const tempFilePath = path.join(tempFolder, filename);
    const outputPath = path.join(outputFolder, filename);

    try {
      // Buat folder sementara jika belum ada
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      // Pindahkan file ke folder sementara
      fs.renameSync(tempPath, tempFilePath);

      // Buat folder tujuan jika belum ada
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
      }

      // Proses kompresi dan resize ke folder tujuan
      await sharp(tempFilePath)
        .resize(800) // Resize ke lebar max 800px
        .jpeg({ quality: 80 }) // Kompres dengan kualitas 80%
        .toFile(outputPath);

      // Hapus file sementara
      fs.unlinkSync(tempFilePath);

      // Update path file di request
      req.file.path = outputPath;

      next();
    } catch (error) {
      console.error("Image compression error:", error);

      // Hapus file sementara jika error terjadi
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      next(error);
    }
  };
};

export default compressImage;
