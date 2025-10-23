// scripts/authGuard.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");
  const sessionStart = localStorage.getItem("sessionStart");

  if (!token || !role || !sessionStart) {
    redirectToLogin();
    return;
  }

  // Check if session is older than 3 hours (3 * 60 * 60 * 1000 ms)
  const threeHours = 3 * 60 * 60 * 1000;
  const now = Date.now();

  if (now - parseInt(sessionStart) > threeHours) {
    alert("Session expired. Please log in again.");
    logoutUser();
    return;
  }

  // Protect role-based pages
  const path = window.location.pathname;

  if (path.includes("Seller.html") && role !== "seller") {
    alert("Access denied. Seller account required.");
    window.location.href = "index.html";
  }

  if (path.includes("Buyer.html") && role !== "buyer") {
    alert("Access denied. Buyer account required.");
    window.location.href = "index.html";
  }

  // Helper functions
  function logoutUser() {
    localStorage.clear();
    redirectToLogin();
  }

  function redirectToLogin() {
    window.location.href = "Login.html";
  }
});
