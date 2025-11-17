// seller.js

const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const productForm = document.getElementById("productForm");
const productContainer = document.getElementById("productContainer");

// ----------------------------
// 🔸 Load products from backend
// ----------------------------
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

// ----------------------------
// 🔸 Modal open/close
// ----------------------------
addProductBtn.onclick = () => (productModal.style.display = "flex");
closeModal.onclick = () => (productModal.style.display = "none");
window.onclick = (e) => {
  if (e.target === productModal) productModal.style.display = "none";
};

// ----------------------------
// 🔸 Add new product via API
// ----------------------------
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value);
  const category = document.getElementById("productCategory").value;
  const imageInput = document.getElementById("productImage").files[0];

  // Convert image to Base64 if uploaded
  let image = "default-product.jpg";

  if (imageInput) {
    const reader = new FileReader();
    reader.onload = async () => {
      image = reader.result; // Base64 string
      await saveProduct({ name, price, stock, category, image });
    };
    reader.readAsDataURL(imageInput);
  } else {
    await saveProduct({ name, price, stock, category, image });
  }
});

async function saveProduct(product) {
  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    const data = await res.json();
    console.log(data);

    // API returns MongoDB _id, we use it in delete
    product._id = data.productId || null;

    renderProductCard(product);

    productForm.reset();
    productModal.style.display = "none";
  } catch (err) {
    console.error("Error adding product:", err);
  }
}

// ----------------------------
// 🔸 Render product card
// ----------------------------
function renderProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  const img = document.createElement("img");
  img.src = product.image || "default-product.jpg";
  img.alt = product.name;

  const h4 = document.createElement("h4");
  h4.textContent = product.name;

  const p1 = document.createElement("p");
  p1.textContent = `KSh ${product.price}`;

  const p2 = document.createElement("p");
  p2.textContent = product.stock > 0 ? "In Stock" : "Out of Stock";
  p2.classList.add("stock");

  const p3 = document.createElement("p");
  p3.textContent = `Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`;
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
