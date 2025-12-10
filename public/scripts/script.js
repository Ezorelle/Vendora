// ========================
// GLOBAL CART UTILITIES
// ========================
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Update navbar badge (used on all pages)
  document.querySelectorAll("#cartCountNav, #cartCount").forEach(el => {
    if (el) el.textContent = totalItems;
  });
}

// Call on every page load
document.addEventListener("DOMContentLoaded", updateCartCount);

// ========================
// CATEGORIES DROPDOWN (Navbar)
// ========================
const categoriesBtn = document.getElementById("categoriesBtn");
const categoriesDropdown = document.getElementById("categoriesDropdown");

if (categoriesBtn && categoriesDropdown) {
  const toggleDropdown = () => {
    const isOpen = !categoriesDropdown.classList.contains("hidden");
    categoriesDropdown.classList.toggle("hidden", isOpen);
    categoriesBtn.classList.toggle("active", !isOpen);
    categoriesBtn.setAttribute("aria-expanded", !isOpen);
  };

  categoriesBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
      categoriesDropdown.classList.add("hidden");
      categoriesBtn.classList.remove("active");
      categoriesBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      categoriesDropdown.classList.add("hidden");
      categoriesBtn.classList.remove("active");
      categoriesBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// ========================
// CHAT WIDGET (Simple & Fun)
// ========================
const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

if (chatBtn) chatBtn.addEventListener("click", () => chatWindow.style.display = "flex");
if (closeChat) closeChat.addEventListener("click", () => chatWindow.style.display = "none");

if (sendChat && chatInput) {
  const sendMessage = () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    // User message
    const userP = document.createElement("p");
    userP.innerHTML = `<strong>You:</strong> ${msg}`;
    chatBody.appendChild(userP);

    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // Bot replies (fun little responses)
    setTimeout(() => {
      const responses = [
        "I'm on it, boss!",
        "Gotcha covered!",
        "One sec, pulling that up...",
        "You're speaking my language!",
        "Jones 1.0 is here to help!",
        "Consider it done.",
        "Looking sharp today, by the way ;)"
      ];
      const botP = document.createElement("p");
      botP.innerHTML = `<strong>Jones 1.0:</strong> ${responses[Math.floor(Math.random() * responses.length)]}`;
      chatBody.appendChild(botP);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 600 + Math.random() * 400);
  };

  sendChat.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}
 
