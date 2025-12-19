const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // import your Order model

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
router.post("/", async (req, res) => {
  try {
    const order = new Order({
      status: "pending",
      ...req.body,
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
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
