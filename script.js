/* =========================================================
   EMI Smart — Executive Engine (Up to ₹10 Cr & Part 4 Controls)
   ========================================================= */

(function () {
  'use strict';

  // ---------- Main Calculator Elements ----------
  const amountInput = document.getElementById('amount');
  const tenureInput = document.getElementById('tenure');
  const rateInput = document.getElementById('rate');

  const amountText = document.getElementById('amount-text');
  const tenureText = document.getElementById('tenure-text');
  const rateText = document.getElementById('rate-text');

  const emiValue = document.getElementById('emi-value');
  const principalValue = document.getElementById('principal-value');
  const interestValue = document.getElementById('interest-value');
  const totalValue = document.getElementById('total-value');

  const bbPrincipal = document.getElementById('bb-principal');
  const bbInterest = document.getElementById('bb-interest');
  const legPPct = document.getElementById('leg-p-pct');
  const legIPct = document.getElementById('leg-i-pct');

  const donutPrincipal = document.getElementById('donut-principal');
  const donutInterest = document.getElementById('donut-interest');
  const donutPrincipalPct = document.getElementById('donut-principal-pct');

  // ---------- Part 1 Split Panel Elements ----------
  const splitPrincipalFill = document.getElementById('split-principal-fill');
  const splitInterestFill = document.getElementById('split-interest-fill');
  const splitPrincipalPct = document.getElementById('split-principal-pct');
  const splitInterestPct = document.getElementById('split-interest-pct');
  const splitPrincipalVal = document.getElementById('split-principal-val');
  const splitInterestVal = document.getElementById('split-interest-val');
  const splitTenureDisplay = document.getElementById('split-tenure-display');
  const splitMonthsDisplay = document.getElementById('split-months-display');

  // ---------- Part 4 Dedicated Controls & Table ----------
  const p4Amount = document.getElementById('p4-amount');
  const p4Tenure = document.getElementById('p4-tenure');
  const p4Rate = document.getElementById('p4-rate');
  const p4SyncMainBtn = document.getElementById('p4-sync-main-btn');

  const amortBody = document.getElementById('amort-body');
  const amortSummaryLoan = document.getElementById('amort-summary-loan');
  const amortSummaryTenure = document.getElementById('amort-summary-tenure');
  const amortSummaryRate = document.getElementById('amort-summary-rate');
  const amortSummaryEmi = document.getElementById('amort-summary-emi');
  const amortVisualBars = document.getElementById('amort-visual-bars');

  const printScheduleBtn = document.getElementById('print-schedule-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');

  // ---------- Prepayment Simulator (Part 5) ----------
  const prepAnnual = document.getElementById('prep-annual');
  const prepYearsSaved = document.getElementById('prep-years-saved');
  const prepInterestSaved = document.getElementById('prep-interest-saved');

  // ---------- Scenario Comparison Matrix (Part 6) ----------
  const compAAmount = document.getElementById('comp-a-amount');
  const compATenure = document.getElementById('comp-a-tenure');
  const compARate = document.getElementById('comp-a-rate');
  const compAEmi = document.getElementById('comp-a-emi');
  const compAInterest = document.getElementById('comp-a-interest');
  const compATotal = document.getElementById('comp-a-total');

  const compBAmount = document.getElementById('comp-b-amount');
  const compBTenure = document.getElementById('comp-b-tenure');
  const compBRate = document.getElementById('comp-b-rate');
  const compBEmi = document.getElementById('comp-b-emi');
  const compBInterest = document.getElementById('comp-b-interest');
  const compBTotal = document.getElementById('comp-b-total');

  const savingsAmount = document.getElementById('savings-amount');
  const savingsDesc = document.getElementById('savings-desc');

  // ---------- Presets & Mobile Drawer ----------
  const presetBtns = document.querySelectorAll('.preset-btn');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // ---------- Helpers ----------
  function formatINR(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function parseFormattedNumber(val) {
    return parseFloat(val.toString().replace(/,/g, '')) || 0;
  }

  function calculateEMI(P, annualRate, years) {
    const N = years * 12;
    const R = annualRate / 12 / 100;
    if (R === 0) return { emi: P / N, totalPayable: P, totalInterest: 0 };
    const factor = Math.pow(1 + R, N);
    const emi = (P * R * factor) / (factor - 1);
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;
    return { emi, totalPayable, totalInterest };
  }

  // Build Yearly Amortization Schedule
  function buildYearlySchedule(P, annualRate, years) {
    const N = years * 12;
    const R = annualRate / 12 / 100;
    const { emi } = calculateEMI(P, annualRate, years);

    let balance = P;
    const rows = [];
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= N; m++) {
      const interestPortion = balance * R;
      let principalPortion = emi - interestPortion;
      if (m === N) principalPortion = balance; // Fix rounding precision
      balance = Math.max(0, balance - principalPortion);

      yearPrincipal += principalPortion;
      yearInterest += interestPortion;

      if (m % 12 === 0 || m === N) {
        rows.push({
          year: Math.ceil(m / 12),
          principal: yearPrincipal,
          interest: yearInterest,
          totalPaid: yearPrincipal + yearInterest,
          balance: balance
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }
    return rows;
  }

  // Part 4 Visual Stacked Bar Chart Renderer
  function renderAmortizationVisualBars(rows) {
    if (!amortVisualBars) return;
    const maxVal = Math.max(...rows.map(r => r.totalPaid)) || 1;

    amortVisualBars.innerHTML = rows.map(r => {
      const pPct = (r.principal / maxVal) * 100;
      const iPct = (r.interest / maxVal) * 100;
      return `
        <div class="vbar-col" title="Year ${r.year}: Principal ${formatINR(r.principal)}, Interest ${formatINR(r.interest)}">
          <div class="vbar-interest" style="height:${iPct}%"></div>
          <div class="vbar-principal" style="height:${pPct}%"></div>
          <span class="vbar-label">Y${r.year}</span>
        </div>
      `;
    }).join('');
  }

  // Render Part 4 Table & Visuals based on Part 4 Dedicated Inputs
  function updatePart4Schedule() {
    if (!p4Amount || !p4Tenure || !p4Rate) return;

    const P = Math.max(100000, Math.min(100000000, parseFloat(p4Amount.value) || 0));
    const years = Math.max(1, Math.min(30, parseFloat(p4Tenure.value) || 1));
    const annualRate = Math.max(1, Math.min(25, parseFloat(p4Rate.value) || 1));

    const { emi } = calculateEMI(P, annualRate, years);
    const rows = buildYearlySchedule(P, annualRate, years);

    if (amortBody) {
      amortBody.innerHTML = rows.map(r => `
        <tr>
          <td>Year ${r.year}</td>
          <td>${formatINR(r.principal)}</td>
          <td>${formatINR(r.interest)}</td>
          <td>${formatINR(r.totalPaid)}</td>
          <td>${formatINR(r.balance)}</td>
        </tr>
      `).join('');
    }

    if (amortSummaryLoan) amortSummaryLoan.textContent = formatINR(P);
    if (amortSummaryTenure) amortSummaryTenure.textContent = `${years} Years`;
    if (amortSummaryRate) amortSummaryRate.textContent = `${annualRate.toFixed(2)}%`;
    if (amortSummaryEmi) amortSummaryEmi.textContent = `${formatINR(emi)} /mo`;

    renderAmortizationVisualBars(rows);
    updatePrepaymentSimulator(P, annualRate, years);
  }

  // Donut SVG Segment Update
  function updateDonutChart(pPct) {
    if (!donutPrincipal || !donutInterest) return;
    const circumference = 2 * Math.PI * 38; // ~238.76
    const pOffset = circumference - (pPct / 100) * circumference;

    donutPrincipal.style.strokeDasharray = `${circumference}`;
    donutPrincipal.style.strokeDashoffset = `${pOffset}`;

    donutInterest.style.strokeDasharray = `${circumference}`;
    donutInterest.style.strokeDashoffset = '0';
    donutInterest.style.transform = `rotate(${ (pPct / 100) * 360 }deg)`;
    donutInterest.style.transformOrigin = '50px 50px';

    if (donutPrincipalPct) donutPrincipalPct.textContent = `${Math.round(pPct)}%`;
  }

  // Main Calculator Update
  function updateMainCalculator() {
    const P = parseFloat(amountInput.value);
    const years = parseFloat(tenureInput.value);
    const annualRate = parseFloat(rateInput.value);

    // Sync Text Inputs
    amountText.value = Math.round(P).toLocaleString('en-IN');
    tenureText.value = years;
    rateText.value = annualRate.toFixed(2);

    // Also sync Part 4 Inputs initially
    if (p4Amount) p4Amount.value = Math.round(P);
    if (p4Tenure) p4Tenure.value = years;
    if (p4Rate) p4Rate.value = annualRate.toFixed(2);

    const { emi, totalPayable, totalInterest } = calculateEMI(P, annualRate, years);

    emiValue.textContent = `${formatINR(emi)} /mo`;
    principalValue.textContent = formatINR(P);
    interestValue.textContent = formatINR(totalInterest);
    totalValue.textContent = formatINR(totalPayable);

    const pPct = Math.max(2, Math.min(98, (P / totalPayable) * 100));
    const iPct = 100 - pPct;

    bbPrincipal.style.width = `${pPct}%`;
    bbInterest.style.width = `${iPct}%`;
    if (legPPct) legPPct.textContent = `${Math.round(pPct)}%`;
    if (legIPct) legIPct.textContent = `${Math.round(iPct)}%`;

    updateDonutChart(pPct);

    // Part 1 Split Panel Updates
    if (splitPrincipalFill && splitInterestFill) {
      splitPrincipalFill.style.width = `${pPct}%`;
      splitInterestFill.style.width = `${iPct}%`;
      splitPrincipalPct.textContent = `${Math.round(pPct)}%`;
      splitInterestPct.textContent = `${Math.round(iPct)}%`;
      splitPrincipalVal.textContent = formatINR(P);
      splitInterestVal.textContent = formatINR(totalInterest);
      splitTenureDisplay.textContent = `${years} Years`;
      splitMonthsDisplay.textContent = `${years * 12} Payments`;
    }

    updatePart4Schedule();
  }

  // Prepayment Savings Simulator Math
  function updatePrepaymentSimulator(P, annualRate, years) {
    if (!prepAnnual || !prepYearsSaved || !prepInterestSaved) return;

    const extraAnnual = parseFloat(prepAnnual.value) || 0;
    if (extraAnnual <= 0) {
      prepYearsSaved.textContent = '0 Years';
      prepInterestSaved.textContent = '₹0';
      return;
    }

    const R = annualRate / 12 / 100;
    const { emi, totalInterest: originalInterest } = calculateEMI(P, annualRate, years);

    let balance = P;
    let months = 0;
    let accumInterest = 0;

    while (balance > 0 && months < years * 12) {
      months++;
      const interestPortion = balance * R;
      let principalPortion = emi - interestPortion;

      // Annual Prepayment lump sum added on month 12, 24, 36...
      if (months % 12 === 0) {
        principalPortion += extraAnnual;
      }

      if (principalPortion >= balance) {
        principalPortion = balance;
      }

      balance -= principalPortion;
      accumInterest += interestPortion;
    }

    const yearsSaved = Math.max(0, ((years * 12 - months) / 12)).toFixed(1);
    const interestSaved = Math.max(0, originalInterest - accumInterest);

    prepYearsSaved.textContent = `${yearsSaved} Years`;
    prepInterestSaved.textContent = formatINR(interestSaved);
  }

  // Handle Typed Text Inputs Syncing to Range Sliders (Up to ₹10 Cr)
  amountText.addEventListener('change', () => {
    let val = parseFormattedNumber(amountText.value);
    val = Math.max(100000, Math.min(100000000, val));
    amountInput.value = val;
    updateMainCalculator();
  });

  tenureText.addEventListener('change', () => {
    let val = parseFloat(tenureText.value) || 1;
    val = Math.max(1, Math.min(30, val));
    tenureInput.value = val;
    updateMainCalculator();
  });

  rateText.addEventListener('change', () => {
    let val = parseFloat(rateText.value) || 5;
    val = Math.max(1, Math.min(25, val));
    rateInput.value = val;
    updateMainCalculator();
  });

  [amountInput, tenureInput, rateInput].forEach(input => {
    input.addEventListener('input', updateMainCalculator);
  });

  // Part 4 Dedicated Inputs Listeners
  [p4Amount, p4Tenure, p4Rate].forEach(input => {
    if (input) input.addEventListener('input', updatePart4Schedule);
  });

  if (p4SyncMainBtn) {
    p4SyncMainBtn.addEventListener('click', () => {
      amountInput.value = p4Amount.value;
      tenureInput.value = p4Tenure.value;
      rateInput.value = p4Rate.value;
      updateMainCalculator();
    });
  }

  if (prepAnnual) {
    prepAnnual.addEventListener('input', () => {
      const P = parseFloat(p4Amount.value) || parseFloat(amountInput.value);
      const years = parseFloat(p4Tenure.value) || parseFloat(tenureInput.value);
      const rate = parseFloat(p4Rate.value) || parseFloat(rateInput.value);
      updatePrepaymentSimulator(P, rate, years);
    });
  }

  // Loan Presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      amountInput.value = btn.dataset.amount;
      tenureInput.value = btn.dataset.tenure;
      rateInput.value = btn.dataset.rate;

      updateMainCalculator();
    });
  });

  // Scenario Comparison Matrix (Part 6)
  function updateComparisonMatrix() {
    if (!compAAmount || !compBAmount) return;

    const pA = parseFloat(compAAmount.value) || 0;
    const tA = parseFloat(compATenure.value) || 1;
    const rA = parseFloat(compARate.value) || 0;

    const pB = parseFloat(compBAmount.value) || 0;
    const tB = parseFloat(compBTenure.value) || 1;
    const rB = parseFloat(compBRate.value) || 0;

    const resA = calculateEMI(pA, rA, tA);
    const resB = calculateEMI(pB, rB, tB);

    compAEmi.textContent = formatINR(resA.emi);
    compAInterest.textContent = formatINR(resA.totalInterest);
    compATotal.textContent = formatINR(resA.totalPayable);

    compBEmi.textContent = formatINR(resB.emi);
    compBInterest.textContent = formatINR(resB.totalInterest);
    compBTotal.textContent = formatINR(resB.totalPayable);

    const diffTotal = resA.totalPayable - resB.totalPayable;
    const emiDiff = resB.emi - resA.emi;

    if (diffTotal > 0) {
      savingsAmount.textContent = formatINR(diffTotal);
      savingsDesc.innerHTML = `By choosing Option B (${tB} yrs @ ${rB}%) over Option A (${tA} yrs @ ${rA}%), you pay ${formatINR(Math.abs(emiDiff))}/mo ${emiDiff >= 0 ? 'more' : 'less'}, but save <strong>${formatINR(diffTotal)}</strong> in total repayment cost!`;
    } else if (diffTotal < 0) {
      savingsAmount.textContent = formatINR(Math.abs(diffTotal));
      savingsDesc.innerHTML = `Option A saves you <strong>${formatINR(Math.abs(diffTotal))}</strong> overall compared to Option B over the full loan lifetime!`;
    } else {
      savingsAmount.textContent = '₹0';
      savingsDesc.innerHTML = `Both loan options result in the exact same total repayment cost over time.`;
    }
  }

  [compAAmount, compATenure, compARate, compBAmount, compBTenure, compBRate].forEach(el => {
    if (el) el.addEventListener('input', updateComparisonMatrix);
  });

  // Action Buttons
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', () => {
      const summaryText = `EMI Calculation Summary:\nLoan Amount: ${amountText.value}\nTenure: ${tenureInput.value} Years\nInterest Rate: ${rateInput.value}%\nMonthly EMI: ${emiValue.textContent}\nTotal Payable: ${totalValue.textContent}`;
      navigator.clipboard.writeText(summaryText).then(() => {
        const originalText = copySummaryBtn.innerHTML;
        copySummaryBtn.innerHTML = `✓ Copied!`;
        setTimeout(() => { copySummaryBtn.innerHTML = originalText; }, 2000);
      });
    });
  }

  if (printScheduleBtn) {
    printScheduleBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Mobile Drawer Navigation
  function toggleDrawer(open) {
    if (open) {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (burgerBtn) burgerBtn.addEventListener('click', () => toggleDrawer(true));
  if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
  if (drawerOverlay) drawerOverlay.addEventListener('click', () => toggleDrawer(false));
  drawerLinks.forEach(link => link.addEventListener('click', () => toggleDrawer(false)));

  // Scroll Reveal Animations
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Accordion FAQs
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // Initial Run
  updateMainCalculator();
  updateComparisonMatrix();

})();
