/**
 * Aftermath Web Platform — Clean Interactive Demo & Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initDemoTabs();
  initExpenseSimulator();
  initSmsParser();
  initBudgetCalculator();
});

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  if (!btn || !drawer) return;

  const setOpen = (isOpen) => {
    drawer.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    if (iconOpen) iconOpen.style.display = isOpen ? 'none' : 'block';
    if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!drawer.classList.contains('open'));
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('click', (e) => {
    const header = document.querySelector('.navbar');
    if (header && !header.contains(e.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

function initDemoTabs() {
  const tabs = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });
}

function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + Math.abs(num).toLocaleString('en-IN');
}

function formatSignedINR(val) {
  const num = Number(val) || 0;
  return `${num < 0 ? '-' : ''}₹${Math.abs(num).toLocaleString('en-IN')}`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimer = null;
function showToast(msg) {
  let el = document.getElementById('site-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'site-toast';
    el.className = 'site-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ===================================================================
   1. Expense Ledger Simulator
   =================================================================== */
let ledgerData = [
  { id: 1, title: 'Monthly Salary', amount: 45000, type: 'credit', category: 'Income', pm: 'Bank Transfer', date: 'Today' },
  { id: 2, title: 'House Rent', amount: 14000, type: 'debit', category: 'Housing', pm: 'UPI', date: 'Yesterday' },
  { id: 3, title: 'Kirana & Groceries', amount: 2450, type: 'debit', category: 'Groceries', pm: 'UPI', date: 'Nov 15' },
  { id: 4, title: 'Electricity & WiFi', amount: 1850, type: 'debit', category: 'Utilities', pm: 'Card', date: 'Nov 14' },
];

function initExpenseSimulator() {
  renderLedger();

  document.querySelectorAll('.spend-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const title = chip.getAttribute('data-title');
      const amount = parseFloat(chip.getAttribute('data-amount'));
      const type = chip.getAttribute('data-type') || 'debit';
      const category = chip.getAttribute('data-cat') || 'General';
      addSimTransaction(title, amount, type, category, 'UPI');
    });
  });

  const form = document.getElementById('sim-custom-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleEl = document.getElementById('sim-input-title');
      const amountEl = document.getElementById('sim-input-amount');
      const typeEl = document.getElementById('sim-input-type');

      const title = titleEl.value.trim();
      const amount = parseFloat(amountEl.value);
      const type = typeEl.value;

      if (!title || isNaN(amount) || amount <= 0) return;

      addSimTransaction(title, amount, type, type === 'credit' ? 'Income' : 'General', 'UPI');
      titleEl.value = '';
      amountEl.value = '';
    });
  }
}

function addSimTransaction(title, amount, type, category, pm = 'UPI') {
  ledgerData.unshift({
    id: Date.now(),
    title,
    amount,
    type,
    category,
    pm,
    date: 'Just now',
  });
  renderLedger();
  showToast(`Logged ${type === 'credit' ? '+' : '-'}${formatINR(amount)} (${title})`);
}

