const request = require("./index.js");
const express = require("express");
const router = express.Router();

const generateInvoice = (orderId) =>
  request("/invoices", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

async function downloadInvoice(invoiceId) {
  const res = await fetch(`/api/invoices/${invoiceId}/download`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Download failed");
  return res.blob();
}

let invoices = [];

// POST /api/invoices
router.post("/", (req, res) => {
  const invoice = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  invoices.push(invoice);
  res.status(201).json(invoice);
});

// GET /api/invoices/:id/download
router.get("/:id/download", (req, res) => {
  const inv = invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).send("Invoice not found");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${inv.id}.json`
  );
  res.type("application/json").send(JSON.stringify(inv, null, 2));
});

module.exports = {
  router,
  generateInvoice,
  downloadInvoice,
};
