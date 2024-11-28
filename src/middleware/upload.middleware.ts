import multer from "multer";
import path from "path";
import crypto from "crypto";

const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination(req, file, callback) {
      callback(null, `public/assets/${folder}`);
    },
    filename(req, file, callback) {
      const randomId = crypto.randomBytes(16).toString("hex");
      const fileExtension = path.extname(file.originalname); // Mengambil ekstensi file
      const fileName = `${randomId}${fileExtension}`;

      callback(null, fileName);
    },
  });
};

export const uploadProfile = multer({
  storage: createStorage("profile-image"),
});

export const uploadBlog = multer({
  storage: createStorage("blog"),
});
