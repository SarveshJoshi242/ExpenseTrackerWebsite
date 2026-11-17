/**
 * Aftermath • Interactive Web Platform & Live MVPs
 * Powering real-time expense calculations, regex SMS parsing, Khata, and Budgeting.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTabNavigation();
  initExpenseSimulator();
  initSmsParser();
  initKhataManager();
  initBudgetCalculator();
});

// ===================================================================
// Mobile Navigation Menu Toggle
// ===================================================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    drawer.classList.toggle('open');
  });

  // Close drawer on clicking any navigation link
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      drawer.classList.remove('open');
    });
  });

  // Close when tapping outside the navbar
  document.addEventListener('click', (e) => {
    const header = document.querySelector('.navbar');
    if (header && !header.contains(e.target)) {
      menuBtn.classList.remove('active');
      drawer.classList.remove('open');
    }
  });
}

// ===================================================================
// Tab Navigation
// ===================================================================
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.mvp-tab-btn');
  const tabContents = document.querySelectorAll('.mvp-tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// ===================================================================
// Currency Helpers
// ===================================================================
function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

// ===================================================================
// MVP 1: Live Expense & Budget Simulator
// ===================================================================
let ledgerData = [
  { id: 1, title: 'Monthly Salary', amount: 45000, type: 'credit', category: 'Income', pm: 'Bank Transfer', date: 'Today, 09:30 AM', icon: '💼' },
  { id: 2, title: 'House Rent', amount: 14000, type: 'debit', category: 'Housing', pm: 'UPI', date: 'Yesterday', icon: '🏠' },
  { id: 3, title: 'Kirana & Supermarket', amount: 2450, type: 'debit', category: 'Groceries', pm: 'UPI', date: 'Nov 15', icon: '🥦' },
  { id: 4, title: 'Electricity & WiFi', amount: 1850, type: 'debit', category: 'Utilities', pm: 'Credit Card', date: 'Nov 14', icon: '⚡' },
];

function initExpenseSimulator() {
  renderLedger();

  // Quick spend chips
  const spendChips = document.querySelectorAll('.spend-chip');
  spendChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const title = chip.getAttribute('data-title');
      const amount = parseFloat(chip.getAttribute('data-amount'));
      const type = chip.getAttribute('data-type') || 'debit';
      const category = chip.getAttribute('data-cat') || 'Daily Spends';
      const icon = chip.getAttribute('data-icon') || '💸';

      addSimTransaction(title, amount, type, category, 'UPI', icon);
    });
  });

  // Custom entry form
  const customForm = document.getElementById('sim-custom-form');
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('sim-input-title');
      const amountInput = document.getElementById('sim-input-amount');
      const typeSelect = document.getElementById('sim-input-type');
      const catSelect = document.getElementById('sim-input-cat');

      const title = titleInput.value.trim();
      const amount = parseFloat(amountInput.value);
      const type = typeSelect.value;
      const category = catSelect.value;

      if (!title || isNaN(amount) || amount <= 0) return;

      const icon = type === 'credit' ? '💰' : '💳';
      addSimTransaction(title, amount, type, category, 'UPI', icon);

      titleInput.value = '';
      amountInput.value = '';
      titleInput.focus();
    });
  }
}

function addSimTransaction(title, amount, type, category, pm = 'UPI', icon = '💸') {
  const newTx = {
    id: Date.now(),
    title,
    amount,
    type,
    category,
    pm,
    date: 'Just now',
    icon,
  };

  ledgerData.unshift(newTx);
  renderLedger();
  showFlashToast(`Logged ${type === 'credit' ? '+' : '-'}${formatINR(amount)} for ${title}`);
}

function renderLedger() {
  const ledgerList = document.getElementById('sim-ledger-list');
  const hudBalance = document.getElementById('sim-hud-balance');
  const hudIncome = document.getElementById('sim-hud-income');
  const hudExpense = document.getElementById('sim-hud-expense');
  const phoneBalance = document.getElementById('phone-card-balance');

  let totalIncome = 0;
  let totalExpense = 0;

  ledgerData.forEach((tx) => {
    if (tx.type === 'credit') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  });

  const totalBalance = totalIncome - totalExpense;

  if (hudBalance) hudBalance.textContent = formatINR(totalBalance);
  if (hudIncome) hudIncome.textContent = formatINR(totalIncome);
  if (hudExpense) hudExpense.textContent = formatINR(totalExpense);
  if (phoneBalance) phoneBalance.textContent = formatINR(totalBalance);

  if (ledgerList) {
    ledgerList.innerHTML = '';
    ledgerData.forEach((tx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'sim-item';
      itemEl.innerHTML = `
        <div class="sim-item-left">
          <div class="sim-item-icon" style="background: ${tx.type === 'credit' ? '#ecfdf5' : '#fef2f2'};">
            ${tx.icon}
          </div>
          <div class="sim-item-details">
            <span class="sim-item-name">${escapeHtml(tx.title)}</span>
            <span class="sim-item-meta">${escapeHtml(tx.category)} • ${tx.pm} • ${tx.date}</span>
          </div>
        </div>
        <div class="sim-item-right">
          <span class="sim-item-amount ${tx.type}">${tx.type === 'credit' ? '+' : '-'}${formatINR(tx.amount)}</span>
          <button class="sim-item-del" onclick="deleteSimTransaction(${tx.id})" title="Delete">✕</button>
        </div>
      `;
      ledgerList.appendChild(itemEl);
    });
  }
}

window.deleteSimTransaction = function (id) {
  ledgerData = ledgerData.filter((t) => t.id !== id);
  renderLedger();
};

// ===================================================================
// MVP 2: Indian Bank SMS & UPI Parser Engine
// ===================================================================
const SMS_PRESETS = {
  hdfc: `HDFC Bank: Rs 840.00 debited from a/c **9124 on 17-11-26 to VPA swiggy@icici (UPI Ref 432190821). Bal Rs 38,420.00.`,
  sbi: `Dear SBI User, your A/C ending 4501 has been credited by Rs. 25,000.00 on 17Nov26 by UPI/TRANSFER from ACME CORP. Avl Bal Rs 54,200.00.`,
  icici: `ICICI Bank: Acct XX889 debited with INR 2,499.00 on 17-Nov-26. Info: Amazon Retail India. Available Balance: INR 12,300.00.`,
  axis: `Axis Bank: Alert! Rs. 350.00 spent on your Debit Card ending 3302 at STARBUCKS COFFEE on 17-Nov-2026. Avail Limit: Rs 48,150.`,
  paytm: `Paytm UPI: Rs 45.00 paid to Chai Point from Bank A/C XX4120 on 17 Nov, 11:20 AM. UPI Ref: 48921094.`,
};

function initSmsParser() {
  const textarea = document.getElementById('sms-input-text');
  const presetBtns = document.querySelectorAll('.sms-preset-btn');
  const parseBtn = document.getElementById('btn-parse-sms');
  const saveBtn = document.getElementById('btn-save-parsed-tx');

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-preset');
      if (SMS_PRESETS[key] && textarea) {
        textarea.value = SMS_PRESETS[key];
        runParseEngine();
      }
    });
  });

  if (parseBtn) {
    parseBtn.addEventListener('click', () => {
      runParseEngine();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (lastParsedResult && lastParsedResult.amount > 0) {
        addSimTransaction(
          lastParsedResult.merchant,
          lastParsedResult.amount,
          lastParsedResult.type,
          lastParsedResult.category,
          'Bank SMS',
          lastParsedResult.type === 'credit' ? '📥' : '💳'
        );
        showFlashToast(`Parsed SMS saved to Aftermath Ledger!`);
      }
    });
  }

  // Run initial parse on load
  if (textarea && textarea.value) {
    runParseEngine();
  }
}

let lastParsedResult = null;

function runParseEngine() {
  const textarea = document.getElementById('sms-input-text');
  if (!textarea) return;

  const rawText = textarea.value.trim();
  if (!rawText) return;

  const parsed = parseIndianBankSms(rawText);
  lastParsedResult = parsed;

  const resType = document.getElementById('parser-res-type');
  const resAmount = document.getElementById('parser-res-amount');
  const resMerchant = document.getElementById('parser-res-merchant');
  const resCategory = document.getElementById('parser-res-category');
  const resAccount = document.getElementById('parser-res-account');
  const resConfidence = document.getElementById('parser-res-confidence');

  if (resType) {
    resType.textContent = parsed.type.toUpperCase();
    resType.className = `parser-pill ${parsed.type === 'credit' ? 'badge-emerald' : 'badge-indigo'}`;
  }
  if (resAmount) resAmount.textContent = formatINR(parsed.amount);
  if (resMerchant) resMerchant.textContent = parsed.merchant;
  if (resCategory) resCategory.textContent = parsed.category;
  if (resAccount) resAccount.textContent = parsed.account ? `A/C **${parsed.account}` : 'General A/C';
  if (resConfidence) resConfidence.textContent = `${parsed.confidence}% (Native Regex)`;
}

/**
 * Robust Regex Engine for Indian Bank SMS (HDFC, SBI, ICICI, Axis, PNB, Kotak, UPI)
 */
