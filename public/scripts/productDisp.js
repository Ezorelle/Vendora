document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
      throw new Error("No product ID in URL");
    }

    // Fetch products 
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load products");

    const products = await res.json();

    // Find the specific product
    const product = products.find(p => p._id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // === UPDATE PRODUCT INFO ===
    document.getElementById("productName").textContent = product.name || "No name";
    document.getElementById("productStock").textContent = product.stock || 0;
    document.getElementById("productPrice").textContent = Number(product.price || 0).toLocaleString();

    // === IMAGE HANDLING ===
    let images = [];
    if (product.images) {
      if (Array.isArray(product.images)) {
        images = product.images.filter(img => img && img.trim());
      } else if (typeof product.images === "string" && product.images.trim()) {
        images = [product.images];
      }
    } else if (product.image) { // old products
      images = Array.isArray(product.image) ? product.image.filter(img => img && img.trim()) : [product.image];
    }

    if (images.length === 0) {
      images = ["/images/placeholder.jpg"];
    }

    const mainImg = document.getElementById("mainImage");
    let currentIndex = 0;

    const updateImage = () => {
      mainImg.src = images[currentIndex];
      mainImg.alt = product.name;

      // Show/hide arrows
      const display = images.length > 1 ? "block" : "none";
      document.getElementById("prevBtn").style.display = display;
      document.getElementById("nextBtn").style.display = display;
    };

    updateImage();

    // Arrow clicks
    document.getElementById("prevBtn").onclick = () => {
      if (images.length > 1) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
      }
    };

    document.getElementById("nextBtn").onclick = () => {
      if (images.length > 1) {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
      }
    };

    // Auto slideshow
    if (images.length > 1) {
      let interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
      }, 4000);

      const gallery = document.querySelector(".image-gallery");
      gallery.addEventListener("mouseenter", () => clearInterval(interval));
      gallery.addEventListener("mouseleave", () => {
        interval = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          updateImage();
        }, 4000);
      });
    }

    // Hide thumbnails
    const thumbContainer = document.getElementById("thumbnailContainer");
    if (thumbContainer) thumbContainer.style.display = "none";

    // === ADD TO CART BUTTON ===
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const item = {
        id: product._id,
        name: product.name,
        price: product.price,
        qty: 1,
        img: images[0],
        total: product.price
      };

      const existing = cart.find(i => i.id === item.id);
      if (existing) {
        existing.qty += 1;
        existing.total = existing.qty * existing.price;
      } else {
        cart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount?.(); // if you have this function globally
      alert(`${product.name} added to cart! 🛒`);
    });

    // === RELATED PRODUCTS ===
    const relatedContainer = document.getElementById("relatedProducts");
    relatedContainer.innerHTML = "";

    const related = products
      .filter(p => p.category === product.category && p._id !== product._id)
      .slice(0, 8);

    related.forEach(p => {
      let imgSrc = "/images/placeholder.jpg";
      if (p.images && Array.isArray(p.images) && p.images[0]) imgSrc = p.images[0];
      else if (p.images && typeof p.images === "string") imgSrc = p.images;
      else if (p.image) imgSrc = Array.isArray(p.image) ? p.image[0] : p.image;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${imgSrc}" alt="${p.name}">
        <div class="info">
          <h3>${p.name}</h3>
          <div class="price">KSh ${Number(p.price).toLocaleString()}</div>
        </div>
      `;
      card.onclick = () => location.href = `product.html?id=${p._id}`;
      relatedContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Load error:", err);
    document.querySelector(".product-container")?.insertAdjacentHTML(
      "afterbegin",
      '<h1 style="color: white; text-align: center; grid-column: 1/-1; padding: 100px;">Product not found 😩</h1>'
    );
  }
});