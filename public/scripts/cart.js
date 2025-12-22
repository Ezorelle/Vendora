document.addEventListener("DOMContentLoaded", () => {
  const cartItemsPage = document.getElementById("cartItemsPage");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtnPage = document.getElementById("checkoutBtnPage");
  const cartCountNav = document.getElementById("cartCountNav");

  // ----------------------
  // CART UTILITIES
  // ----------------------
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById("cartCountNav");
    if (badge) badge.textContent = totalItems;
  }

  // ----------------------
  // REMOVE ITEM
  // ----------------------
  function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    updateCartCount();
  }

  // ----------------------
  // RENDER CART PAGE
  // ----------------------
  function renderCartPage() {
    if (!cartItemsPage) return;

    const cart = getCart();
    cartItemsPage.innerHTML = "";

    if (cart.length === 0) {
      cartItemsPage.innerHTML = "<p>Your cart is empty</p>";
      if (cartTotal) cartTotal.textContent = "Kshs 0.00";
      updateCartCount();
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      total += item.total;

      const div = document.createElement("div");
      div.classList.add("cart-item-page");

      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-info">
          <h4>${item.title}</h4>
          <p>${item.qty} × Kshs ${item.price} = Kshs ${item.total.toFixed(2)}</p>
        </div>
        <button class="remove-item" data-index="${index}">Remove</button>
      `;

      cartItemsPage.appendChild(div);
    });

    if (cartTotal) cartTotal.textContent = `Kshs ${total.toFixed(2)}`;

    // Remove buttons
    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        removeItem(idx);
      });
    });

    updateCartCount();
  }

// CHECKOUT BUTTON 

const checkoutBtn = document.getElementById("checkout-btn"); 

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();

    if (cart.length === 0) {
      alert("🛒 Your cart is empty! Add some items before checking out.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.total, 0).toFixed(2);

    localStorage.setItem("checkoutCart", JSON.stringify(cart));
    localStorage.setItem("cartTotal", total);

    checkoutBtn.disabled = true;
    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = "Processing...";

    setTimeout(() => {
      
      window.location.href = "Checkout.html";
    }, 800);

    setTimeout(() => {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = originalText;
    }, 2000);
  });
}

  // ----------------------
  // INITIALIZE
  // ----------------------
  renderCartPage();
  updateCartCount();
});
