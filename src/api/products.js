const express = require("express");
const router = express.Router();

// Temporary in-memory product store
let products = [];

// GET /api/products
router.get("/", (req, res) => {
  res.json(products);
});

// POST /api/products
router.post("/", (req, res) => {
  const product = { id: Date.now().toString(), ...req.body };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  products = products.map((p) =>
    p.id === req.params.id ? { ...p, ...req.body } : p
  );
  res.json({ ok: true });
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  products = products.filter((p) => p.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