function renderLedger() {
  const listEl = document.getElementById('sim-ledger-list');
  const countEl = document.getElementById('sim-ledger-count');
  const hudBal = document.getElementById('sim-hud-balance');
  const hudIn = document.getElementById('sim-hud-income');
  const hudOut = document.getElementById('sim-hud-expense');
  const phoneBal = document.getElementById('phone-card-balance');
  const phoneIn = document.getElementById('phone-card-income');
  const phoneOut = document.getElementById('phone-card-expense');

  let totalIn = 0;
  let totalOut = 0;
  ledgerData.forEach((tx) => {
    if (tx.type === 'credit') totalIn += tx.amount;
    else totalOut += tx.amount;
  });
  const net = totalIn - totalOut;

  if (hudBal) hudBal.textContent = formatSignedINR(net);
  if (hudIn) hudIn.textContent = formatINR(totalIn);
  if (hudOut) hudOut.textContent = formatINR(totalOut);
  if (phoneBal) phoneBal.textContent = formatSignedINR(net);
  if (phoneIn) phoneIn.textContent = formatINR(totalIn);
  if (phoneOut) phoneOut.textContent = formatINR(totalOut);
  if (countEl) countEl.textContent = `${ledgerData.length} ${ledgerData.length === 1 ? 'entry' : 'entries'}`;

  if (!listEl) return;
  listEl.innerHTML = '';
  ledgerData.forEach((tx) => {
    const row = document.createElement('div');
    row.className = 'ledger-row';
    row.innerHTML = `
      <div class="ledger-row-main">
        <div class="ledger-row-title">${escapeHtml(tx.title)}</div>
        <div class="ledger-row-meta">${escapeHtml(tx.category)} &middot; ${escapeHtml(tx.pm)} &middot; ${escapeHtml(tx.date)}</div>
      </div>
      <div class="ledger-row-right">
        <span class="preview-tx-amt ${tx.type === 'credit' ? 'in' : 'out'} mono">${tx.type === 'credit' ? '+' : '-'}${formatINR(tx.amount)}</span>
        <button class="ledger-del" type="button" aria-label="Remove entry" onclick="deleteSimTransaction(${tx.id})">&times;</button>
      </div>
    `;
    listEl.appendChild(row);
  });
}

window.deleteSimTransaction = function (id) {
  ledgerData = ledgerData.filter((t) => t.id !== id);
  renderLedger();
};

/* ===================================================================
   2. Bank SMS & UPI Parser (with On-Device OTP Firewall)
   =================================================================== */
const SMS_PRESETS = {
  hdfc: 'HDFC Bank: Rs 840.00 debited from a/c **9124 on 18-11-26 to VPA swiggy@icici (UPI Ref 432190821). Bal Rs 38,420.00.',
  sbi: 'Dear SBI User, your A/C ending 4501 has been credited by Rs. 25,000.00 on 18Nov26 by UPI/TRANSFER from ACME CORP. Avl Bal Rs 54,200.00.',
  icici: 'ICICI Bank: Acct XX889 debited with INR 2,499.00 on 18-Nov-26. Info: Amazon Retail India. Available Balance: INR 12,300.00.',
  axis: 'Axis Bank: Alert! Rs. 350.00 spent on your Debit Card ending 3302 at STARBUCKS COFFEE on 18-Nov-2026. Avail Limit: Rs 48,150.',
  otp: 'Your HDFC Bank OTP for transaction of Rs. 2,500 is 482910. Do not share this one-time password with anyone.',
};

let lastParsed = null;

function initSmsParser() {
  const textarea = document.getElementById('sms-input-text');
  const presets = document.querySelectorAll('.sms-preset-btn');
  const parseBtn = document.getElementById('btn-parse-sms');
  const saveBtn = document.getElementById('btn-save-parsed-tx');

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      presets.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-preset');
      if (SMS_PRESETS[key] && textarea) {
        textarea.value = SMS_PRESETS[key];
        runSmsParse();
      }
    });
  });

  if (parseBtn) parseBtn.addEventListener('click', runSmsParse);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!lastParsed || lastParsed.blockedOtp || !lastParsed.amount) {
        showToast('No valid financial transaction to save.');
        return;
      }
      addSimTransaction(
        lastParsed.merchant,
        lastParsed.amount,
        lastParsed.type,
        lastParsed.category,
        'Bank Alert'
      );
    });
  }

  if (textarea && textarea.value) runSmsParse();
}

