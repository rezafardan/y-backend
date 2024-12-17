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
      const fileExtension = path.extname(file.originalname);
      const fileName = `${randomId}${fileExtension}`;

      callback(null, fileName);
    },
  });
};

export const uploadCover = multer({
  storage: createStorage("blog"),
});

export const uploadContent = multer({
  storage: createStorage("blog/content"),
});

export const uploadProfile = multer({
  storage: createStorage("profile-image"),
});
