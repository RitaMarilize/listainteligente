const STORAGE_KEY = "listaMercadoInteligente.v1";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const elements = {
  month: document.querySelector("#shoppingMonth"),
  budget: document.querySelector("#budgetInput"),
  totalSpent: document.querySelector("#totalSpent"),
  remainingBudget: document.querySelector("#remainingBudget"),
  itemCount: document.querySelector("#itemCount"),
  summaryTitle: document.querySelector("#summaryTitle"),
  historyTitle: document.querySelector("#historyTitle"),
  budgetStatus: document.querySelector("#budgetStatus"),
  budgetProgress: document.querySelector("#budgetProgress"),
  productForm: document.querySelector("#productForm"),
  editingProductId: document.querySelector("#editingProductId"),
  productName: document.querySelector("#productName"),
  productCategory: document.querySelector("#productCategory"),
  productUnit: document.querySelector("#productUnit"),
  productMarket: document.querySelector("#productMarket"),
  productPrice: document.querySelector("#productPrice"),
  productSubmitLabel: document.querySelector("#productSubmitLabel"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  addToListForm: document.querySelector("#addToListForm"),
  productSelect: document.querySelector("#productSelect"),
  itemQuantity: document.querySelector("#itemQuantity"),
  clearListButton: document.querySelector("#clearListButton"),
  emptyListState: document.querySelector("#emptyListState"),
  shoppingList: document.querySelector("#shoppingList"),
  search: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  catalogList: document.querySelector("#catalogList"),
  summaryHighlights: document.querySelector("#summaryHighlights"),
  historyList: document.querySelector("#historyList"),
  tabButtons: document.querySelectorAll(".tab-button"),
  screens: document.querySelectorAll(".app-screen"),
  toast: document.querySelector("#toast"),
};

let state = loadState();
let toastTimer = null;

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function createSeedState() {
  return {
    month: getCurrentMonth(),
    budget: 600,
    products: [
      {
        id: "prod-arroz",
        name: "Arroz 5kg",
        category: "Mercearia",
        unit: "pacote",
        market: "Assai Cabo de Santo Agostinho",
        currentPrice: 27.5,
        previousPrice: 24.9,
        history: [
          { month: "2026-05", price: 24.9 },
          { month: "2026-06", price: 27.5 },
        ],
      },
      {
        id: "prod-feijao",
        name: "Feijao 1kg",
        category: "Mercearia",
        unit: "pacote",
        market: "Assai Cabo de Santo Agostinho",
        currentPrice: 8.99,
        previousPrice: 9.8,
        history: [
          { month: "2026-05", price: 9.8 },
          { month: "2026-06", price: 8.99 },
        ],
      },
      {
        id: "prod-leite",
        name: "Leite integral",
        category: "Laticinios",
        unit: "litro",
        market: "Assai Cabo de Santo Agostinho",
        currentPrice: 5.49,
        previousPrice: 5.49,
        history: [
          { month: "2026-05", price: 5.49 },
          { month: "2026-06", price: 5.49 },
        ],
      },
      {
        id: "prod-banana",
        name: "Banana prata",
        category: "Hortifruti",
        unit: "kg",
        market: "Assai Cabo de Santo Agostinho",
        currentPrice: 6.7,
        previousPrice: 7.25,
        history: [
          { month: "2026-05", price: 7.25 },
          { month: "2026-06", price: 6.7 },
        ],
      },
      {
        id: "prod-carne",
        name: "Carne moida",
        category: "Acougue",
        unit: "kg",
        market: "Assai Cabo de Santo Agostinho",
        currentPrice: 34.9,
        previousPrice: 31.8,
        history: [
          { month: "2026-05", price: 31.8 },
          { month: "2026-06", price: 34.9 },
        ],
      },
    ],
    listItems: [
      { id: "item-arroz", productId: "prod-arroz", quantity: 2 },
      { id: "item-feijao", productId: "prod-feijao", quantity: 4 },
      { id: "item-leite", productId: "prod-leite", quantity: 8 },
    ],
  };
}

function normalizeState(nextState) {
  nextState.products = (nextState.products || []).map(function (product) {
    return Object.assign({ market: "Assai Cabo de Santo Agostinho" }, product);
  });
  nextState.listItems = nextState.listItems || [];
  nextState.month = nextState.month || getCurrentMonth();
  nextState.budget = Number(nextState.budget) || 0;
  return nextState;
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return normalizeState(createSeedState());
  }

  try {
    return normalizeState(Object.assign(createSeedState(), JSON.parse(stored)));
  } catch (error) {
    return normalizeState(createSeedState());
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function toNumber(value) {
  return Number.parseFloat(value) || 0;
}

function normalizeName(name) {
  return name.trim().toLocaleLowerCase("pt-BR");
}

function getProductMarket(product) {
  return product.market || "Assai Cabo de Santo Agostinho";
}

function createId(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function formatMonthLabel(monthValue) {
  const safeMonth = monthValue || getCurrentMonth();
  const parts = safeMonth.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!year || !month) {
    return safeMonth;
  }

  return monthFormatter.format(new Date(year, month - 1, 1));
}

function sortHistoryEntries(history) {
  return (history || [])
    .slice()
    .filter(function (entry) {
      return entry && entry.month && Number(entry.price) >= 0;
    })
    .sort(function (a, b) {
      return a.month.localeCompare(b.month);
    });
}

function escapeHtml(value) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value).replace(/[&<>"']/g, function (char) {
    return map[char];
  });
}

