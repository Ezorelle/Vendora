// ...existing code...
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const citySelect = document.getElementById("city");
  const deliverySelect = document.getElementById("deliveryOption");
  const deliveryFeeEl = document.getElementById("deliveryFee");
  const grandTotalEl = document.getElementById("grandTotal");
  const itemsTotalEl = document.getElementById("itemsTotal");
  const paypalSection = document.getElementById("paypal-section");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const checkoutForm = document.getElementById("checkoutForm");

  // Load cart and total from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let itemsTotal = parseFloat(localStorage.getItem("cartTotal")) || 0;

  // Redirect if cart is empty
  if (!cartItems.length) {
    alert("Your cart is empty! Redirecting to shop.");
    window.location.href = "shop.html";
    return;
  }

  // Display items total
  itemsTotalEl.textContent = itemsTotal.toFixed(2);

  // Delivery Options
  const defaultOptions = [
    { name: "Door Delivery (KES 350)", fee: 350 },
    { name: "Pickup Station (KES 100)", fee: 100 },
  ];

  const deliveryOptions = {
    nairobi: [
      { name: "Door Delivery (KES 350)", fee: 350 },
      { name: "Pickup Station (KES 100)", fee: 100 },
    ],
    mombasa: [
      { name: "Door Delivery (KES 500)", fee: 500 },
      { name: "Pickup Station (KES 150)", fee: 150 },
    ],
  };

  // Update Delivery Options by City
  citySelect.addEventListener("change", () => {
    deliverySelect.innerHTML = `<option value="">-- Select Delivery Option --</option>`;
    const city = citySelect.value;
    const options = deliveryOptions[city] || defaultOptions;

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.fee;
      option.textContent = opt.name;
      deliverySelect.appendChild(option);
    });

    updateTotal();
  });

  // Update Totals
  let deliveryFee = 0;

  function updateTotal() {
    deliveryFee = parseInt(deliverySelect.value) || 0;
    deliveryFeeEl.textContent = deliveryFee.toFixed(2);
    grandTotalEl.textContent = (itemsTotal + deliveryFee).toFixed(2);
  }

  // Trigger total update when delivery changes
  deliverySelect.addEventListener("change", updateTotal);

  // Initialize totals
  updateTotal();

  // Payment Option Logic
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "paypal") {
        paypalSection.style.display = "block";
        placeOrderBtn.style.display = "none";
      } else {
        paypalSection.style.display = "none";
        placeOrderBtn.style.display = "block";
      }
    });
  });

  // PayPal Integration
  if (typeof paypal !== "undefined") {
    paypal.Buttons({
      createOrder: function (data, actions) {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const city = citySelect.value;
        const delivery = deliverySelect.options[deliverySelect.selectedIndex]?.text || "N/A";

        // Convert KES → USD (example: 1 USD = 150 KES)
        const usdTotal = ((itemsTotal + deliveryFee) / 150).toFixed(2);

        return actions.order.create({
          purchase_units: [
            {
              description: `Order for ${name} (${city}, ${delivery})`,
              amount: {
                currency_code: "USD",
                value: usdTotal,
              },
            },
          ],
          payer: {
            name: { given_name: name },
            email_address: email,
          },
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert("✅ Payment completed by " + details.payer.name.given_name);

          const orderData = {
            transaction: details,
            customer: {
              name: document.getElementById("name").value,
              email: document.getElementById("email").value,
              phone: document.getElementById("phone").value,
              city: citySelect.value,
              deliveryOption: deliverySelect.value,
            },
            totals: {
              items: itemsTotal,
              delivery: deliveryFee,
              grand: itemsTotal + deliveryFee,
            },
          };

          console.log("Order data to send:", orderData);
          // TODO: Send orderData to backend
        });
      },
      onError: function (err) {
        console.error("PayPal error", err);
        alert("⚠️ Something went wrong with PayPal payment.");
      },
    }).render("#paypal-button-container");
  }

  // Handle Normal Order Submission
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const payment = document.querySelector('input[name="payment"]:checked');
    if (!payment) {
      alert("Please select a payment option");
      return;
    }

    if (payment.value !== "paypal") {
      alert(`✅ Order placed! Payment method: ${payment.value}`);
      // TODO: Send order to backend
    }
  });

  // Accordion Toggle for Payment Sections
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const details = btn.closest(".payment-option").querySelector(".payment-details");
      const isOpen = details.style.display === "block";

      document.querySelectorAll(".payment-details").forEach((d) => (d.style.display = "none"));
      document.querySelectorAll(".accordion-btn").forEach((b) => b.classList.remove("active"));

      if (!isOpen) {
        details.style.display = "block";
        btn.classList.add("active");
      }
    });
  });
});
// ...existing code...