function runSmsParse() {
  const textarea = document.getElementById('sms-input-text');
  if (!textarea) return;
  const raw = textarea.value.trim();
  if (!raw) return;

  const parsed = parseBankSms(raw);
  lastParsed = parsed;

  const typeEl = document.getElementById('parser-res-type');
  const amountEl = document.getElementById('parser-res-amount');
  const merchantEl = document.getElementById('parser-res-merchant');
  const catEl = document.getElementById('parser-res-category');
  const accEl = document.getElementById('parser-res-account');
  const statusEl = document.getElementById('parser-res-status');

  if (parsed.blockedOtp) {
    if (typeEl) {
      typeEl.textContent = 'OTP IGNORED';
      typeEl.className = 'parse-tag credit';
    }
    if (amountEl) amountEl.textContent = '—';
    if (merchantEl) merchantEl.textContent = 'Blocked by OTP Firewall';
    if (catEl) catEl.textContent = 'Not Stored';
    if (accEl) accEl.textContent = '—';
    if (statusEl) statusEl.textContent = 'OTP discarded safely';
    return;
  }

  if (typeEl) {
    typeEl.textContent = parsed.type.toUpperCase();
    typeEl.className = `parse-tag ${parsed.type === 'credit' ? 'credit' : 'debit'}`;
  }
  if (amountEl) amountEl.textContent = formatINR(parsed.amount);
  if (merchantEl) merchantEl.textContent = parsed.merchant;
  if (catEl) catEl.textContent = parsed.category;
  if (accEl) accEl.textContent = parsed.account ? `A/C **${parsed.account}` : 'General A/C';
  if (statusEl) statusEl.textContent = 'OTP Firewall Active';
}

function parseBankSms(sms) {
  const lower = sms.toLowerCase();
  const otpKeywords = ['otp', 'one-time password', 'one time password', 'verification code', 'mpin', 'cvv', 'do not share'];
  if (otpKeywords.some((kw) => lower.includes(kw))) {
    return { blockedOtp: true };
  }

  const text = sms.replace(/,/g, '');
  let type = 'debit';
  if (/credit(ed)?|received|refund|deposited/i.test(text)) type = 'credit';

  let amount = 0;
  const amtMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d]+(?:\.[\d]{1,2})?)/i);
  if (amtMatch && amtMatch[1]) amount = parseFloat(amtMatch[1]);

  let account = '';
  const accMatch = text.match(/(?:a\/c|acct|ending|card)\s*(?:no\.?)?\s*[*xX]*([\d]{3,4})/i);
  if (accMatch && accMatch[1]) account = accMatch[1];

  let merchant = type === 'credit' ? 'Direct Credit' : 'Bank Transaction';
  const vpaMatch = text.match(/(?:to|at|vpa|info:|from)\s+([a-zA-Z0-9._\s&-]+?)(?:\s+(?:on|via|ref|bal|available|\(|\.)|$)/i);
  if (vpaMatch && vpaMatch[1]) {
    merchant = vpaMatch[1].trim().replace(/^VPA\s+/i, '');
  }
  if (merchant.length > 26) merchant = merchant.slice(0, 26) + '...';

  const combined = (merchant + ' ' + lower).toLowerCase();
  let category = type === 'credit' ? 'Income' : 'Other Spends';
  if (/swiggy|zomato|starbucks|chai|cafe|food|dining/i.test(combined)) category = 'Food & Dining';
  else if (/uber|ola|auto|petrol|fuel|metro/i.test(combined)) category = 'Transport & Fuel';
  else if (/amazon|flipkart|myntra|retail|shopping/i.test(combined)) category = 'Shopping';
  else if (/kirana|blinkit|zepto|dmart|grocer/i.test(combined)) category = 'Groceries';
  else if (/salary|corp|payroll/i.test(combined)) category = 'Salary / Income';
  else if (/jio|airtel|wifi|electricity|bill/i.test(combined)) category = 'Bills & Utilities';

  return { blockedOtp: false, type, amount: amount || 0, merchant, category, account };
}

/* ===================================================================
   3. 50/30/20 Safe-Spend Calculator
   =================================================================== */
function initBudgetCalculator() {
  const slider = document.getElementById('budget-income-slider');
  if (!slider) return;

  const update = () => {
    const income = parseFloat(slider.value) || 0;
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;
    const daily = Math.round(wants / 30);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('budget-income-display', formatINR(income));
    set('calc-val-needs', formatINR(needs));
    set('calc-val-wants', formatINR(wants));
    set('calc-val-savings', formatINR(savings));
    set('calc-val-daily', `${formatINR(daily)} / day`);
  };

  slider.addEventListener('input', update);
  update();
}
