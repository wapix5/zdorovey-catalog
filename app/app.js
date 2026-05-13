const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const products = window.PRODUCTS || [];

const state = {
  category: "Все",
  search: "",
  selected: null
};

const els = {
  grid: document.getElementById("productGrid"),
  chips: document.getElementById("categoryChips"),
  search: document.getElementById("searchInput"),
  totalBadge: document.getElementById("totalBadge"),
  modal: document.getElementById("modalBackdrop"),
  modalImg: document.getElementById("modalImg"),
  modalCategory: document.getElementById("modalCategory"),
  modalTitle: document.getElementById("modalTitle"),
  modalPrice: document.getElementById("modalPrice"),
  modalQty: document.getElementById("modalQty"),
  closeModal: document.getElementById("closeModal")
};

function money(value) {
  if (typeof value === "number" && value > 0)
    return value.toLocaleString("ru-RU") + " ₽";
  if (value && value !== "0") return String(value) + " ₽";
  return "Цена уточняется";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}

function qtyNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function qtyText(value) {
  const n = qtyNumber(value);
  if (n === null || value === "") return "Остаток уточнить";
  return "В наличии: " + n;
}

function getCategories() {
  return ["Все", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];
}

function renderChips() {
  els.chips.innerHTML = getCategories().map(category => `
    <button class="chip ${category === state.category ? "active" : ""}" data-cat="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join("");
}

function getFilteredProducts() {
  const q = state.search.trim().toLowerCase();
  return products.filter(p => {
    const byCat = state.category === "Все" || p.category === state.category;
    const bySearch = !q || (p.name + " " + p.category).toLowerCase().includes(q);
    return byCat && bySearch;
  });
}

function renderProducts() {
  const list = getFilteredProducts();
  els.totalBadge.textContent = `${list.length} товаров`;

  els.grid.innerHTML = list.map(p => {
    const index = products.indexOf(p);
    const qty = qtyNumber(p.qty);
    const empty = qty !== null && qty <= 0;

    return `
      <article class="card" onclick="openProduct(${index})">
        <div class="photoWrap">
          ${
            p.image
              ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">`
              : `<div class="noPhoto">Фото нет</div>`
          }
        </div>
        <div class="cardBody">
          <div class="category">${escapeHtml(p.category)}</div>
          <div class="title">${escapeHtml(p.name)}</div>
          <div class="price">${money(p.price)}</div>
          <div class="qty">${escapeHtml(qtyText(p.qty))}</div>
          <div class="status ${empty ? "empty" : ""}">
            ${empty ? "Нет в наличии" : "Есть в наличии"}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function openProduct(index) {
  const p = products[index];
  state.selected = index;

  els.modalImg.style.display = p.image ? "block" : "none";
  if (p.image) els.modalImg.src = p.image;

  els.modalCategory.textContent = p.category;
  els.modalTitle.textContent = p.name;
  els.modalPrice.textContent = money(p.price);
  els.modalQty.textContent = qtyText(p.qty);
  els.modal.style.display = "flex";
}

function closeProduct() {
  els.modal.style.display = "none";
}

els.closeModal.addEventListener("click", closeProduct);

els.modal.addEventListener("click", e => {
  if (e.target === els.modal) closeProduct();
});

els.chips.addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  state.category = btn.dataset.cat;
  renderChips();
  renderProducts();
});

els.search.addEventListener("input", e => {
  state.search = e.target.value;
  renderProducts();
});

setTimeout(() => {
  document.getElementById("splash")?.remove();
}, 3200);

renderChips();
renderProducts();
const contactFab = document.getElementById("contactFab");
const contactModal = document.getElementById("contactModal");
const closeContact = document.getElementById("closeContact");

contactFab?.addEventListener("click", () => {
  contactModal.style.display = "flex";
});

closeContact?.addEventListener("click", () => {
  contactModal.style.display = "none";
});

contactModal?.addEventListener("click", e => {
  if (e.target === contactModal) {
    contactModal.style.display = "none";
  }
});