function calculateTotals() {
  return state.listItems.reduce(
    function (acc, item) {
      const product = state.products.find(function (entry) {
        return entry.id === item.productId;
      });

      if (!product) {
        return acc;
      }

      acc.total += product.currentPrice * item.quantity;
      acc.quantity += item.quantity;
      acc.rows += 1;
      return acc;
    },
    { total: 0, quantity: 0, rows: 0 }
  );
}

function getTrend(product) {
  const previous = Number(product.previousPrice);
  const current = Number(product.currentPrice);

  if (!previous || Math.abs(current - previous) < 0.01) {
    return {
      type: "flat",
      label: "sem mudanca",
      difference: 0,
      percent: 0,
    };
  }

  const difference = current - previous;
  const percent = (difference / previous) * 100;
  const movedUp = difference > 0;
  const signal = movedUp ? "+" : "-";

  return {
    type: movedUp ? "up" : "down",
    label:
      (movedUp ? "subiu" : "baixou") +
      " " +
      formatMoney(Math.abs(difference)) +
      " (" +
      signal +
      percentFormatter.format(Math.abs(percent)) +
      "%)",
    difference: difference,
    percent: percent,
  };
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");

  toastTimer = window.setTimeout(function () {
    elements.toast.classList.remove("visible");
  }, 2300);
}

function syncTopInputs() {
  elements.month.value = state.month || getCurrentMonth();
  elements.budget.value = state.budget || 0;
}

function renderBudget() {
  const totals = calculateTotals();
  const remaining = state.budget - totals.total;
  const usedPercent = state.budget > 0 ? (totals.total / state.budget) * 100 : 0;
  const progressWidth = Math.min(usedPercent, 100);

  elements.totalSpent.textContent = formatMoney(totals.total);
  elements.remainingBudget.textContent = formatMoney(remaining);
  elements.itemCount.textContent = totals.rows;
  elements.budgetProgress.style.width = progressWidth + "%";

  elements.budgetStatus.classList.remove("status-ok", "status-warning", "status-over");

  if (remaining < 0) {
    elements.budgetStatus.textContent = "Passou " + formatMoney(Math.abs(remaining));
    elements.budgetStatus.classList.add("status-over");
    elements.budgetProgress.style.backgroundColor = "var(--danger)";
  } else if (state.budget > 0 && remaining <= state.budget * 0.15) {
    elements.budgetStatus.textContent = "Perto do limite";
    elements.budgetStatus.classList.add("status-warning");
    elements.budgetProgress.style.backgroundColor = "var(--warning)";
  } else {
    elements.budgetStatus.textContent = "Dentro do saldo";
    elements.budgetStatus.classList.add("status-ok");
    elements.budgetProgress.style.backgroundColor = "var(--success)";
  }
}

