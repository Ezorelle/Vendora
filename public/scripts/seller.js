// GLOBAL STATE
let selectedImages = [];

// DOM ELEMENTS

const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");
const productForm = document.getElementById("productForm");
const productContainer = document.getElementById("productContainer");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");

// ============================
// MODAL CONTROLS
// ============================
addProductBtn.onclick = () => {
  productModal.style.display = "flex";
};

closeModalBtn.onclick = closeModalHandler;

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
// IMAGE PREVIEW HANDLING
// ============================
imageInput.addEventListener("change", () => {
  const newFiles = [...imageInput.files];
  selectedImages.push(...newFiles);
  renderImagePreview();
  imageInput.value = ""; // Allows re-selecting the same files
});

function renderImagePreview() {
  imagePreview.innerHTML = "";
  selectedImages.forEach((file) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Preview";
    imagePreview.appendChild(img);
  });
}

// ============================
// FETCH & RENDER PRODUCTS
// ============================
async function loadProducts() {
  try {
    const response = await fetch("/api/products", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();

    productContainer.innerHTML = ""; // Clear existing (including demo card)

    if (products.length === 0) {
      productContainer.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>No products yet. Add your first one!</p>";
      return;
    }

    products.forEach(renderProductCard);
  } catch (err) {
    console.error("Error loading products:", err);
    productContainer.innerHTML = "<p>Error loading products. Check console.</p>";
  }
}

// Render single product card
function renderProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.src = product.images?.[0] || "/images/placeholder.jpg"; // Add a placeholder image later
  img.alt = product.name;

  const name = document.createElement("h4");
  name.textContent = product.name;

  const price = document.createElement("p");
  price.textContent = `KSh ${product.price}`;

  const stock = document.createElement("p");
  stock.className = "stock";
  stock.textContent = product.stock > 0 ? "In Stock" : "Out of Stock";

  const category = document.createElement("p");
  category.textContent = `Category: ${capitalize(product.category)}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        card.remove();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting product");
    }
  };

  card.append(img, name, price, stock, category, deleteBtn);
  productContainer.appendChild(card);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================
// ADD PRODUCT SUBMISSION
// ============================
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedImages.length === 0) {
    alert("Please select at least one image");
    return;
  }

  const formData = new FormData();
  formData.append("name", document.getElementById("productName").value.trim());
  formData.append("price", document.getElementById("productPrice").value);
  formData.append("stock", document.getElementById("productStock").value);
  formData.append("category", document.getElementById("productCategory").value);

  selectedImages.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await fetch("/api/products/add", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      alert("Product added successfully!");
      closeModalHandler();
      selectedImages = []; // Clear global
      await loadProducts(); // Refresh list dynamically (no reload!)
    } else {
      alert("Error: " + (result.message || "Failed to add product"));
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("Network error. Check console for details.");
  }
});

// ============================
// INITIAL LOAD
// ============================
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});