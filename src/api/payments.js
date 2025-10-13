const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

// Simple in-memory payments store (dev)
let payments = [];

/**
 * POST /mpesa
 * body: { phone, amount }
 * -> sends STK push (Safaricom Daraja sandbox)
 */
router.post("/mpesa", async (req, res) => {
  const { phone, amount } = req.body;
  const shortcode = process.env.DARAJA_SHORTCODE;
  const passkey = process.env.DARAJA_PASSKEY;
  const key = process.env.DARAJA_CONSUMER_KEY;
  const secret = process.env.DARAJA_CONSUMER_SECRET;

  if (!phone || !amount || !key || !secret || !shortcode || !passkey) {
    return res.status(400).json({ success: false, message: "Missing phone/amount or Daraja env vars" });
  }

  try {
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { auth: { username: key, password: secret } }
    );
    const token = tokenResponse.data.access_token;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/payments/mpesa/callback",
        AccountReference: "Vendora Purchase",
        TransactionDesc: "Payment for order",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json({ success: true, message: "STK push sent", data: stkResponse.data });
  } catch (error) {
    console.error("M-Pesa Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "M-Pesa request failed", detail: error.response?.data || error.message });
  }
});

/**
 * POST /paypal
 * body: { amount }
 * -> creates PayPal order (sandbox)
 */
router.post("/paypal", async (req, res) => {
  const { amount } = req.body;
  if (!amount || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
    return res.status(400).json({ success: false, message: "Missing amount or PayPal env vars" });
  }

  try {
    const tokenResponse = await axios({
      url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_SECRET },
      data: "grant_type=client_credentials",
    });

    const accessToken = tokenResponse.data.access_token;

    const orderResponse = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: String(amount) } }],
      },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    return res.json({ success: true, order: orderResponse.data });
  } catch (error) {
    console.error("PayPal Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "PayPal request failed", detail: error.response?.data || error.message });
  }
});

// Generic payments endpoints (local store)
// POST /         -> create payment record
router.post("/", (req, res) => {
  const { orderId, provider } = req.body;
  const payment = { id: Date.now().toString(), orderId, provider, status: "started", createdAt: new Date().toISOString() };
  payments.push(payment);
  res.status(201).json(payment);
});

// POST /:id/capture -> mark captured
router.post("/:id/capture", (req, res) => {
  const p = payments.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "payment not found" });
  p.status = "captured";
  res.json(p);
});

module.exports = router;
