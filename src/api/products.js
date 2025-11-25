const express = require("express");
const router = express.Router();
const Product = require("../../models/Productmodel");


// ----------------------------
// 🛒 ADD PRODUCT (Seller side)
// ----------------------------
router.post("/add", async (req, res) => {
  try {
    const { name, price, stock, category, image, description } = req.body;

    if (!name || !price || !stock || !category || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new Product({
      sellerId: req.session.user?._id, // optional
      name,
      price,
      stock,
      category,
      image,
      description,
    });

    await newProduct.save();
    console.log("✅ Product added:", name);
    res.status(200).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Server error while adding product" });
  }
});

// ----------------------------
// 📦 GET ALL PRODUCTS (For index.html)
// ----------------------------
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Error loading products" });
  }
});

// ----------------------------
// ❌ DELETE PRODUCT (Optional)
// ----------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
