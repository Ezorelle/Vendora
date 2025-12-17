// GLOBAL IMAGE STORE
let selectedImages = [];

// DOM ELEMENTS
const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const productForm = document.getElementById("productForm");
const productContainer = document.getElementById("productContainer");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");

// MODAL CONTROLS
addProductBtn.onclick = () => (productModal.style.display = "flex");
closeModal.onclick = closeModalHandler;
window.onclick = (e) => { if (e.target === productModal) closeModalHandler(); };

function closeModalHandler() {
  productModal.style.display = "none";
  productForm.reset();
  imagePreview.innerHTML = "";
  selectedImages = [];
}

// IMAGE INPUT (store File objects, not base64)
imageInput.addEventListener("change", () => {
  const files = [...imageInput.files];
  selectedImages.push(...files);
  renderImagePreview();
  imageInput.value = ""; // allow re-selecting same files
});

function renderImagePreview() {
  imagePreview.innerHTML = "";
  selectedImages.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    imagePreview.appendChild(img);
  });
}

// SUBMIT PRODUCT
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedImages.length === 0) {
    return alert("Please select at least one image");
  }

  const formData = new FormData();
  formData.append("name", document.getElementById("productName").value.trim());
  formData.append("price", document.getElementById("productPrice").value);
  formData.append("stock", document.getElementById("productStock").value);
  formData.append("category", document.getElementById("productCategory").value || "other");
  formData.append("description", document.getElementById("productDescription")?.value || "");

  selectedImages.forEach(file => formData.append("images", file));

  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      body: formData, // <- multipart/form-data
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    renderProductCard(data.product);
    closeModalHandler();
  } catch (err) {
    console.error("Error adding product:", err);
    alert("Failed to add product. Check console for details.");
  }
});

// RENDER PRODUCT CARD
function renderProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  const img = document.createElement("img");
  img.src = product.images?.[0] || "default-product.jpg";
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
