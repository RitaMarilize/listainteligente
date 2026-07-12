const STORAGE_KEY = "listaMercadoInteligente.v1";
const OCR_SCRIPT_URLS = [
  "https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/tesseract.min.js",
  "https://unpkg.com/tesseract.js@7/dist/tesseract.min.js",
];

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
  totalSpentNote: document.querySelector("#totalSpentNote"),
  remainingBudget: document.querySelector("#remainingBudget"),
  remainingBudgetNote: document.querySelector("#remainingBudgetNote"),
  itemCount: document.querySelector("#itemCount"),
  itemCountNote: document.querySelector("#itemCountNote"),
  summaryTitle: document.querySelector("#summaryTitle"),
  historyTitle: document.querySelector("#historyTitle"),
  budgetStatus: document.querySelector("#budgetStatus"),
  budgetProgress: document.querySelector("#budgetProgress"),
  budgetPill: document.querySelector("#budgetPill"),
  budgetProgressCaption: document.querySelector("#budgetProgressCaption"),
  quickAddButton: document.querySelector("#quickAddButton"),
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
  offerMarket: document.querySelector("#offerMarket"),
  offerUrl: document.querySelector("#offerUrl"),
  readOfferUrlButton: document.querySelector("#readOfferUrlButton"),
  offerImageInput: document.querySelector("#offerImageInput"),
  offerText: document.querySelector("#offerText"),
  analyzeOffersButton: document.querySelector("#analyzeOffersButton"),
  clearOffersButton: document.querySelector("#clearOffersButton"),
  emptyOffersState: document.querySelector("#emptyOffersState"),
  offerResults: document.querySelector("#offerResults"),
  offerImportActions: document.querySelector("#offerImportActions"),
  addOffersToList: document.querySelector("#addOffersToList"),
  importOffersButton: document.querySelector("#importOffersButton"),
  ocrProgress: document.querySelector("#ocrProgress"),
  ocrProgressFill: document.querySelector("#ocrProgressFill"),
  ocrProgressLabel: document.querySelector("#ocrProgressLabel"),
  offerPreview: document.querySelector("#offerPreview"),
  offerPreviewImage: document.querySelector("#offerPreviewImage"),
  tabButtons: document.querySelectorAll(".tab-button"),
  screens: document.querySelectorAll(".app-screen"),
  toast: document.querySelector("#toast"),
};

let state = loadState();
saveState();
let toastTimer = null;
let offerCandidates = [];
let offerPreviewUrl = "";
let expandedCategories = new Set();

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
    return Object.assign({ market: "Assai Cabo de Santo Agostinho" }, product, {
      name: cleanOfferName(product.name),
    });
  });
  nextState.listItems = (nextState.listItems || []).map(function (item) {
    return Object.assign({}, item, {
      quantity: toWholeQuantity(item.quantity),
    });
  });
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