function parseIndianBankSms(sms) {
  let text = sms.replace(/,/g, '');
  let type = 'debit';
  let amount = 0;
  let merchant = 'General Payment';
  let category = 'Other Spends';
  let account = '';
  let confidence = 98;

  // 1. Detect Type
  if (/credit(ed)?|received|refund|deposited/i.test(text)) {
    type = 'credit';
  } else if (/debit(ed)?|spent|withdrawn|paid|sent/i.test(text)) {
    type = 'debit';
  }

  // 2. Extract Amount (Rs., INR, ₹)
  const amtMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d]+(?:\.[\d]{1,2})?)/i);
  if (amtMatch && amtMatch[1]) {
    amount = parseFloat(amtMatch[1]);
  }

  // 3. Extract Account digits
  const accMatch = text.match(/(?:a\/c|acct|ending|card)\s*(?:no\.?)?\s*[*xX]*([\d]{3,4})/i);
  if (accMatch && accMatch[1]) {
    account = accMatch[1];
  }

  // 4. Extract Merchant / VPA
  const vpaMatch = text.match(/(?:to|at|vpa|info:)\s+([a-zA-Z0-9._\s&-]+?)(?:\s+(?:on|via|ref|bal|available|\.))/i);
  if (vpaMatch && vpaMatch[1]) {
    merchant = vpaMatch[1].trim().replace(/^VPA\s+/i, '');
  }

  // Clean merchant length
  if (merchant.length > 28) {
    merchant = merchant.substring(0, 28) + '...';
  }

  // 5. Intelligent Category Assignment
  const lowerMerchant = merchant.toLowerCase();
  const lowerSms = text.toLowerCase();

  if (/swiggy|zomato|starbucks|mcdonald|food|dining|chai|cafe/i.test(lowerMerchant + lowerSms)) {
    category = 'Food & Dining';
  } else if (/uber|ola|auto|petrol|fuel|indian\s*oil|metro/i.test(lowerMerchant + lowerSms)) {
    category = 'Transport & Fuel';
  } else if (/amazon|flipkart|myntra|retail|shopping/i.test(lowerMerchant + lowerSms)) {
    category = 'Shopping';
  } else if (/kirana|grocer|blinkit|zepto|dmart|bigbasket/i.test(lowerMerchant + lowerSms)) {
    category = 'Groceries & Kirana';
  } else if (/salary|corp|payroll|transfer/i.test(lowerMerchant + lowerSms)) {
    category = 'Income / Salary';
  } else if (/recharge|jio|airtel|vi|wifi|bescom/i.test(lowerMerchant + lowerSms)) {
    category = 'Utilities & Bills';
  }

  return {
    type,
    amount: amount || 100,
    merchant: merchant || (type === 'credit' ? 'Direct Credit' : 'Store Merchant'),
    category,
    account: account || '9124',
    confidence,
  };
}

