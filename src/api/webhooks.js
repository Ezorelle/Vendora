const crypto = require("crypto");
const express = require("express");
const router = express.Router();

/**
 * verifySignature(rawBody, signatureHeader, secret)
 * - rawBody: string or Buffer (raw request body)
 * - signatureHeader: e.g. "sha256=hexsignature"
 * - secret: your webhook secret
 * Returns boolean.
 */
function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split("=");
  if (parts.length !== 2) return false;

  const alg = parts[0];
  const sig = parts[1];
  const algo = alg === "sha256" ? "sha256" : "sha1";

  const digest = crypto.createHmac(algo, secret).update(rawBody).digest("hex");
  return digest === sig;
}

function parseJSONSafe(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// ----------------------
// Webhook Endpoint
// ----------------------
router.post("/", (req, res) => {
  const sig = req.get("x-signature") || req.get("x-hub-signature") || "";
  const secret = process.env.WEBHOOK_SECRET || "dev-secret";
  const raw = req.rawBody || JSON.stringify(req.body || {});

  const ok = verifySignature(raw, sig, secret);
  if (!ok) {
    console.warn("Webhook signature failed");
    return res.status(400).send("invalid signature");
  }

  console.log("✅ Verified webhook payload:", req.body);
  // TODO: Process payload → update orders/payments, etc.

  res.status(204).send();
});

module.exports = router;
