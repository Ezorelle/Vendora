document.addEventListener('DOMContentLoaded', () => {
  // =====================
  // STAR RATING RENDER
  // =====================
  document.querySelectorAll('.stars').forEach(container => {
    const rating = parseInt(container.dataset.rating) || 0;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('i');
      star.classList.add(i <= rating ? 'fas' : 'far', 'fa-star');
      container.appendChild(star);
    }
  });

  // =====================
  // ITEM MODAL
  // =====================
  const qtyInput = document.getElementById("itemQty");
  const totalDisplay = document.getElementById("modalTotal");

  function openModal(img, title, price, desc) {
    document.getElementById("modalImg").src = img;
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalPrice").innerText = price;
    document.getElementById("modalDesc").innerText = desc || "No description available.";
    document.getElementById("itemModal").style.display = "flex";

    if (qtyInput) qtyInput.value = 1;
    updateTotal();
  }

  function closeModal() {
    const modal = document.getElementById("itemModal");
    if (modal) modal.style.display = "none";
  }

  window.onclick = e => {
    if (e.target.id === "itemModal") closeModal();
  };

  document.querySelectorAll(".item-card, .items-card").forEach(card => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img").src;
      const title = card.querySelector("h3").innerText;
      const price = card.querySelector("p").innerText;
      const desc = card.querySelector(".item-info p") 
        ? card.querySelector(".item-info p").innerText 
        : "Fresh stock just for you!";
      openModal(img, title, price, desc);
    });
  });

  // =====================
  // PRICE & QUANTITY
  // =====================
  function getPrice() {
    const priceText = document.getElementById("modalPrice")?.textContent || "0";
    return parseFloat(priceText.replace(/[^0-9.]/g, ""));
  }

  function updateTotal() {
    if (!qtyInput || !totalDisplay) return;
    const qty = parseInt(qtyInput.value) || 1;
    const total = qty * getPrice();
    totalDisplay.textContent = `Kshs ${total.toFixed(2)}`;
  }

  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      let qty = parseInt(qtyInput.value) || 1;
      if (btn.dataset.action === "inc") qty++;
      else if (btn.dataset.action === "dec" && qty > 1) qty--;
      qtyInput.value = qty;
      updateTotal();
    });
  });

  if (qtyInput) {
    qtyInput.addEventListener("input", updateTotal);
  }

  // =====================
  // CART SYSTEM (localStorage)
  // =====================
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  // Render floating / mini cart (in navbar dropdown)
  const cartItemsContainer = document.getElementById("cartItems");
  function renderCart() {
    if (!cartItemsContainer) return;

    const cart = getCart();
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
      return;
    }

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div>
          <h4>${item.title}</h4>
          <p>${item.qty} × Kshs ${item.price} = Kshs ${item.total.toFixed(2)}</p>
        </div>
        <span class="remove-item" data-index="${index}">&times;</span>
      `;
      cartItemsContainer.appendChild(div);
    });

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const cart = getCart();
        const idx = btn.dataset.index;
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
        updateCartCount();
      });
    });
  }

  // Handle Add To Cart
  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const cart = getCart();
      const product = {
        title: document.getElementById("modalTitle").textContent,
        price: getPrice(),
        qty: parseInt(qtyInput.value),
        img: document.getElementById("modalImg").src
      };
      product.total = product.qty * product.price;

      const existing = cart.find(item => item.title === product.title);
      if (existing) {
        existing.qty += product.qty;
        existing.total = existing.qty * existing.price;
      } else {
        cart.push(product);
      }

      saveCart(cart);
      renderCart();
      updateCartCount();
      closeModal();
    });
  }

  // =====================
  // CART PAGE (cart.html)
  // =====================
  const cartItemsPage = document.getElementById("cartItemsPage");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtnPage = document.getElementById("checkoutBtnPage");

  function renderCartPage() {
    if (!cartItemsPage || !cartTotal) return;

    const cart = getCart();
    cartItemsPage.innerHTML = "";
    if (cart.length === 0) {
      cartItemsPage.innerHTML = "<p>Your cart is empty</p>";
      cartTotal.textContent = "Kshs 0.00";
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

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const cart = getCart();
        const idx = btn.dataset.index;
        cart.splice(idx, 1);
        saveCart(cart);
        renderCartPage();
        updateCartCount();
      });
    });
  }

  if (checkoutBtnPage) {
    checkoutBtnPage.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      alert("Proceeding to checkout...");
    });
  }

  // =====================
  // INIT (Run on every page)
  // =====================
  updateCartCount();
  renderCart();
  renderCartPage();

  // =====================
  // CHAT ASSISTANT
  // =====================
  const chatBtn = document.getElementById('chatBtn');
  const chatWindow = document.getElementById('chatWindow');
  const closeChat = document.getElementById('closeChat');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');

  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      chatWindow.style.display = 'flex';
    });
  }

  if (closeChat) {
    closeChat.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });
  }

  if (sendChat) {
    sendChat.addEventListener('click', () => {
      const msg = chatInput.value.trim();
      if (msg) {
        const userMsg = document.createElement('p');
        userMsg.textContent = "You: " + msg;
        chatBody.appendChild(userMsg);
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
          const botMsg = document.createElement('p');
          botMsg.textContent = "Assistant: I got you! 🚀";
          chatBody.appendChild(botMsg);
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 800);
      }
    });
  }
});
// Slideshow Logic
let slideIndex = 1;
showSlides(slideIndex);

function changeSlide(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

// Auto-slide every 5 seconds
setInterval(() => {
  changeSlide(1);
}, 5000);

// Modal Logic (Placeholder - Expand as needed)
function closeModal() {
  document.getElementById("itemModal").style.display = "none";
}

// Save user role in localStorage
if (user.role === "seller") {
  localStorage.setItem("userRole", "seller");
} else {
  localStorage.setItem("userRole", "buyer");
}