function toWholeQuantity(value) {
  return Math.max(Math.round(toNumber(value)), 1);
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

function getIconSvg(name) {
  const icons = {
    basket: '<path d="M5 11h14l-1.2 8.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 11Z"></path><path d="M8.5 11 12 4l3.5 7"></path><path d="M9 15v2.5"></path><path d="M12 15v2.5"></path><path d="M15 15v2.5"></path>',
    "bar-chart": '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M8 16v-5"></path><path d="M12 16V8"></path><path d="M16 16v-7"></path>',
    list: '<path d="M8 6h12"></path><path d="M8 12h12"></path><path d="M8 18h12"></path><path d="M4 6h.01"></path><path d="M4 12h.01"></path><path d="M4 18h.01"></path>',
    package: '<path d="m21 16-9 5-9-5V8l9-5 9 5v8Z"></path><path d="m3.3 7.5 8.7 5 8.7-5"></path><path d="M12 22V12"></path>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v6h6"></path><path d="M12 7v5l3 2"></path>',
    cart: '<path d="M6 6h15l-2 8H8L6 3H3"></path><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v12H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"></path><path d="M4 8h16"></path><path d="M15 13h5v4h-5a2 2 0 0 1 0-4Z"></path><path d="M17 15h.01"></path>',
    bag: '<path d="M6 8h12l-1 12H7L6 8Z"></path><path d="M9 8a3 3 0 0 1 6 0"></path>',
    "check-circle": '<circle cx="12" cy="12" r="9"></circle><path d="m8 12.5 2.5 2.5L16 9"></path>',
    "alert-circle": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 17h.01"></path>',
    "x-circle": '<circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6"></path><path d="m15 9-6 6"></path>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path>',
    percent: '<path d="m19 5-14 14"></path><circle cx="7.5" cy="7.5" r="2"></circle><circle cx="16.5" cy="16.5" r="2"></circle>',
    "trend-up": '<path d="m4 16 5-5 4 4 7-8"></path><path d="M15 7h5v5"></path>',
    "trend-down": '<path d="m4 8 5 5 4-4 7 8"></path><path d="M15 17h5v-5"></path>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
  };

  return (
    '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    (icons[name] || "") +
    "</svg>"
  );
}

function renderStaticIcons() {
  document.querySelectorAll(".icon-slot[data-icon]").forEach(function (slot) {
    slot.innerHTML = getIconSvg(slot.dataset.icon);
  });
}

function startFooterTypewriter() {
  const target = document.querySelector(".footer-typewriter");

  if (!target) {
    return;
  }

  const text = target.dataset.text || "Desenvolvido por Rita M.";
  let index = 1;
  let direction = 1;

  target.textContent = text.slice(0, index);

  function tick() {
    if (direction > 0) {
      index += 1;

      if (index >= text.length) {
        index = text.length;
        direction = -1;
        target.textContent = text;
        window.setTimeout(tick, 1300);
        return;
      }
    } else {
      index -= 1;

      if (index <= 1) {
        index = 1;
        direction = 1;
        target.textContent = text.slice(0, index);
        window.setTimeout(tick, 260);
        return;
      }
    }

    target.textContent = text.slice(0, index);
    window.setTimeout(tick, direction > 0 ? 85 : 42);
  }

  window.setTimeout(tick, 180);
}

function parseBrazilianPrice(value) {
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  return Number.parseFloat(normalized) || 0;
}

function isLikelyOcrPrefix(value) {
  const prefix = String(value || "").trim();
  const folded = prefix
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const words = folded.split(/\s+/).filter(Boolean);

  return (
    /\d/.test(prefix) ||
    words.length > 1 ||
    /^(?:avi|es|ipla|ml|no|so|ne|total|vv|nm|2lubf)$/.test(folded)
  );
}

function cleanOfferName(value) {
  let name = String(value || "")
    .replace(/^[\s\-â€“â€”â€¢*|:]+/, "")
    .replace(/\b(?:por|apenas|cada|oferta|leve|de)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const productAnchor =
    /\b(?:sabonete|shampoo|desodorante|papel[\s-]+higi[Ãªe]nico|fralda|amaciante|multi[\s-]*inseticida|inseticida|odorizante|esponja|copos?|papel[\s-]*toalha|frigideira|garrafa[\s-]+t[eÃ©]rmica|panela|arroz|feij[aÃ£]o|leite|banana|carne)\b/i;
  const anchorMatch = name.match(productAnchor);

  if (anchorMatch && anchorMatch.index > 0 && isLikelyOcrPrefix(name.slice(0, anchorMatch.index))) {
    name = name.slice(anchorMatch.index);
  }

  return name
    .replace(/\bESPONJA\s+(?:DE\s+)?A(?:C|Ã‡)O\b/gi, "ESPONJA DE AÃ‡O")
    .replace(/\bAMACIANTE\s+(?:DE\s+)?ROUPAS\b/gi, "AMACIANTE DE ROUPAS")
    .replace(/\bODORIZANTE\s+(?:DE\s+)?AMBIENTE\b/gi, "ODORIZANTE DE AMBIENTE")
    .replace(/\bPANELA\s+(?:DE\s+)?PRESS(?:A|Ãƒ)O\b/gi, "PANELA DE PRESSÃƒO")
    .replace(/\bPAPEL\s*-\s*TOALHA\b/gi, "PAPEL-TOALHA")
    .replace(/\bPAPEL\s+HIGIENICO\b/gi, "PAPEL HIGIÃŠNICO")
    .replace(/\bGARRAFA\s+TERMICA\b/gi, "GARRAFA TÃ‰RMICA")
    .replace(/\bFRAGRANCIAS\b/gi, "FRAGRÃ‚NCIAS")
    .replace(/\bYPE\b/g, "YPÃŠ")
    .replace(/\bFRASC\b/gi, "FRASCO")
    .replace(/\bFRASCO\s+(\d+ML)\s+(\d+ML)\b/gi, "FRASCO LEVE $1 PAGUE $2")
    .replace(/\bPACOTE\s+12\s+11\s+ROLOS\b/gi, "PACOTE LEVE 12 PAGUE 11 ROLOS")
    .replace(/\bROLOS\s+(\d+(?:[.,]\d+)?M)\b/gi, "ROLOS DE $1")
    .replace(/\bFOFO\s+FRASCO$/i, "FOFO FRASCO 500ML")
    .replace(/(\d+(?:[.,]\d+)?)\s*CM\s*[Xx]\s*(\d+(?:[.,]\d+)?)\s*CM/gi, "$1CM X $2CM")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inferOfferCategory(name) {
  const value = normalizeName(name);

  if (/(carne|frango|linguica|linguiÃ§a|bovina|suina|suÃ­na|acougue)/.test(value)) {
    return "Acougue";
  }
  if (/(banana|maca|maÃ§Ã£|tomate|batata|cebola|verdura|fruta|alface|cenoura)/.test(value)) {
    return "Hortifruti";
  }
  if (/(leite|queijo|iogurte|manteiga|requeijao|requeijÃ£o)/.test(value)) {
    return "Laticinios";
  }
  if (/(refrigerante|suco|agua|Ã¡gua|cerveja|vinho|bebida)/.test(value)) {
    return "Bebidas";
  }
  if (/(detergente|sabao|sabÃ£o|desinfetante|amaciante|limpeza|papel higienico|papel higiÃªnico)/.test(value)) {
    return "Limpeza";
  }
  if (/(arroz|feijao|feijÃ£o|macarrao|macarrÃ£o|farinha|acucar|aÃ§Ãºcar|cafe|cafÃ©|oleo|Ã³leo|biscoito)/.test(value)) {
    return "Mercearia";
  }
  return "Outros";
}

function inferOfferUnit(name) {
  const value = normalizeName(name);

  if (/\b\d+(?:[.,]\d+)?\s*kg\b|\bkg\b/.test(value)) {
    return "kg";
  }
  if (/\b\d+(?:[.,]\d+)?\s*(?:l|litro|litros)\b/.test(value)) {
    return "litro";
  }
  if (/\bcaixa\b|\bcx\b/.test(value)) {
    return "caixa";
  }
  if (/\bpacote\b|\bpct\b/.test(value)) {
    return "pacote";
  }
  if (/\b\d+\s*g\b/.test(value)) {
    return "g";
  }
  return "un";
}

function isUsefulOfferName(value) {
  const name = cleanOfferName(value);
  const foldedName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const meaningfulWords = foldedName
    .split(/\s+/)
    .filter(function (word) {
      return /[a-z]/.test(word) && !/^(de|cada|por|leve|pague|preco|oferta|r)$/.test(word);
    });

  return (
    name.length >= 3 &&
    name.length <= 140 &&
    /[a-zA-Z\u00C0-\u00FF]/.test(name) &&
    meaningfulWords.length > 0 &&
    !/^(?:de|cada|por|r\$?|x|\d+[.,]\d{2})(?:\s+(?:de|cada|por|r\$?|x|\d+[.,]\d{2}))*$/i.test(name) &&
    !/(?:atendimento|cliente|site|validos|estoque|cartao|app meu|assai\.com|redes sociais|proibida|ministerio|saude|parcele|juros|pix|0800)/.test(
      foldedName
    ) &&
    !/^(ofertas?|precos?|preÃ§os?|mercado|supermercado|validade|economize|panfleto)$/i.test(name)
  );
}

function parseOcrWords(tsv) {
  return String(tsv || "")
    .split(/\r?\n/)
    .slice(1)
    .map(function (row) {
      const columns = row.split("\t");

      if (columns.length < 12 || Number(columns[0]) !== 5) {
        return null;
      }

      const left = Number(columns[6]);
      const top = Number(columns[7]);
      const width = Number(columns[8]);
      const height = Number(columns[9]);
      const text = columns.slice(11).join(" ").trim();

      if (!text || !width || !height) {
        return null;
      }

      return {
        text: text,
        confidence: Number(columns[10]) || 0,
        lineKey: columns.slice(1, 5).join("-"),
        left: left,
        top: top,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2,
        height: height,
      };
    })
    .filter(Boolean);
}

function getOcrWordPrice(word) {
  const normalized = word.text.replace(/[oO]/g, "0");
  const match = normalized.match(/(\d{1,3}[.,]\d{2})(?!\d)/);

  if (!match) {
    return 0;
  }

  const price = parseBrazilianPrice(match[1]);
  return price > 0 && price < 10000 ? price : 0;
}

function getMedian(values) {
  const sorted = values.slice().sort(function (a, b) {
    return a - b;
  });

  if (sorted.length === 0) {
    return 0;
  }

  return sorted[Math.floor(sorted.length / 2)];
}

function groupOcrPriceRows(words, medianHeight) {
  const tolerance = Math.max(8, medianHeight * 1.4);
  const rows = [];

  words
    .map(function (word) {
      return Object.assign({}, word, { price: getOcrWordPrice(word) });
    })
    .filter(function (word) {
      return word.price > 0;
    })
    .sort(function (a, b) {
      return a.centerY - b.centerY || a.centerX - b.centerX;
    })
    .forEach(function (word) {
      let row = rows[rows.length - 1];

      if (!row || Math.abs(word.centerY - row.centerY) > tolerance) {
        row = { centerY: word.centerY, prices: [] };
        rows.push(row);
      }

      const duplicate = row.prices.some(function (priceWord) {
        return Math.abs(priceWord.centerX - word.centerX) < Math.max(8, medianHeight);
      });

      if (!duplicate) {
        row.prices.push(word);
        row.centerY =
          row.prices.reduce(function (sum, priceWord) {
            return sum + priceWord.centerY;
          }, 0) / row.prices.length;
      }
    });

  return rows
    .map(function (row) {
      row.prices.sort(function (a, b) {
        return a.centerX - b.centerX;
      });
      return row;
    })
    .filter(function (row) {
      return row.prices.length >= 2;
    });
}

function findOfferPricePairs(priceRows, pageWidth, medianHeight) {
  const pairs = [];

  priceRows.forEach(function (saleRow, saleIndex) {
    for (let regularIndex = saleIndex - 1; regularIndex >= 0; regularIndex -= 1) {
      const regularRow = priceRows[regularIndex];
      const verticalGap = saleRow.centerY - regularRow.centerY;

      if (verticalGap > medianHeight * 14) {
        break;
      }

      if (Math.abs(saleRow.prices.length - regularRow.prices.length) > 1) {
        continue;
      }

      const itemCount = Math.min(saleRow.prices.length, regularRow.prices.length);
      const columnTolerance = Math.max(35, (pageWidth / Math.max(itemCount, 1)) * 0.38);
      const unmatchedRegularPrices = regularRow.prices.slice();
      let aligned = 0;
      let discounted = 0;

      saleRow.prices.forEach(function (salePrice) {
        let nearestIndex = -1;
        let nearestDistance = Number.POSITIVE_INFINITY;

        unmatchedRegularPrices.forEach(function (regularPrice, regularIndex) {
          const distance = Math.abs(salePrice.centerX - regularPrice.centerX);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = regularIndex;
          }
        });

        if (nearestIndex >= 0 && nearestDistance <= columnTolerance) {
          const regularPrice = unmatchedRegularPrices.splice(nearestIndex, 1)[0];
          aligned += 1;
          if (salePrice.price < regularPrice.price) {
            discounted += 1;
          }
        }
      });

      if (
        aligned >= Math.max(2, Math.ceil(itemCount * 0.6)) &&
        discounted >= Math.max(1, Math.ceil(itemCount * 0.5))
      ) {
        pairs.push({ regular: regularRow, sale: saleRow });
        break;
      }
    }
  });

  return pairs.filter(function (pair, index) {
    return !pairs.slice(0, index).some(function (previousPair) {
      return Math.abs(previousPair.sale.centerY - pair.sale.centerY) < medianHeight * 2;
    });
  });
}

function cleanOcrNameToken(value) {
  const token = String(value || "")
    .replace(/^[^0-9A-Za-z\u00C0-\u00FF]+|[^0-9A-Za-z\u00C0-\u00FF%]+$/g, "")
    .trim();
  const folded = token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    !token ||
    getOcrWordPrice({ text: token }) ||
    /^(?:de|cada|por|r|rs|leve|pague|mais|menos|preco|oferta|emb|un)$/i.test(folded) ||
    (token.length === 1 && !/\d/.test(token))
  ) {
    return "";
  }

  return token;
}

function buildOcrOfferName(words, left, right, top, bottom) {
  const lines = new Map();

  words.forEach(function (word) {
    if (
      word.centerX < left ||
      word.centerX >= right ||
      word.centerY < top ||
      word.centerY >= bottom ||
      word.confidence < 12
    ) {
      return;
    }

    const token = cleanOcrNameToken(word.text);

    if (!token) {
      return;
    }

    if (!lines.has(word.lineKey)) {
      lines.set(word.lineKey, { top: word.top, words: [] });
    }

    lines.get(word.lineKey).words.push(Object.assign({}, word, { cleanText: token }));
  });

  const lineTexts = Array.from(lines.values())
    .sort(function (a, b) {
      return a.top - b.top;
    })
    .map(function (line) {
      return line.words
        .sort(function (a, b) {
          return a.left - b.left;
        })
        .map(function (word) {
          return word.cleanText;
        })
        .join(" ");
    })
    .filter(Boolean)
    .slice(-6);
  const tokens = [];

  lineTexts
    .join(" ")
    .split(/\s+/)
    .forEach(function (token) {
      if (tokens[tokens.length - 1] !== token) {
        tokens.push(token);
      }
    });

  return cleanOfferName(tokens.join(" ").slice(0, 140));
}

function parseOfferLayout(tsv) {
  const words = parseOcrWords(tsv);

  if (words.length === 0) {
    return [];
  }

  const medianHeight = Math.max(
    8,
    getMedian(
      words.map(function (word) {
        return word.height;
      })
    )
  );
  const pageWidth = Math.max.apply(
    null,
    words.map(function (word) {
      return word.right;
    })
  );
  const priceRows = groupOcrPriceRows(words, medianHeight);
  const pricePairs = findOfferPricePairs(priceRows, pageWidth, medianHeight);
  const offerMarkers = words.filter(function (word) {
    const folded = word.text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    return folded === "por" || folded === "cada";
  });
  const detectedRows = pricePairs.map(function (pair) {
    return {
      regular: pair.regular,
      sale: pair.sale,
    };
  });

  priceRows.forEach(function (priceRow) {
    const alreadyDetected = detectedRows.some(function (detectedRow) {
      return Math.abs(detectedRow.sale.centerY - priceRow.centerY) < medianHeight * 2;
    });

    if (alreadyDetected || priceRow.prices.length < 2) {
      return;
    }

    const nearbyMarkers = offerMarkers.filter(function (marker) {
      return marker.centerY < priceRow.centerY && priceRow.centerY - marker.centerY <= medianHeight * 12;
    });

    if (nearbyMarkers.length >= Math.max(1, Math.ceil(priceRow.prices.length * 0.5))) {
      detectedRows.push({
        regular: null,
        sale: priceRow,
      });
    }
  });

  detectedRows.sort(function (a, b) {
    return a.sale.centerY - b.sale.centerY;
  });
  const results = [];

  detectedRows.forEach(function (detectedRow, rowIndex) {
    const salePrices = detectedRow.sale.prices;
    const previousBottom = rowIndex > 0 ? detectedRows[rowIndex - 1].sale.centerY + medianHeight * 3 : 0;
    const referenceY = detectedRow.regular ? detectedRow.regular.centerY : detectedRow.sale.centerY;
    const nameTop = Math.max(previousBottom, referenceY - medianHeight * 20);
    const nameBottom = detectedRow.regular
      ? detectedRow.regular.centerY - medianHeight * 0.8
      : detectedRow.sale.centerY - medianHeight * 2;

    salePrices.forEach(function (salePrice, columnIndex) {
      const left =
        columnIndex === 0 ? 0 : (salePrices[columnIndex - 1].centerX + salePrice.centerX) / 2;
      const right =
        columnIndex === salePrices.length - 1
          ? pageWidth
          : (salePrice.centerX + salePrices[columnIndex + 1].centerX) / 2;
      const name = buildOcrOfferName(words, left, right, nameTop, nameBottom);

      if (!isUsefulOfferName(name)) {
        return;
      }

      const duplicate = results.some(function (offer) {
        return normalizeName(offer.name) === normalizeName(name) && Math.abs(offer.price - salePrice.price) < 0.01;
      });

      if (!duplicate) {
        results.push({
          id: createId("offer"),
          selected: true,
          name: name,
          price: salePrice.price,
          category: inferOfferCategory(name),
          unit: inferOfferUnit(name),
        });
      }
    });
  });

  return results;
}

function parseOfferText(text) {
  const lines = String(text || "")
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map(function (line) {
      return line.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean);
  const results = [];
  let pendingName = "";

  lines.forEach(function (line) {
    const pricePattern = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})/gi;
    const matches = Array.from(line.matchAll(pricePattern));

    if (matches.length === 0) {
      if (isUsefulOfferName(line)) {
        pendingName = cleanOfferName(line);
      }
      return;
    }

    const priceMatch = matches[matches.length - 1];
    const price = parseBrazilianPrice(priceMatch[1]);
    let name = cleanOfferName(line.slice(0, priceMatch.index));

    if (!isUsefulOfferName(name)) {
      name = pendingName;
    }

    name = cleanOfferName(name.replace(/\bR\$\s*$/i, ""));

    if (!isUsefulOfferName(name) || price <= 0 || price > 99999) {
      return;
    }

    const duplicate = results.some(function (offer) {
      return normalizeName(offer.name) === normalizeName(name) && Math.abs(offer.price - price) < 0.01;
    });

    if (!duplicate) {
      results.push({
        id: createId("offer"),
        selected: true,
        name: name,
        price: price,
        category: inferOfferCategory(name),
        unit: inferOfferUnit(name),
      });
    }

    pendingName = "";
  });

  return results;
}

