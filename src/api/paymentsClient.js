// src/api/paymentsClient.js

export async function initiatePayment(orderId, amount) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, amount }),
  });
  if (!res.ok) throw new Error("Payment initiation failed");
  return res.json();
}

export async function getPaymentStatus(paymentId) {
  const res = await fetch(`/api/payments/${paymentId}`);
  if (!res.ok) throw new Error("Failed to fetch payment status");
  return res.json();
}
