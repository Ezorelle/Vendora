const request = require("./index.js");

// Create a new invoice for a specific order
const generateInvoice = (orderId) => {
  return request("/invoices", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
};

// Download invoice file
async function downloadInvoice(invoiceId) {
  const res = await fetch(`/api/invoices/${invoiceId}/download`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Download failed");
  return res.blob();
}

module.exports = {
  generateInvoice,
  downloadInvoice,
};
