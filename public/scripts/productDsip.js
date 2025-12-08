const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const items = JSON.parse(localStorage.getItem("items")) || [];
const product = items.find(p => p.id == id);

// Fill main content
document.getElementById("productName").textContent = product.name;
document.getElementById("productPrice").textContent = product.price;
document.getElementById("productStock").textContent = product.stock;

// Main image
document.getElementById("mainImage").src = product.images[0];

// Thumbnails
let thumbContainer = document.getElementById("thumbnailContainer");

product.images.forEach((img, index) => {
    let t = document.createElement("img");
    t.src = img;
    if (index === 0) t.classList.add("active-thumb");
    t.onclick = () => {
        document.getElementById("mainImage").src = img;
        document.querySelectorAll(".thumbnail-container img").forEach(i => i.classList.remove("active-thumb"));
        t.classList.add("active-thumb");
    };
    thumbContainer.appendChild(t);
});

// Related products (same category)
let relatedBox = document.getElementById("relatedProducts");

items
    .filter(x => x.category === product.category && x.id !== product.id)
    .slice(0, 4)
    .forEach(prod => {
        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${prod.images[0]}">
            <p>${prod.name}</p>
            <p class="price">KSh ${prod.price}</p>
        `;

        card.onclick = () => {
            window.location.href = `product.html?id=${prod.id}`;
        };

        relatedBox.appendChild(card);
    });
