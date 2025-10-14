const express = require("express");
const router = express.Router();

let orders = [];

// GET /api/orders
router.get("/", (req, res) => res.json(orders));

// POST /api/orders
router.post("/", (req, res) => {
  const o = { id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString(), ...req.body };
  orders.push(o);
  res.status(201).json(o);
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "not found" });
  order.status = req.body.status || order.status;
  res.json(order);
});

module.exports = router;
