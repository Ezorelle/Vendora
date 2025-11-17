(async function () {
  try {
    const res = await fetch("/api/user");
    if (!res.ok) throw new Error("Not logged in");

    const user = await res.json();
    const path = window.location.pathname.toLowerCase();

    const isSellerPage = path.includes("seller");
    const isUserPage = !isSellerPage;

    // Redirect based on role mismatch
    if (user.role === "seller" && isUserPage) {
      window.location.href = "/seller_dashboard.html";
      return;
    }

    if (user.role === "user" && isSellerPage) {
      window.location.href = "/index.html";
      return;
    }

    console.log("🔒 Access granted to:", user.role);

  } catch (err) {
    const path = window.location.pathname.toLowerCase();
    const isSellerPage = path.includes("seller");

    window.location.href = isSellerPage ? "/seller_login.html" : "/login.html";
  }
})();
