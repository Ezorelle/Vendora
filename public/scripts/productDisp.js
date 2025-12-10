document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) throw "No ID in URL";

    const res = await fetch("/api/products");
    if (!res.ok) throw "API dead";
    const products = await res.json();

    const product = products.find(p => p._id === productId);
    if (!product) throw "Product not found";

    // MAIN PRODUCT INFO
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productStock").textContent = product.stock;
    document.getElementById("productPrice").textContent = Number(product.price).toLocaleString();

    // IMAGE HANDLING
    const images = Array.isArray(product.image) ? product.image : [product.image];
    
    // DEBUG LINE — remove later
    console.log("Images we're trying to use:", images);

    const mainImg = document.getElementById("mainImage");
    mainImg.src = images[0] || "https://via.placeholder.com/600"; // fallback if empty

    let currentIndex = 0;

    // THUMBNAILS
    const thumbContainer = document.getElementById("thumbnailContainer");
    thumbContainer.innerHTML = "";
    images.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = product.name;
      if (i === 0) img.classList.add("active-thumb");
      img.onclick = () => {
        currentIndex = i;
        mainImg.src = src;
        updateThumbs(i);
      };
      thumbContainer.appendChild(img);
    });

    // ARROW BUTTONS
    document.getElementById("prevBtn").onclick = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      mainImg.src = images[currentIndex];
      updateThumbs(currentIndex);
    };

    document.getElementById("nextBtn").onclick = () => {
      currentIndex = (currentIndex + 1) % images.length;
      mainImg.src = images[currentIndex];
      updateThumbs(currentIndex);
    };

    function updateThumbs(activeIndex) {
      document.querySelectorAll("#thumbnailContainer img").forEach((t, idx) => {
        t.classList.toggle("active-thumb", idx === activeIndex);
      });
    }

    // AUTO SLIDESHOW (with proper pause on hover)
    let slideshowInterval;
    if (images.length > 1) {
      slideshowInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        mainImg.src = images[currentIndex];
        updateThumbs(currentIndex);
      }, 4000);

      const gallery = document.querySelector(".image-gallery");
      gallery.addEventListener("mouseenter", () => clearInterval(slideshowInterval));
      gallery.addEventListener("mouseleave", () => {
        slideshowInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          mainImg.src = images[currentIndex];
          updateThumbs(currentIndex);
        }, 4000);
      });
    }

    // RELATED PRODUCTS (Jumia grid)
    const relatedContainer = document.getElementById("relatedProducts");
    relatedContainer.innerHTML = "";
    const related = products
      .filter(p => p.category === product.category && p._id !== product._id)
      .slice(0, 8);

    related.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${Array.isArray(p.image) ? p.image[0] : p.image}" alt="${p.name}">
        <div class="info">
          <h3>${p.name}</h3>
          <div class="price">KSh ${Number(p.price).toLocaleString()}</div>
        </div>
      `;
      card.onclick = () => location.href = `product.html?id=${p._id}`;
      relatedContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Greg says: fix your life", err);
  }
});