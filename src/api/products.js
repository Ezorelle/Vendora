import request from "./index.js";

export const listProducts = (query = "") => request(`/products${query ? "?" + query : ""}`);
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (data) => request(`/products`, { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });
const express = require("express");
const router = express.Router();

let products = [];

// GET /api/products
router.get("/", (req, res) => res.json(products));

// POST /api/products
router.post("/", (req, res) => {
  const p = { id: Date.now().toString(), ...req.body };
  products.push(p);
  res.status(201).json(p);
});

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  products = products.map((p) => (p.id === req.params.id ? { ...p, ...req.body } : p));
  res.json({ ok: true });
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  products = products.filter((p) => p.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;