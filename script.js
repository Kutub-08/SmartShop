// === SMARTSHOP SIMPLE JS ===
// Written in beginner-friendly style

// --- Global Variables ---
let products = [];
let cart = [];
let bannerIndex = 0;
let reviewIndex = 0;
let couponUsed = false;

// --- DOM Shortcuts ---
const bannerBox = document.getElementById("banner");
const prevBanner = document.getElementById("prevBanner");
const nextBanner = document.getElementById("nextBanner");
const productBox = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartList = document.getElementById("cartItems");
const emptyMsg = document.getElementById("emptyCart");
const cartCount = document.getElementById("cartCount");
const subtotal = document.getElementById("subtotal");
const discount = document.getElementById("discount");
const total = document.getElementById("total");
const couponInput = document.getElementById("coupon");
const applyBtn = document.getElementById("applyCoupon");
const checkoutBtn = document.getElementById("checkout");
const reviewsBox = document.getElementById("reviewsContainer");
const prevReview = document.getElementById("prevReview");
const nextReview = document.getElementById("nextReview");
const contactForm = document.getElementById("contactForm");
const msgBox = document.getElementById("formMessage");

// --- Start App ---
document.addEventListener("DOMContentLoaded", () => {
  showBanners();
  loadProducts();
  showReviews();
  setupEvents();
});

// --- All Events ---
function setupEvents() {
  prevBanner.onclick = slidePrev;
  nextBanner.onclick = slideNext;
  prevReview.onclick = reviewPrev;
  nextReview.onclick = reviewNext;
  cartBtn.onclick = () => cartModal.classList.remove("hidden");
  closeCart.onclick = () => cartModal.classList.add("hidden");
  applyBtn.onclick = useCoupon;
  checkoutBtn.onclick = checkout;
  contactForm.onsubmit = sendMessage;

  setInterval(slideNext, 5000);
  setInterval(reviewNext, 6000);
}

// --- Banner Section ---
function showBanners() {
  const banners = [
    { img: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=800", title: "Summer Sale", text: "Up to 50% Off!" },
    { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800", title: "New Arrivals", text: "Check our latest collection" },
    { img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800", title: "Free Shipping", text: "On orders over BDT100" }
  ];

  bannerBox.innerHTML = banners.map(b =>
    `<div class="min-w-full h-64 flex items-center justify-center bg-cover bg-center"
      style="background-image:url('${b.img}')">
      <div class="bg-black/40 p-6 rounded text-center text-white">
        <h2 class="text-2xl font-bold">${b.title}</h2>
        <p>${b.text}</p>
      </div>
    </div>`).join("");
}

function slideNext() {
  const total = bannerBox.children.length;
  bannerIndex = (bannerIndex + 1) % total;
  bannerBox.style.transform = `translateX(-${bannerIndex * 100}%)`;
}

function slidePrev() {
  const total = bannerBox.children.length;
  bannerIndex = (bannerIndex - 1 + total) % total;
  bannerBox.style.transform = `translateX(-${bannerIndex * 100}%)`;
}

// --- Product Section ---
async function loadProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    products = await res.json();
    showProducts(products);
  } catch {
    productBox.innerHTML = "<p class='text-red-500'>Error loading products.</p>";
  }
}

function showProducts(list) {
  productBox.innerHTML = list.map(p => `
    <div class="border rounded p-4 shadow bg-white">
      <img src="${p.image}" class="h-40 mx-auto object-contain mb-2">
      <h3 class="font-semibold mb-1">${p.title}</h3>
      <p class="text-gray-600 mb-2">BDT${p.price}</p>
      <button class="bg-blue-500 text-white px-4 py-1 rounded addBtn" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join("");

  document.querySelectorAll(".addBtn").forEach(btn => {
    btn.onclick = () => addCart(parseInt(btn.dataset.id));
  });
}

// --- Cart Section ---
function addCart(id) {
  const item = products.find(p => p.id === id);
  const found = cart.find(c => c.id === id);

  if (found) found.qty++;
  else cart.push({ ...item, qty: 1 });

  updateCart();
}

function updateCart() {
  cartCount.textContent = cart.reduce((a, c) => a + c.qty, 0);

  if (cart.length === 0) {
    emptyMsg.classList.remove("hidden");
    cartList.innerHTML = "";
    subtotal.textContent = "BDT0";
    discount.textContent = "BDT0";
    total.textContent = "BDT0";
    return;
  }

  emptyMsg.classList.add("hidden");
  cartList.innerHTML = cart.map(i => `
    <div class="flex items-center justify-between p-2 border-b">
      <img src="${i.image}" class="w-12 h-12 object-contain">
      <div class="flex-1 ml-2">
        <p class="font-semibold">${i.title}</p>
        <p>BDT${i.price} x ${i.qty}</p>
      </div>
      <div class="flex gap-2">
        <button class="minus bg-gray-200 px-2" data-id="${i.id}">-</button>
        <button class="plus bg-gray-200 px-2" data-id="${i.id}">+</button>
        <button class="remove text-red-500" data-id="${i.id}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".minus").forEach(btn => {
    btn.onclick = () => changeQty(parseInt(btn.dataset.id), -1);
  });

  document.querySelectorAll(".plus").forEach(btn => {
    btn.onclick = () => changeQty(parseInt(btn.dataset.id), 1);
  });

  document.querySelectorAll(".remove").forEach(btn => {
    btn.onclick = () => removeItem(parseInt(btn.dataset.id));
  });

  calcTotal();
}

