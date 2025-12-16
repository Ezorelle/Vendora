// ============================
// GLOBAL IMAGE STORE
// ============================
let selectedImages = [];

// ============================
// DOM ELEMENTS
// ============================
const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const productForm = document.getElementById("productForm");
const productContainer = document.getElementById("productContainer");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");

// ============================
// LOAD PRODUCTS
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/products");
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      productContainer.innerHTML = "<p>No products yet.</p>";
      return;
    }

    products.forEach(renderProductCard);
  } catch (err) {
    console.error("Error loading products:", err);
    productContainer.innerHTML = "<p>Failed to load products.</p>";
  }
});

// ============================
// MODAL CONTROLS
// ============================
addProductBtn.onclick = () => (productModal.style.display = "flex");
closeModal.onclick = closeModalHandler;
window.onclick = (e) => {
  if (e.target === productModal) closeModalHandler();
};

function closeModalHandler() {
  productModal.style.display = "none";
  productForm.reset();
  imagePreview.innerHTML = "";
  selectedImages = [];
}

// ============================
// IMAGE INPUT (APPEND, NOT REPLACE)
// ============================
imageInput.addEventListener("change", () => {
  const files = [...imageInput.files];

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      selectedImages.push(reader.result);
      renderImagePreview();
    };
    reader.readAsDataURL(file);
  });

  // allow re-selecting same image
  imageInput.value = "";
});

function renderImagePreview() {
  imagePreview.innerHTML = "";

  selectedImages.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    imagePreview.appendChild(img);
  });
}

// ============================
// SUBMIT PRODUCT (FIXED)
// ============================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById("productName").value.trim(),
    price: parseFloat(document.getElementById("productPrice").value),
    stock: parseInt(document.getElementById("productStock").value),
    category: document.getElementById("productCategory").value,
    images: selectedImages.length
      ? selectedImages
      : ["default-product.jpg"]
  };

  await saveProduct(product);
});

// ============================
// SAVE PRODUCT
// ============================
async function saveProduct(product) {
  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    const data = await res.json();
    product._id = data.productId || null;

    renderProductCard(product);
    closeModalHandler();
  } catch (err) {
    console.error("Error adding product:", err);
  }
}

// ============================
// RENDER PRODUCT CARD
// ============================
function renderProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  const img = document.createElement("img");
  img.src =
  product.images?.[0] ||
  product.image ||
  "default-product.jpg";

  img.alt = product.name;

  const h4 = document.createElement("h4");
  h4.textContent = product.name;

  const p1 = document.createElement("p");
  p1.textContent = `KSh ${product.price}`;

  const p2 = document.createElement("p");
  p2.textContent = product.stock > 0 ? "In Stock" : "Out of Stock";
  p2.classList.add("stock");

  const p3 = document.createElement("p");
  p3.textContent = `Category: ${capitalize(product.category)}`;
  p3.classList.add("category");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = async () => {
    if (!product._id) return alert("Product cannot be deleted");

    try {
      await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      productCard.remove();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  productCard.append(img, h4, p1, p2, p3, deleteBtn);
  productContainer.appendChild(productCard);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
