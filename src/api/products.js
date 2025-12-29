const express = require("express");
const router = express.Router();
const Product = require("../../models/Productmodel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ----------------------------
// 🖼️ Multer Config
// ----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

// ----------------------------
// 🛒 ADD PRODUCT
// ----------------------------
router.post("/add", upload.array("images", 5), async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;

    if (!name || !price || !stock || !category || !description)
  return res.status(400).json({ message: "All fields are required" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "At least one image is required" });

    const imagePaths = req.files.map((file) => "/uploads/" + file.filename);

    const newProduct = new Product({
      sellerId: req.session.user?._id,
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      description: description || "",
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      productId: newProduct._id,
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Server error while adding product" });
  }
});


// 📦 GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Error loading products" });
  }
});
 ,

// ❌ DELETE PRODUCT 

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete images from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgPath) => {
        const filePath = path.join(__dirname, "../../", imgPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await product.deleteOne();
    res.json({ message: "Product and images deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});