function changeQty(id, change) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) removeItem(id);
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
}

function calcTotal() {
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const ship = 30, del = 50;
  const disc = couponUsed ? sub * 0.1 : 0;
  const tot = sub + ship + del - disc;

  subtotal.textContent = `$${sub.toFixed(2)}`;
  discount.textContent = `-$${disc.toFixed(2)}`;
  total.textContent = `$${tot.toFixed(2)}`;
}

function useCoupon() {
  const code = couponInput.value.trim();
  if (code === "SMART10") {
    couponUsed = true;
    calcTotal();
    showMsg("Coupon applied! 10% off.");
  } else {
    showMsg("Invalid coupon code.", "error");
  }
}

function checkout() {
  if (cart.length === 0) {
    showMsg("Your cart is empty.", "error");
    return;
  }
  cart = [];
  couponUsed = false;
  updateCart();
  cartModal.classList.add("hidden");
  showMsg("Order placed successfully!");
}

// --- Reviews Section ---
function showReviews() {
  const reviews = [
    { name: "John D.", text: "Great products and fast delivery!", rate: 5 },
    { name: "Sarah M.", text: "Quality items and good service.", rate: 4 },
    { name: "Mike R.", text: "Will shop again!", rate: 5 }
  ];

  reviewsBox.innerHTML = reviews.map(r => `
    <div class="min-w-full p-6 text-center">
      <div class="bg-white p-6 rounded shadow">
        <p class="text-yellow-500 text-xl mb-2">${"★".repeat(r.rate)}</p>
        <p class="italic mb-2 text-gray-700">"${r.text}"</p>
        <p class="font-semibold">${r.name}</p>
      </div>
    </div>
  `).join("");
}

function reviewNext() {
  const total = reviewsBox.children.length;
  reviewIndex = (reviewIndex + 1) % total;
  reviewsBox.style.transform = `translateX(-${reviewIndex * 100}%)`;
}

function reviewPrev() {
  const total = reviewsBox.children.length;
  reviewIndex = (reviewIndex - 1 + total) % total;
  reviewsBox.style.transform = `translateX(-${reviewIndex * 100}%)`;
}

// --- Contact Form ---
function sendMessage(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const msg = document.getElementById("message").value;

  if (!name || !email || !msg) {
    showMsg("Please fill all fields.", "error");
    return;
  }

  contactForm.reset();
  showMsg("Thanks for your message!");
}

// --- Message Box ---
function showMsg(text, type = "success") {
  msgBox.textContent = text;
  msgBox.className = "mt-4 p-3 rounded text-center";
  if (type === "success")
    msgBox.classList.add("bg-green-100", "text-green-700");
  else
    msgBox.classList.add("bg-red-100", "text-red-700");
  msgBox.classList.remove("hidden");

  setTimeout(() => msgBox.classList.add("hidden"), 3000);
}