function renderProductOptions() {
  const selected = elements.productSelect.value;

  elements.productSelect.innerHTML = state.products
    .slice()
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, "pt-BR");
    })
    .map(function (product) {
      return (
        '<option value="' +
        escapeHtml(product.id) +
        '">' +
        escapeHtml(product.name) +
        " - " +
        formatMoney(product.currentPrice) +
        "</option>"
      );
    })
    .join("");

  if (
    state.products.some(function (product) {
      return product.id === selected;
    })
  ) {
    elements.productSelect.value = selected;
  }

  elements.productSelect.disabled = state.products.length === 0;
}

function renderShoppingList() {
  elements.emptyListState.hidden = state.listItems.length > 0;

  elements.shoppingList.innerHTML = state.listItems
    .map(function (item) {
      const product = state.products.find(function (entry) {
        return entry.id === item.productId;
      });

      if (!product) {
        return "";
      }

      const total = product.currentPrice * item.quantity;
      const safeName = escapeHtml(product.name);

      return [
        '<article class="list-row" data-item-id="' + escapeHtml(item.id) + '">',
        "<div>",
        '<p class="product-name">' + safeName + "</p>",
        '<p class="product-meta">' + formatMoney(product.currentPrice) + " por " + escapeHtml(product.unit) + " - " + escapeHtml(getProductMarket(product)) + "</p>",
        "</div>",
        '<input class="qty-input" type="number" min="0.01" step="0.01" value="' +
          item.quantity +
          '" aria-label="Quantidade de ' +
          safeName +
          '" data-action="quantity" />',
        '<div class="price-text">' + formatMoney(total) + "</div>",
        '<button class="row-button" type="button" data-action="remove" aria-label="Remover ' +
          safeName +
          '" title="Remover">x</button>',
        "</article>",
      ].join("");
    })
    .join("");
}

function renderCatalog() {
  const searchTerm = normalizeName(elements.search.value);
  const category = elements.categoryFilter.value;

  const products = state.products
    .filter(function (product) {
      return normalizeName(product.name).includes(searchTerm);
    })
    .filter(function (product) {
      return category === "all" || product.category === category;
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, "pt-BR");
    });

  if (products.length === 0) {
    elements.catalogList.innerHTML = '<div class="empty-state">Nenhum produto encontrado.</div>';
    return;
  }

  elements.catalogList.innerHTML = products
    .map(function (product) {
      const trend = getTrend(product);
      const safeName = escapeHtml(product.name);

      return [
        '<article class="catalog-row trend-' + trend.type + '-row" data-product-id="' + escapeHtml(product.id) + '">',
        "<div>",
        '<p class="product-name">' + safeName + "</p>",
        '<p class="product-meta">' + escapeHtml(getProductMarket(product)) + " - " + escapeHtml(product.category) + " - " + escapeHtml(product.unit) + "</p>",
        '<span class="trend-pill trend-' + trend.type + '">',
        '<span class="trend-icon" aria-hidden="true"></span>',
        escapeHtml(trend.label),
        "</span>",
        "</div>",
        '<div class="catalog-price">',
        "<strong>" + formatMoney(product.currentPrice) + "</strong>",
        '<div class="catalog-actions">',
        '<button class="small-button" type="button" data-action="add">Adicionar</button>',
        '<button class="small-button" type="button" data-action="edit">Editar</button>',
        '<button class="small-button danger" type="button" data-action="delete">Excluir</button>',
        "</div>",
        "</div>",
        "</article>",
      ].join("");
    })
    .join("");
}

