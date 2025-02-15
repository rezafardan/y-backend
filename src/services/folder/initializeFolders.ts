import fs from "fs";

const createFolderIfNotExists = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`Created folder: ${folder}`);
  }
};

// RUN FUNCTION ON START SERVER DEPLOY
const initializeFolders = () => {
  const folders = [
    "public/assets/blog",
    "public/assets/blog/content",
    "public/assets/profile-image",
  ];

  folders.forEach(createFolderIfNotExists);
};

export default initializeFolders;
