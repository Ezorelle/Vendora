document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("errorBox");

  if (!form) {
    console.error("Login form not found on page.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed.");

      // Save session info locally (optional)
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("username", data.username);

      // Redirect user
      if (data.role === "seller") {
        window.location.href = "Seller.html";
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