function getMonthTrend(product, selectedMonth) {
  const monthValue = selectedMonth || state.month || getCurrentMonth();
  const history = sortHistoryEntries(product.history);
  let currentIndex = -1;

  history.forEach(function (entry, index) {
    if (entry.month <= monthValue) {
      currentIndex = index;
    }
  });

  let currentEntry = currentIndex >= 0 ? history[currentIndex] : null;
  let previousEntry = currentIndex > 0 ? history[currentIndex - 1] : null;

  if (!currentEntry) {
    currentEntry = {
      month: monthValue,
      price: Number(product.currentPrice) || 0,
      fallback: true,
    };
  }

  if (!previousEntry && Number(product.previousPrice) > 0 && Number(product.previousPrice) !== Number(currentEntry.price)) {
    previousEntry = {
      month: "anterior",
      price: Number(product.previousPrice),
      fallback: true,
    };
  }

  const current = Number(currentEntry.price) || 0;
  const previous = previousEntry ? Number(previousEntry.price) || 0 : current;

  if (!previous || Math.abs(current - previous) < 0.01) {
    return {
      type: "flat",
      label: "sem mudanca",
      difference: 0,
      percent: 0,
      currentPrice: current,
      previousPrice: previous,
      currentMonth: currentEntry.month,
      previousMonth: previousEntry ? previousEntry.month : null,
      selectedMonth: monthValue,
    };
  }

  const difference = current - previous;
  const percent = (difference / previous) * 100;
  const movedUp = difference > 0;
  const signal = movedUp ? "+" : "-";

  return {
    type: movedUp ? "up" : "down",
    label:
      (movedUp ? "subiu" : "baixou") +
      " " +
      formatMoney(Math.abs(difference)) +
      " (" +
      signal +
      percentFormatter.format(Math.abs(percent)) +
      "%)",
    difference: difference,
    percent: percent,
    currentPrice: current,
    previousPrice: previous,
    currentMonth: currentEntry.month,
    previousMonth: previousEntry ? previousEntry.month : null,
    selectedMonth: monthValue,
  };
}

function getProductTrendRows(monthValue) {
  return state.products.map(function (product) {
    return {
      product: product,
      trend: getMonthTrend(product, monthValue || state.month),
    };
  });
}

function renderSummaryHighlights() {
  if (!elements.summaryHighlights) {
    return;
  }

  const monthValue = state.month || getCurrentMonth();
  const monthLabel = formatMonthLabel(monthValue);
  const totals = calculateTotals();
  const usedPercent = state.budget > 0 ? Math.min((totals.total / state.budget) * 100, 999) : 0;
  const trendRows = getProductTrendRows(monthValue);
  const biggestUp = trendRows
    .filter(function (entry) {
      return entry.trend.type === "up";
    })
    .sort(function (a, b) {
      return b.trend.difference - a.trend.difference;
    })[0];
  const biggestDown = trendRows
    .filter(function (entry) {
      return entry.trend.type === "down";
    })
    .sort(function (a, b) {
      return a.trend.difference - b.trend.difference;
    })[0];

  const remaining = state.budget - totals.total;
  const statusText = remaining < 0 ? "Acima do saldo" : state.budget > 0 && remaining <= state.budget * 0.15 ? "Perto do limite" : "Dentro do saldo";

  if (elements.summaryTitle) {
    elements.summaryTitle.textContent = "Resumo de " + monthLabel;
  }

  elements.summaryHighlights.innerHTML = [
    '<article class="insight-card">',
    '<span class="insight-label">Mes selecionado</span>',
    '<strong>' + escapeHtml(monthLabel) + '</strong>',
    '<p class="insight-meta">Baseado no calendario acima</p>',
    '</article>',
    '<article class="insight-card">',
    '<span class="insight-label">Uso do saldo</span>',
    '<strong>' + percentFormatter.format(usedPercent) + '%</strong>',
    '<p class="insight-meta">' + formatMoney(totals.total) + ' de ' + formatMoney(state.budget) + '</p>',
    '</article>',
    '<article class="insight-card insight-up">',
    '<span class="insight-label">Maior alta no mes</span>',
    '<strong>' + escapeHtml(biggestUp ? biggestUp.product.name : 'Sem alta') + '</strong>',
    '<p class="insight-meta">' + escapeHtml(biggestUp ? biggestUp.trend.label : 'Nenhum produto subiu ate esse mes') + '</p>',
    '</article>',
    '<article class="insight-card insight-down">',
    '<span class="insight-label">Maior baixa no mes</span>',
    '<strong>' + escapeHtml(biggestDown ? biggestDown.product.name : 'Sem baixa') + '</strong>',
    '<p class="insight-meta">' + escapeHtml(biggestDown ? biggestDown.trend.label : 'Nenhum produto baixou ate esse mes') + '</p>',
    '</article>',
  ].join('');
}

