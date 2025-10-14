const request = require("./index.js");
const express = require("express");
const router = express.Router();

let orders = [];

// Client helper functions
const listOrders = (query = "") => request(`/orders${query ? "?" + query : ""}`);
const getOrder = (id) => request(`/orders/${id}`);
const createOrder = (data) => request(`/orders`, { method: "POST", body: JSON.stringify(data) });
const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

// client helper to request export (returns Blob)
async function exportOrders(query = "") {
  const res = await fetch(`/api/orders/export${query ? "?" + query : ""}`, { credentials: "include" });
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

// Express routes
router.get("/", (req, res) => res.json(orders));

router.post("/", (req, res) => {
  const o = { id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString(), ...req.body };
  orders.push(o);
  res.status(201).json(o);
});

router.patch("/:id/status", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "not found" });
  order.status = req.body.status || order.status;
  res.json(order);
});

// Export both router and helper functions
module.exports = {
  router,
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  exportOrders,
};