function getCategoryOptions(selectedCategory) {
  return ["Mercearia", "Acougue", "Hortifruti", "Laticinios", "Bebidas", "Limpeza", "Outros"]
    .map(function (category) {
      return (
        '<option value="' +
        escapeHtml(category) +
        '"' +
        (category === selectedCategory ? " selected" : "") +
        ">" +
        escapeHtml(category) +
        "</option>"
      );
    })
    .join("");
}

function getUnitOptions(selectedUnit) {
  return ["un", "kg", "g", "pacote", "caixa", "litro"]
    .map(function (unit) {
      return (
        '<option value="' +
        escapeHtml(unit) +
        '"' +
        (unit === selectedUnit ? " selected" : "") +
        ">" +
        escapeHtml(unit) +
        "</option>"
      );
    })
    .join("");
}

function renderOfferCandidates() {
  elements.emptyOffersState.hidden = offerCandidates.length > 0;
  elements.offerImportActions.hidden = offerCandidates.length === 0;

  elements.offerResults.innerHTML = offerCandidates
    .map(function (offer) {
      return [
        '<article class="offer-result" data-offer-id="' + escapeHtml(offer.id) + '">',
        '<input class="offer-selected" type="checkbox" aria-label="Selecionar oferta"' + (offer.selected ? " checked" : "") + " />",
        '<label>Produto<input class="offer-name" type="text" value="' + escapeHtml(offer.name) + '" /></label>',
        '<label class="offer-price">Preco<input type="number" min="0.01" step="0.01" value="' + offer.price.toFixed(2) + '" /></label>',
        '<label class="offer-category">Categoria<select>' + getCategoryOptions(offer.category) + "</select></label>",
        '<label class="offer-unit">Unidade<select>' + getUnitOptions(offer.unit) + "</select></label>",
        "</article>",
      ].join("");
    })
    .join("");
}

