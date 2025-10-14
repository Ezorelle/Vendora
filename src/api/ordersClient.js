const request = require("./index.js");

function listOrders(query = "") {
  return request(`/orders${query ? "?" + query : ""}`);
}

function getOrder(id) {
  return request(`/orders/${id}`);
}

function createOrder(data) {
  return request(`/orders`, { method: "POST", body: JSON.stringify(data) });
}

function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

async function exportOrders(query = "") {
  const res = await fetch(`/api/orders/export${query ? "?" + query : ""}`, { credentials: "include" });
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  exportOrders,
};
