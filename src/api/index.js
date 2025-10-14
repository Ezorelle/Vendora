const fetch = require("node-fetch");

// Base helper for API calls
function request(endpoint, options = {}) {
  const baseURL = "http://localhost:3000/api";
  const url = `${baseURL}${endpoint}`;

  return fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return res.json();
    })
    .catch((err) => {
      console.error("API error:", err.message);
      throw err;
    });
}

module.exports = request;
