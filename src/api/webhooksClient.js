// src/api/webhooksClient.js

export async function sendTestWebhook(payload = {}) {
  const res = await fetch("/api/webhooks/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send test webhook");
  return res.json();
}

export async function getWebhookLogs() {
  const res = await fetch("/api/webhooks/logs");
  if (!res.ok) throw new Error("Failed to fetch webhook logs");
  return res.json();
}
