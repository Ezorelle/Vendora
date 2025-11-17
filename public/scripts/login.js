document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("errorBox");

  if (!form) {
    console.error("Login form not found on page.");
    return;
  }

  // Detect which page this script is running on
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  const isSellerLogin = currentPage === "seller_login.html";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("Please enter both username and password.");
      return;
    }

    try {
      // Hit the same unified login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed.");

      // ✅ Save user session data
      localStorage.setItem("authToken", data.token || "sampleToken");
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("sessionStart", Date.now().toString());

      // ✅ Also save to sessionStorage (used by authGuard)
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("username", data.username);

      // ✅ Redirect based on role or current page
      if (data.role === "seller" || isSellerLogin) {
        window.location.href = "seller.html";
      } else {
        window.location.href = "index.html";
      }

    } catch (err) {
      console.error("Login error:", err);
      showError(err.message);
    }
  });

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
    } else {
      alert(message);
    }
  }
});