function analyzeOfferText() {
  offerCandidates = parseOfferText(elements.offerText.value);
  renderOfferCandidates();

  if (offerCandidates.length === 0) {
    showToast("Nao encontrei linhas com nome e preco. Revise o texto e tente novamente.");
    return;
  }

  showToast(offerCandidates.length + " oferta(s) encontrada(s). Revise antes de importar.");
}

function setOcrProgress(progress, label) {
  elements.ocrProgress.hidden = false;
  elements.ocrProgressFill.style.width = Math.round(Math.max(0, Math.min(progress, 1)) * 100) + "%";
  elements.ocrProgressLabel.textContent = label;
}

function hideOcrProgress() {
  elements.ocrProgress.hidden = true;
  elements.ocrProgressFill.style.width = "0";
}

function loadExternalScript(url) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureOcrReader() {
  if (window.Tesseract) {
    return true;
  }

  for (const url of OCR_SCRIPT_URLS) {
    try {
      await loadExternalScript(url);
      if (window.Tesseract) {
        return true;
      }
    } catch (error) {
      // Tenta o proximo servidor.
    }
  }

  return false;
}

async function prepareOfferImage(imageSource) {
  if (!(imageSource instanceof Blob)) {
    return imageSource;
  }

  const objectUrl = URL.createObjectURL(imageSource);

  try {
    const image = await new Promise(function (resolve, reject) {
      const nextImage = new Image();
      nextImage.onload = function () {
        resolve(nextImage);
      };
      nextImage.onerror = reject;
      nextImage.src = objectUrl;
    });

    if (image.naturalWidth >= 1600) {
      return imageSource;
    }

    const scale = Math.min(3, 1600 / Math.max(image.naturalWidth, 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise(function (resolve) {
      canvas.toBlob(
        function (blob) {
          resolve(blob || imageSource);
        },
        "image/png",
        1
      );
    });
  } catch (error) {
    return imageSource;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function recognizeOfferImage(imageSource) {
  elements.analyzeOffersButton.disabled = true;
  elements.readOfferUrlButton.disabled = true;
  setOcrProgress(0.04, "Carregando o leitor...");
  let worker = null;

  try {
    const readerLoaded = await ensureOcrReader();

    if (!readerLoaded) {
      throw new Error("OCR_UNAVAILABLE");
    }

    worker = await window.Tesseract.createWorker("por", 1, {
      logger: function (message) {
        if (typeof message.progress === "number") {
          const labels = {
            "loading tesseract core": "Carregando o leitor...",
            "initializing tesseract": "Preparando a leitura...",
            "loading language traineddata": "Carregando portugues...",
            "initializing api": "Iniciando reconhecimento...",
            "recognizing text": "Lendo o panfleto...",
          };
          setOcrProgress(message.progress, labels[message.status] || "Processando imagem...");
        }
      },
    });
    await worker.setParameters({
      tessedit_pageseg_mode: window.Tesseract.PSM ? window.Tesseract.PSM.SPARSE_TEXT : "11",
      preserve_interword_spaces: "1",
    });
    const preparedImage = await prepareOfferImage(imageSource);
    const result = await worker.recognize(preparedImage, {}, { text: true, tsv: true });
    elements.offerText.value = result.data.text.trim();
    setOcrProgress(1, "Leitura concluida");
    const layoutCandidates = parseOfferLayout(result.data.tsv);

    if (layoutCandidates.length >= 2) {
      offerCandidates = layoutCandidates;
      renderOfferCandidates();
      showToast(layoutCandidates.length + " oferta(s) separada(s) pelas colunas do panfleto.");
    } else {
      analyzeOfferText();
    }

    window.setTimeout(hideOcrProgress, 1200);
  } catch (error) {
    hideOcrProgress();
    if (error.message === "OCR_UNAVAILABLE") {
      showToast("O leitor de imagem nao carregou. Verifique a internet ou cole o texto do panfleto.");
    } else {
      showToast("Nao consegui ler essa imagem. Tente uma foto mais nitida ou cole o texto.");
    }
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (error) {
        // O leitor ja foi encerrado.
      }
    }
    elements.analyzeOffersButton.disabled = false;
    elements.readOfferUrlButton.disabled = false;
  }
}

function showOfferPreview(file) {
  if (offerPreviewUrl) {
    URL.revokeObjectURL(offerPreviewUrl);
  }

  offerPreviewUrl = URL.createObjectURL(file);
  elements.offerPreviewImage.src = offerPreviewUrl;
  elements.offerPreview.hidden = false;
}

async function isOfferImageFile(file) {
  if (file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name)) {
    return true;
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = function (signature) {
    return signature.every(function (byte, index) {
      return bytes[index] === byte;
    });
  };

  return (
    startsWith([0xff, 0xd8, 0xff]) ||
    startsWith([0x89, 0x50, 0x4e, 0x47]) ||
    startsWith([0x47, 0x49, 0x46, 0x38]) ||
    startsWith([0x42, 0x4d]) ||
    (startsWith([0x52, 0x49, 0x46, 0x46]) &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50)
  );
}

async function readOfferFile(file) {
  if (!file) {
    return;
  }

  if (await isOfferImageFile(file)) {
    elements.offerText.value = "";
    offerCandidates = [];
    renderOfferCandidates();
    showOfferPreview(file);
    await recognizeOfferImage(file);
    return;
  }

  if (/\.(txt|csv)$/i.test(file.name) || file.type === "text/csv" || file.type === "text/plain") {
    elements.offerPreview.hidden = true;
    elements.offerText.value = await file.text();
    analyzeOfferText();
    return;
  }

  showToast("Use uma imagem, arquivo TXT ou CSV.");
}

async function readOfferUrl() {
  const url = elements.offerUrl.value.trim();

  if (!/^https?:\/\//i.test(url)) {
    showToast("Cole um link completo com http ou https.");
    return;
  }

  elements.readOfferUrlButton.disabled = true;
  setOcrProgress(0.08, "Buscando o link...");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Falha ao buscar");
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/pdf")) {
      throw new Error("PDF_UNSUPPORTED");
    }

    if (contentType.startsWith("image/")) {
      const imageBlob = await response.blob();
      showOfferPreview(imageBlob);
      hideOcrProgress();
      await recognizeOfferImage(imageBlob);
      return;
    }

    const source = await response.text();
    const documentSource = new DOMParser().parseFromString(source, "text/html");
    documentSource.querySelectorAll("script, style, noscript, svg").forEach(function (node) {
      node.remove();
    });
    elements.offerText.value = (documentSource.body ? documentSource.body.innerText : source).trim();
    hideOcrProgress();
    analyzeOfferText();
  } catch (error) {
    hideOcrProgress();
    if (error.message === "PDF_UNSUPPORTED") {
      showToast("Para PDF, salve a pagina como imagem e envie pelo campo de arquivo.");
    } else {
      showToast("Esse site bloqueou a leitura. Baixe ou tire um print do panfleto e envie a imagem.");
    }
  } finally {
    elements.readOfferUrlButton.disabled = false;
  }
}

function readOfferRows() {
  const rows = Array.from(elements.offerResults.querySelectorAll("[data-offer-id]"));

  return rows
    .map(function (row) {
      return {
        selected: row.querySelector(".offer-selected").checked,
        name: row.querySelector(".offer-name").value.trim(),
        price: toNumber(row.querySelector(".offer-price input").value),
        category: row.querySelector(".offer-category select").value,
        unit: row.querySelector(".offer-unit select").value,
      };
    })
    .filter(function (offer) {
      return offer.selected && offer.name && offer.price > 0;
    });
}

function importSelectedOffers() {
  const offers = readOfferRows();
  const market = elements.offerMarket.value.trim() || "Mercado nao informado";

  if (offers.length === 0) {
    showToast("Selecione pelo menos uma oferta valida.");
    return;
  }

  offers.forEach(function (offer) {
    let product = state.products.find(function (entry) {
      return normalizeName(entry.name) === normalizeName(offer.name) && normalizeName(getProductMarket(entry)) === normalizeName(market);
    });

    if (product) {
      updateProductPrice(product, {
        name: offer.name,
        category: offer.category,
        unit: offer.unit,
        market: market,
        price: offer.price,
      });
    } else {
      product = {
        id: createId("prod"),
        name: offer.name,
        category: offer.category,
        unit: offer.unit,
        market: market,
        currentPrice: offer.price,
        previousPrice: null,
        history: [{ month: state.month, price: offer.price }],
      };
      state.products.push(product);
    }

    if (
      elements.addOffersToList.checked &&
      !state.listItems.some(function (item) {
        return item.productId === product.id;
      })
    ) {
      state.listItems.push({
        id: createId("item"),
        productId: product.id,
        quantity: 1,
      });
    }
  });

  saveState();
  renderAll();
  showToast(offers.length + " oferta(s) importada(s).");
  switchScreen(elements.addOffersToList.checked ? "listScreen" : "productsScreen");
}

function clearOfferImport() {
  offerCandidates = [];
  elements.offerUrl.value = "";
  elements.offerText.value = "";
  elements.offerImageInput.value = "";
  elements.offerPreview.hidden = true;
  hideOcrProgress();
  renderOfferCandidates();
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
  const remainingPercent = state.budget > 0 ? Math.max((remaining / state.budget) * 100, 0) : 0;
  const progressWidth = Math.min(usedPercent, 100);

  elements.totalSpent.textContent = formatMoney(totals.total);
  elements.totalSpentNote.textContent = percentFormatter.format(Math.max(usedPercent, 0)) + "% do saldo";
  elements.remainingBudget.textContent = formatMoney(remaining);
  elements.remainingBudgetNote.textContent = percentFormatter.format(remainingPercent) + "% do saldo";
  elements.itemCount.textContent = totals.rows;
  elements.itemCountNote.textContent = totals.rows === 1 ? "produto na lista" : "produtos na lista";
  elements.budgetProgress.style.width = progressWidth + "%";
  elements.budgetProgressCaption.textContent = percentFormatter.format(usedPercent) + "% do saldo utilizado";

  elements.budgetStatus.classList.remove("status-ok", "status-warning", "status-over");
  elements.budgetPill.classList.remove("status-ok", "status-warning", "status-over");

  if (remaining < 0) {
    elements.budgetStatus.innerHTML = '<span class="stat-icon status-visual">' + getIconSvg("x-circle") + '</span><span class="status-label">Situacao atual</span><strong>Acima do saldo</strong><small>Passou ' + formatMoney(Math.abs(remaining)) + '</small>';
    elements.budgetPill.textContent = "Acima do saldo";
    elements.budgetStatus.classList.add("status-over");
    elements.budgetPill.classList.add("status-over");
    elements.budgetProgress.style.background = "linear-gradient(90deg, #ff9aa4, var(--danger))";
  } else if (state.budget > 0 && remaining <= state.budget * 0.15) {
    elements.budgetStatus.innerHTML = '<span class="stat-icon status-visual">' + getIconSvg("alert-circle") + '</span><span class="status-label">Situacao atual</span><strong>Perto do limite</strong>';
    elements.budgetPill.textContent = "Perto do limite";
    elements.budgetStatus.classList.add("status-warning");
    elements.budgetPill.classList.add("status-warning");
    elements.budgetProgress.style.background = "linear-gradient(90deg, #ffe3a3, var(--warning))";
  } else {
    elements.budgetStatus.innerHTML = '<span class="stat-icon status-visual">' + getIconSvg("check-circle") + '</span><span class="status-label">Situacao atual</span><strong>Dentro do saldo</strong><small>Tudo certo!</small>';
    elements.budgetPill.textContent = "Dentro do saldo";
    elements.budgetStatus.classList.add("status-ok");
    elements.budgetPill.classList.add("status-ok");
    elements.budgetProgress.style.background = "linear-gradient(90deg, #6be1a4, #19c795)";
  }
}

const CATEGORY_ORDER = ["Mercearia", "Acougue", "Hortifruti", "Laticinios", "Bebidas", "Limpeza", "Outros"];

function getCategoryName(product) {
  return product && product.category ? product.category : "Outros";
}

function getCategoryRank(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function sortByCategoryThenName(a, b) {
  const categoryDiff = getCategoryRank(getCategoryName(a)) - getCategoryRank(getCategoryName(b));

  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  return a.name.localeCompare(b.name, "pt-BR");
}

function getCategoryInitial(category) {
  return (category || "Outros").slice(0, 1).toUpperCase();
}

function getCategoryKey(category) {
  return normalizeName(category || "Outros");
}

function getCategoryDomId(category) {
  const safeCategory = getCategoryKey(category)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return "category-items-" + (safeCategory || "outros");
}

function getGroupedProducts(products) {
  return products
    .slice()
    .sort(sortByCategoryThenName)
    .reduce(function (groups, product) {
      const category = getCategoryName(product);
      let group = groups.find(function (entry) {
        return entry.category === category;
      });

      if (!group) {
        group = {
          category: category,
          products: [],
        };
        groups.push(group);
      }

      group.products.push(product);
      return groups;
    }, []);
}

function renderProductOptions() {
  const selected = elements.productSelect.value;
  const groups = getGroupedProducts(state.products);

  elements.productSelect.innerHTML = groups
    .map(function (group) {
      return (
        '<optgroup label="' +
        escapeHtml(group.category) +
        '">' +
        group.products
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
          .join("") +
        "</optgroup>"
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

  const groups = state.listItems.reduce(function (acc, item) {
    const product = state.products.find(function (entry) {
      return entry.id === item.productId;
    });

    if (!product) {
      return acc;
    }

    const category = getCategoryName(product);
    let group = acc.find(function (entry) {
      return entry.category === category;
    });

    if (!group) {
      group = {
        category: category,
        rows: [],
        total: 0,
      };
      acc.push(group);
    }

    const total = product.currentPrice * item.quantity;
    group.rows.push({
      item: item,
      product: product,
      total: total,
    });
    group.total += total;

    return acc;
  }, []);

  groups.sort(function (a, b) {
    return getCategoryRank(a.category) - getCategoryRank(b.category) || a.category.localeCompare(b.category, "pt-BR");
  });

  elements.shoppingList.innerHTML = groups
    .map(function (group) {
      group.rows.sort(function (a, b) {
        return a.product.name.localeCompare(b.product.name, "pt-BR");
      });

      const itemText = group.rows.length === 1 ? "1 item" : group.rows.length + " itens";
      const categoryKey = getCategoryKey(group.category);
      const categoryItemsId = getCategoryDomId(group.category);
      const isExpanded = expandedCategories.has(categoryKey);

      return [
        '<section class="category-group ' + (isExpanded ? "is-open" : "is-collapsed") + '" data-category="' + escapeHtml(categoryKey) + '">',
        '<header class="category-heading">',
        '<button class="category-toggle" type="button" data-action="toggle-category" data-category="' +
          escapeHtml(categoryKey) +
          '" aria-expanded="' +
          (isExpanded ? "true" : "false") +
          '" aria-controls="' +
          escapeHtml(categoryItemsId) +
          '">',
        '<span class="category-title">',
        '<span class="category-mark" aria-hidden="true">' + escapeHtml(getCategoryInitial(group.category)) + "</span>",
        '<span class="category-title-text">',
        "<strong>" + escapeHtml(group.category) + "</strong>",
        "<small>" + itemText + " na lista</small>",
        "</span>",
        "</span>",
        '<span class="category-action">',
        '<span class="category-action-text">' + (isExpanded ? "Ocultar itens" : "Ver itens") + "</span>",
        '<span class="category-toggle-state" aria-hidden="true">' + (isExpanded ? "-" : "+") + "</span>",
        "</span>",
        "</button>",
        '<span class="category-total">' + formatMoney(group.total) + "</span>",
        "</header>",
        '<div class="category-items" id="' + escapeHtml(categoryItemsId) + '"' + (isExpanded ? "" : " hidden") + ">",
        group.rows
          .map(function (row) {
            const item = row.item;
            const product = row.product;
            const total = row.total;
            const safeName = escapeHtml(product.name);

            return [
              '<article class="list-row" data-item-id="' + escapeHtml(item.id) + '">',
              "<div>",
              '<p class="product-name">' + safeName + "</p>",
              '<p class="product-meta">' + formatMoney(product.currentPrice) + " por " + escapeHtml(product.unit) + " - " + escapeHtml(getProductMarket(product)) + "</p>",
              "</div>",
              '<input class="qty-input" type="number" min="1" step="1" value="' +
                toWholeQuantity(item.quantity) +
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
          .join(""),
        "</div>",
        "</section>",
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

  if (elements.summaryTitle) {
    elements.summaryTitle.textContent = "Resumo de " + monthLabel;
  }

  elements.summaryHighlights.innerHTML = [
    '<article class="insight-card">',
    '<span class="insight-icon">' + getIconSvg("calendar") + '</span>',
    '<span class="insight-label">Mes selecionado</span>',
    '<strong>' + escapeHtml(monthLabel) + '</strong>',
    '<p class="insight-meta">Baseado no calendario acima</p>',
    '</article>',
    '<article class="insight-card">',
    '<span class="insight-icon">' + getIconSvg("percent") + '</span>',
    '<span class="insight-label">Uso do saldo</span>',
    '<strong>' + percentFormatter.format(usedPercent) + '%</strong>',
    '<p class="insight-meta">' + formatMoney(totals.total) + ' de ' + formatMoney(state.budget) + '</p>',
    '</article>',
    '<article class="insight-card insight-up">',
    '<span class="insight-icon">' + getIconSvg("trend-up") + '</span>',
    '<span class="insight-label">Maior alta no mes</span>',
    '<strong>' + escapeHtml(biggestUp ? biggestUp.product.name : 'Sem alta') + '</strong>',
    '<p class="insight-meta">' + escapeHtml(biggestUp ? biggestUp.trend.label : 'Nenhum produto subiu ate esse mes') + '</p>',
    '</article>',
    '<article class="insight-card insight-down">',
    '<span class="insight-icon">' + getIconSvg("trend-down") + '</span>',
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
  const amount = toWholeQuantity(quantity);
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
    existing.quantity = toWholeQuantity(existing.quantity + amount);
  } else {
    state.listItems.push({
      id: createId("item"),
      productId: productId,
      quantity: amount,
    });
  }

  expandedCategories.add(getCategoryKey(getCategoryName(product)));
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

if (elements.analyzeOffersButton) {
  elements.analyzeOffersButton.addEventListener("click", analyzeOfferText);
  elements.readOfferUrlButton.addEventListener("click", readOfferUrl);
  elements.importOffersButton.addEventListener("click", importSelectedOffers);
  elements.clearOffersButton.addEventListener("click", clearOfferImport);
  elements.offerImageInput.addEventListener("change", function () {
    readOfferFile(elements.offerImageInput.files[0]);
  });
}

elements.addToListForm.addEventListener("submit", function (event) {
  event.preventDefault();
  addProductToList(elements.productSelect.value, toWholeQuantity(elements.itemQuantity.value));
  elements.itemQuantity.value = 1;
});

elements.clearListButton.addEventListener("click", function () {
  state.listItems = [];
  expandedCategories.clear();
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

  item.quantity = toWholeQuantity(event.target.value);
  event.target.value = item.quantity;
  const product = state.products.find(function (entry) {
    return entry.id === item.productId;
  });

  if (product) {
    row.querySelector(".price-text").textContent = formatMoney(product.currentPrice * item.quantity);
  }

  const categoryGroup = row.closest(".category-group");

  if (categoryGroup) {
    const categoryTotal = state.listItems.reduce(function (sum, listItem) {
      const listProduct = state.products.find(function (entry) {
        return entry.id === listItem.productId;
      });

      if (!listProduct || getCategoryKey(getCategoryName(listProduct)) !== categoryGroup.dataset.category) {
        return sum;
      }

      return sum + listProduct.currentPrice * listItem.quantity;
    }, 0);

    categoryGroup.querySelector(".category-total").textContent = formatMoney(categoryTotal);
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

  if (button.dataset.action === "toggle-category") {
    const category = button.dataset.category;

    if (expandedCategories.has(category)) {
      expandedCategories.delete(category);
    } else {
      expandedCategories.add(category);
    }

    renderShoppingList();
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

if (elements.quickAddButton) {
  elements.quickAddButton.addEventListener("click", function () {
    switchScreen("listScreen");
  });
}

elements.tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    switchScreen(button.dataset.screenTarget);
  });
});

syncTopInputs();
renderStaticIcons();
startFooterTypewriter();
renderAll();
switchScreen("summaryScreen");