function renderHistory() {
  if (!elements.historyList) {
    return;
  }

  const monthValue = state.month || getCurrentMonth();
  const monthLabel = formatMonthLabel(monthValue);

  if (elements.historyTitle) {
    elements.historyTitle.textContent = "Mudancas de preco em " + monthLabel;
  }

  if (state.products.length === 0) {
    elements.historyList.innerHTML = '<div class="empty-state">Nenhum produto salvo.</div>';
    return;
  }

  elements.historyList.innerHTML = state.products
    .slice()
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, "pt-BR");
    })
    .map(function (product) {
      const trend = getMonthTrend(product, monthValue);
      const history = sortHistoryEntries(product.history)
        .filter(function (entry) {
          return entry.month <= monthValue;
        })
        .slice(-4);
      const safeName = escapeHtml(product.name);
      const changeClass = trend.type === "up" ? "history-up" : trend.type === "down" ? "history-down" : "history-flat";
      const monthNote = trend.currentMonth === monthValue
        ? 'Registro de ' + formatMonthLabel(monthValue)
        : 'Ultimo registro ate ' + monthLabel + ': ' + formatMonthLabel(trend.currentMonth);
      const prices = history.length
        ? history
            .map(function (entry) {
              return '<span class="history-price">' + escapeHtml(formatMonthLabel(entry.month)) + ' - ' + formatMoney(entry.price) + '</span>';
            })
            .join('')
        : '<span class="history-price">Sem historico anterior</span>';

      return [
        '<article class="history-row trend-' + trend.type + '-row">',
        '<div class="history-main">',
        '<div>',
        '<p class="product-name">' + safeName + '</p>',
        '<p class="product-meta">' + escapeHtml(getProductMarket(product)) + ' - ' + escapeHtml(product.category) + ' - ' + escapeHtml(product.unit) + '</p>',
        '</div>',
        '<div class="history-prices">',
        '<span class="history-price">' + escapeHtml(monthNote) + '</span>',
        prices,
        '</div>',
        '</div>',
        '<div class="history-change">',
        '<span class="trend-pill trend-' + trend.type + '"><span class="trend-icon" aria-hidden="true"></span>' + escapeHtml(trend.label) + '</span>',
        '<strong class="' + changeClass + '">' + formatMoney(trend.currentPrice) + '</strong>',
        '</div>',
        '</article>',
      ].join('');
    })
    .join('');
}

