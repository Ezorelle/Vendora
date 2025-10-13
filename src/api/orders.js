import request from "./index.js";

export const listOrders = (query = "") => request(`/orders${query ? "?" + query : ""}`);
export const getOrder = (id) => request(`/orders/${id}`);
export const createOrder = (data) => request(`/orders`, { method: "POST", body: JSON.stringify(data) });
export const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

// client helper to request export (returns Blob)
export async function exportOrders(query = "") {
  const res = await fetch(`/api/orders/export${query ? "?" + query : ""}`, { credentials: "include" });
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}
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