const express = require("express");
const router = express.Router();
const Order = require('../../models/Ordersmodel');

// GET /api/orders - get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/orders - create a new order
router.post("/", (req, res) => {
  const o = { id: Date.now().toString(), status: "confirmed", createdAt: new Date().toISOString(), ...req.body };
  Order.create(o);

  // Emit event to all connected sellers
  const io = req.app.get("io");
  io.emit("new-order", o);

  res.status(201).json(o);
});



// PATCH /api/orders/:id/status - update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "not found" });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
