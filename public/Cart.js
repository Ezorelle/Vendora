// Cart.js
document.addEventListener("DOMContentLoaded", () => {
  const cartItemsPage = document.getElementById("cartItemsPage");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtnPage = document.getElementById("checkoutBtnPage");
  const cartCountNav = document.getElementById("cartCountNav");

  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountNav) cartCountNav.textContent = totalItems;
  }

  function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    updateCartCount();
  }

  function renderCartPage() {
    const cart = getCart();
    cartItemsPage.innerHTML = "";

    if (cart.length === 0) {
      cartItemsPage.innerHTML = "<p>Your cart is empty</p>";
      cartTotal.textContent = "Kshs 0.00";
      localStorage.setItem("cartTotal", "0"); // Save zero total
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

    cartTotal.textContent = `Kshs ${total.toFixed(2)}`;
    localStorage.setItem("cartTotal", total.toFixed(2)); // Save dynamic total

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        removeItem(idx);
      });
    });

    updateCartCount();
  }

  if (checkoutBtnPage) {
    checkoutBtnPage.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      // Ensure total is saved before navigating
      const total = cart.reduce((sum, item) => sum + item.total, 0);
      localStorage.setItem("cartTotal", total.toFixed(2));
      window.location.href = "Checkout.html";
    });
  }

  renderCartPage();
  updateCartCount();
});