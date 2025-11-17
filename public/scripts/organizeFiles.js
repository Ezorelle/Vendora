// organizeFiles.js
const fs = require("fs");
const path = require("path");

const baseDir = __dirname;

// Folder structure rules
const folders = {
  html: "public",
  css: "styles",
  js: "scripts",
  png: "images",
  jpg: "images",
  jpeg: "images",
  gif: "images",
  svg: "images",
};

// Create folders if they don’t exist
Object.values(folders).forEach((folder) => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created folder: ${folder}`);
  }
});

// Organize files
fs.readdirSync(baseDir).forEach((file) => {
  const ext = path.extname(file).slice(1);
  const folderName = folders[ext];
  if (folderName) {
    const oldPath = path.join(baseDir, file);
    const newPath = path.join(baseDir, folderName, file);
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file} → ${folderName}/`);
  }
});

console.log("\n✅ Files organized successfully!");