function switchScreen(targetId) {
  elements.screens.forEach(function (screen) {
    const isActive = screen.id === targetId;
    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });

  elements.tabButtons.forEach(function (button) {
    const isActive = button.dataset.screenTarget === targetId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function renderAll() {
  renderBudget();
  renderProductOptions();
  renderShoppingList();
  renderCatalog();
  renderSummaryHighlights();
  renderHistory();
}

function resetProductForm() {
  elements.productForm.reset();
  elements.editingProductId.value = "";
  elements.productSubmitLabel.textContent = "Salvar produto";
  elements.cancelEditButton.hidden = true;
  elements.productName.focus();
}

function saveProduct(event) {
  event.preventDefault();

  const editingId = elements.editingProductId.value;
  const name = elements.productName.value.trim();
  const category = elements.productCategory.value;
  const unit = elements.productUnit.value;
  const market = elements.productMarket.value;
  const price = toNumber(elements.productPrice.value);

  if (!name || price <= 0) {
    showToast("Informe o nome e um valor maior que zero.");
    return;
  }

  const duplicate = state.products.find(function (product) {
    return normalizeName(product.name) === normalizeName(name) && product.id !== editingId;
  });

  if (duplicate && !editingId) {
    updateProductPrice(duplicate, { name: name, category: category, unit: unit, market: market, price: price });
    showToast("Produto ja existia. Atualizei o preco e o historico.");
  } else if (editingId) {
    const product = state.products.find(function (entry) {
      return entry.id === editingId;
    });

    if (!product) {
      showToast("Produto nao encontrado.");
      return;
    }

    updateProductPrice(product, { name: name, category: category, unit: unit, market: market, price: price });
    showToast("Produto atualizado.");
  } else {
    state.products.push({
      id: createId("prod"),
      name: name,
      category: category,
      unit: unit,
      market: market,
      currentPrice: price,
      previousPrice: null,
      history: [{ month: state.month, price: price }],
    });
    showToast("Produto salvo.");
  }

  saveState();
  resetProductForm();
  renderAll();
}

function updateProductPrice(product, values) {
  const oldPrice = Number(product.currentPrice);

  product.name = values.name;
  product.category = values.category;
  product.unit = values.unit;
  product.market = values.market || getProductMarket(product);

  if (Math.abs(oldPrice - values.price) >= 0.01) {
    product.previousPrice = oldPrice;
    product.currentPrice = values.price;
    product.history = (product.history || []).concat([{ month: state.month, price: values.price }]);
  } else {
    product.currentPrice = values.price;
  }
}

function addProductToList(productId, quantity) {
  const amount = quantity || 1;
  const product = state.products.find(function (entry) {
    return entry.id === productId;
  });

  if (!product) {
    showToast("Escolha um produto salvo.");
    return;
  }

  const existing = state.listItems.find(function (item) {
    return item.productId === productId;
  });

  if (existing) {
    existing.quantity = Number((existing.quantity + amount).toFixed(2));
  } else {
    state.listItems.push({
      id: createId("item"),
      productId: productId,
      quantity: amount,
    });
  }

  saveState();
  renderAll();
  showToast(product.name + " entrou na lista.");
}

function fillFormForEdit(product) {
  elements.editingProductId.value = product.id;
  elements.productName.value = product.name;
  elements.productCategory.value = product.category;
  elements.productUnit.value = product.unit;
  elements.productMarket.value = getProductMarket(product);
  elements.productPrice.value = product.currentPrice;
  elements.productSubmitLabel.textContent = "Atualizar produto";
  elements.cancelEditButton.hidden = false;
  elements.productName.focus();
}

elements.month.addEventListener("change", function () {
  state.month = elements.month.value || getCurrentMonth();
  saveState();
  renderSummaryHighlights();
  renderHistory();
});

elements.budget.addEventListener("input", function () {
  state.budget = toNumber(elements.budget.value);
  saveState();
  renderBudget();
  renderSummaryHighlights();
});

elements.productForm.addEventListener("submit", saveProduct);
elements.cancelEditButton.addEventListener("click", resetProductForm);

elements.addToListForm.addEventListener("submit", function (event) {
  event.preventDefault();
  addProductToList(elements.productSelect.value, Math.max(toNumber(elements.itemQuantity.value), 0.01));
  elements.itemQuantity.value = 1;
});

elements.clearListButton.addEventListener("click", function () {
  state.listItems = [];
  saveState();
  renderAll();
  showToast("Lista limpa.");
});

elements.shoppingList.addEventListener("input", function (event) {
  if (event.target.dataset.action !== "quantity") {
    return;
  }

  const row = event.target.closest("[data-item-id]");
  const item = state.listItems.find(function (entry) {
    return entry.id === row.dataset.itemId;
  });

  if (!item) {
    return;
  }

  item.quantity = Math.max(toNumber(event.target.value), 0.01);
  const product = state.products.find(function (entry) {
    return entry.id === item.productId;
  });

  if (product) {
    row.querySelector(".price-text").textContent = formatMoney(product.currentPrice * item.quantity);
  }

  saveState();
  renderBudget();
  renderSummaryHighlights();
});

elements.shoppingList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const row = button.closest("[data-item-id]");

  if (button.dataset.action === "remove") {
    state.listItems = state.listItems.filter(function (item) {
      return item.id !== row.dataset.itemId;
    });
    saveState();
    renderAll();
    showToast("Item removido.");
  }
});

elements.catalogList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const row = button.closest("[data-product-id]");
  const product = state.products.find(function (entry) {
    return entry.id === row.dataset.productId;
  });

  if (!product) {
    return;
  }

  if (button.dataset.action === "add") {
    addProductToList(product.id, 1);
  }

  if (button.dataset.action === "edit") {
    fillFormForEdit(product);
  }

  if (button.dataset.action === "delete") {
    state.products = state.products.filter(function (entry) {
      return entry.id !== product.id;
    });
    state.listItems = state.listItems.filter(function (item) {
      return item.productId !== product.id;
    });
    saveState();
    renderAll();
    showToast("Produto excluido.");
  }
});

elements.search.addEventListener("input", renderCatalog);
elements.categoryFilter.addEventListener("change", renderCatalog);

elements.tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    switchScreen(button.dataset.screenTarget);
  });
});

syncTopInputs();
renderAll();
switchScreen("summaryScreen");
