const multer = require("multer");
const fs = require("fs");
const path = require("path");

const folderFor = (baseUrl) =>
  baseUrl.includes("products") ? "products" : "users";

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join("uploads", folderFor(req.baseUrl));

    try {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: function (req, file, cb) {
    const folder = folderFor(req.baseUrl);
    const fileType = file.mimetype.split("/")[1];
    cb(null, `${folder.slice(0, -1)}-${Date.now()}.${fileType}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
