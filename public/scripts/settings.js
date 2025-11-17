document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1️⃣ Fetch the logged-in user from the server
    const res = await fetch("/api/user");
    if (res.status === 401) {
      // Not logged in → redirect to login
      window.location.href = "/login.html";
      return;
    }

    const user = await res.json();
    const role = user.role;
    const username = user.username;

    // 2️⃣ Get elements
    const buyerSection = document.getElementById("buyerSettings");
    const sellerSection = document.getElementById("sellerSettings");
    const dashboardLink = document.getElementById("dashboardLink");
    const settingsDesc = document.getElementById("settingsDesc");
    const homeBtn = document.getElementById("home-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const headerUsername = document.querySelector(".settings-container h2");
    const saveButtons = document.querySelectorAll(".save-btn");

    // 3️⃣ Role-based UI
    if (role === "seller") {
      if (buyerSection) buyerSection.style.display = "none";
      if (sellerSection) sellerSection.style.display = "block";
      if (dashboardLink) dashboardLink.style.display = "inline-block";
      if (settingsDesc) settingsDesc.textContent =
        "Manage your seller account, store details, and security.";
      if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "/seller/Seller.html");
    } else {
      if (sellerSection) sellerSection.style.display = "none";
      if (buyerSection) buyerSection.style.display = "block";
      if (dashboardLink) dashboardLink.style.display = "none";
      if (settingsDesc) settingsDesc.textContent =
        "Manage your personal account and shopping preferences.";
      if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "/index.html");
    }

    // 4️⃣ Update header username
    if (headerUsername) headerUsername.textContent = `Settings | ${username}`;

    // 5️⃣ Logout button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login.html";
      });
    }

    // 6️⃣ Save button feedback
    saveButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        btn.textContent = "Saved ✅";
        btn.disabled = true;
        btn.style.backgroundColor = "#6b1bb3";
        setTimeout(() => {
          btn.textContent = "Save Changes";
          btn.disabled = false;
          btn.style.backgroundColor = "#4b0082";
        }, 1500);
      });
    });

  } catch (err) {
    console.error("Error fetching user:", err);
    window.location.href = "/login.html";
  }
});
