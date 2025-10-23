document.addEventListener("DOMContentLoaded", () => {
  // Retrieve user role (buyer or seller)
  const role = localStorage.getItem("userRole");

  const buyerSection = document.getElementById("buyerSettings");
  const sellerSection = document.getElementById("sellerSettings");
  const dashboardLink = document.getElementById("dashboardLink");
  const settingsDesc = document.getElementById("settingsDesc");
  const homeLink = document.querySelector('.nav-links a[href="index.html"]');

  // 🧩 Role-based UI logic
  if (role === "seller") {
    // Seller view
    buyerSection.style.display = "none";
    sellerSection.style.display = "block";
    dashboardLink.style.display = "inline-block";
    settingsDesc.textContent =
      "Manage your seller account, store details, and security.";

   
    if (homeLink) {
      homeLink.setAttribute("href", "Seller.html");
    }

  } else {
    // Buyer view (default)
    sellerSection.style.display = "none";
    buyerSection.style.display = "block";
    dashboardLink.style.display = "none";
    settingsDesc.textContent =
      "Manage your personal account and shopping preferences.";

    // 🏠 Keep Home link for buyers
    if (homeLink) {
      homeLink.setAttribute("href", "index.html");
    }
  }

  const storedName = localStorage.getItem("userName");
  if (storedName) {
    const header = document.querySelector(".settings-container h2");
    if (header) {
      header.textContent = `Settings | ${storedName}`;
    }
  }

 
  const saveButtons = document.querySelectorAll(".save-btn");
  saveButtons.forEach((btn) => {
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
});