// ===================================================================
// MVP 3: Bharat Khata (Udhar & Staff Ledger)
// ===================================================================
let khataRecords = [
  { id: 1, name: 'Ramesh Kirana', type: 'give', amount: 1200, note: 'Monthly groceries pending' },
  { id: 2, name: 'Amit Sharma', type: 'get', amount: 450, note: 'Dinner split via UPI' },
  { id: 3, name: 'Sunita (Cook)', type: 'give', amount: 3500, note: 'Monthly domestic staff salary' },
];

function initKhataManager() {
  renderKhataList();

  const addForm = document.getElementById('khata-add-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('khata-name');
      const amountInput = document.getElementById('khata-amount');
      const typeSelect = document.getElementById('khata-type');

      const name = nameInput.value.trim();
      const amount = parseFloat(amountInput.value);
      const type = typeSelect.value;

      if (!name || isNaN(amount) || amount <= 0) return;

      khataRecords.push({
        id: Date.now(),
        name,
        type,
        amount,
        note: 'Directly added from Khata book',
      });

      nameInput.value = '';
      amountInput.value = '';
      renderKhataList();
      showFlashToast(`Khata entry saved for ${name}`);
    });
  }
}

function renderKhataList() {
  const container = document.getElementById('khata-items-container');
  const getEl = document.getElementById('khata-total-get');
  const giveEl = document.getElementById('khata-total-give');

  let totalGet = 0;
  let totalGive = 0;

  khataRecords.forEach((k) => {
    if (k.type === 'get') totalGet += k.amount;
    else totalGive += k.amount;
  });

  if (getEl) getEl.textContent = formatINR(totalGet);
  if (giveEl) giveEl.textContent = formatINR(totalGive);

  if (container) {
    container.innerHTML = '';
    khataRecords.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'khata-item';
      el.innerHTML = `
        <div>
          <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHtml(item.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.note)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-mono); font-weight: 800; color: ${item.type === 'get' ? '#059669' : '#ef4444'};">
            ${item.type === 'get' ? 'You Will Receive: ' : 'You Need to Pay: '}${formatINR(item.amount)}
          </div>
          <button class="btn btn-sm btn-outline" style="margin-top: 4px; padding: 2px 8px; font-size: 0.75rem;" onclick="generateKhataReminder('${escapeHtml(item.name)}', ${item.amount}, '${item.type}')">
            📲 WhatsApp Reminder
          </button>
        </div>
      `;
      container.appendChild(el);
    });
  }
}

