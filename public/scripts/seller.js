const products = {
  1: { title: "Purple Hoodie", price: "$45.00", stock: "12 in stock", desc: "A cozy hoodie in Vendora's signature purple.", img: "images/purple-hoodie.jpg" },
  2: { title: "Lavender Sneakers", price: "$60.00", stock: "8 in stock", desc: "Stylish sneakers with lavender detailing.", img: "images/lavender-sneakers.jpg" },
  3: { title: "Classic White Tee", price: "$20.00", stock: "25 in stock", desc: "Soft cotton tee perfect for any outfit.", img: "images/white-tee.jpg" }
};

document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("productGrid");
  const overlay = document.getElementById("overlay");
  const panel = document.getElementById("item-panel");
  const closeBtn = document.querySelector(".close-btn");
  const panelImg = document.getElementById("panelImg");
  const panelTitle = document.getElementById("panelTitle");
  const panelPrice = document.getElementById("panelPrice");
  const panelStock = document.getElementById("panelStock");
  const panelDesc = document.getElementById("panelDesc");

  // Render product cards
  for (let id in products) {
    const p = products[id];
    const card = document.createElement("div");
    card.className = "product-card";
    card.tabIndex = 0; // Make focusable for accessibility
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>${p.price}</p>
    `;
    card.addEventListener("click", () => openPanel(id));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") openPanel(id); // Keyboard support
    });
    productContainer.appendChild(card);
  }

  // Open panel with product info
  function openPanel(id) {
    const product = products[id];
    if (!product) return; // Guard against invalid ID
    panelImg.src = product.img;
    panelImg.alt = product.title;
    panelTitle.textContent = product.title;
    panelPrice.textContent = product.price;
    panelStock.textContent = product.stock;
    panelDesc.textContent = product.desc;

    panel.classList.add("open");
    overlay.style.display = "block";
  }

  // Close panel
  function closePanel() {
    panel.classList.remove("open");
    overlay.style.display = "none";
  }

  // Toggle dashboard sections
  window.showSection = function (sectionId, element) {
    document.querySelectorAll(".dashboard-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.querySelectorAll(".sidebar a").forEach((link) => {
      link.classList.remove("active");
    });
    document.getElementById(`${sectionId}-section`).classList.add("active");
    element.classList.add("active");
  };

  // Event listeners for closing panel
  closeBtn.addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
});

function openAddProductForm() {
  // Example: Reuse the off-canvas panel for a product form
  const panel = document.getElementById("item-panel");
  const panelImg = document.getElementById("panelImg");
  const panelTitle = document.getElementById("panelTitle");
  const panelPrice = document.getElementById("panelPrice");
  const panelStock = document.getElementById("panelStock");
  const panelDesc = document.getElementById("panelDesc");
  const overlay = document.getElementById("overlay");

  panelImg.src = "";
  panelImg.alt = "";
  panelTitle.textContent = "Add New Product";
  panelPrice.innerHTML = `
    <label for="new-price">Price</label>
    <input type="text" id="new-price" placeholder="$0.00">
  `;
  panelStock.innerHTML = `
    <label for="new-stock">Stock</label>
    <input type="number" id="new-stock" placeholder="0">
  `;
  panelDesc.innerHTML = `
    <label for="new-desc">Description</label>
    <textarea id="new-desc" placeholder="Enter description"></textarea>
    <button onclick="saveNewProduct()">Save Product</button>
  `;
  panel.classList.add("open");
  overlay.style.display = "block";
}

function saveNewProduct() {
  // Placeholder for saving new product (e.g., to API or products object)
  console.log("Save product logic here");
  closePanel();
}
// Save user role in localStorage
if (user.role === "seller") {
  localStorage.setItem("userRole", "seller");
} else {
  localStorage.setItem("userRole", "buyer");
}