window.generateKhataReminder = function (name, amount, type) {
  const previewBox = document.getElementById('whatsapp-preview-msg');
  if (previewBox) {
    const text = type === 'get'
      ? `Namaste ${name}, gentle reminder from Aftermath regarding our pending payment balance of ${formatINR(amount)}. You can pay directly via UPI.`
      : `Namaste ${name}, confirming that your payment of ${formatINR(amount)} is recorded in Aftermath and will be settled shortly.`;
    previewBox.textContent = text;
    showFlashToast(`WhatsApp reminder preview generated for ${name}!`);
  }
};

// ===================================================================
// MVP 4: 50/30/20 Budget & Daily Safe-Spend Calculator
// ===================================================================
function initBudgetCalculator() {
  const slider = document.getElementById('budget-income-slider');
  const display = document.getElementById('budget-income-display');

  if (!slider) return;

  function update() {
    const income = parseFloat(slider.value);
    if (display) display.textContent = formatINR(income);

    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;
    const dailySafeSpend = Math.round(wants / 30);

    const elNeeds = document.getElementById('calc-val-needs');
    const elWants = document.getElementById('calc-val-wants');
    const elSavings = document.getElementById('calc-val-savings');
    const elDaily = document.getElementById('calc-val-daily');

    if (elNeeds) elNeeds.textContent = formatINR(needs);
    if (elWants) elWants.textContent = formatINR(wants);
    if (elSavings) elSavings.textContent = formatINR(savings);
    if (elDaily) elDaily.textContent = `${formatINR(dailySafeSpend)} / day`;
  }

  slider.addEventListener('input', update);
  update();
}

// ===================================================================
// Micro Utilities
// ===================================================================
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showFlashToast(msg) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#0f172a';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 2800);
}
