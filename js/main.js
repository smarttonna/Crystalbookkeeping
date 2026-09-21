/**
 * Crystal Bookkeeping - Main JavaScript Interactivity
 * Handles: Pricing Calculator, Currency Switcher, Appointment Modal, WhatsApp Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Sticky Navbar scroll detection
  initNavbarScroll();

  // Initialize Pricing Calculator
  initPricingCalculator();

  // Initialize Appointment Modal logic
  initBookingModal();

  // Initialize Contact Page Message Form
  initContactPageForm();

  // Smooth Scrolling
  initSmoothScroll();
});

/* ==========================================================================
   Navbar Scroll Effect
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.main-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   Pricing Calculator Logic
   ========================================================================== */
function initPricingCalculator() {
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const monthsSlider = document.getElementById('monthsSlider');
  const monthsValueDisplay = document.getElementById('monthsValueDisplay');
  const priceDisplay = document.getElementById('calculatedPrice');
  const currencyToggle = document.getElementById('currencyToggle');
  const scenarioDescription = document.getElementById('scenarioDescription');

  if (!priceDisplay) return;

  let activeScenario = 'scenarioA';
  let activeCurrency = 'USD'; // 'USD' or 'NGN'

  // Pricing Base Matrix
  const basePrices = {
    USD: {
      scenarioA: 300, // Messy DIY Books base
      scenarioB: 400, // Previous Bookkeeper base
      monthly: 300,   // Monthly bookkeeping base
      rebuild: 'Custom'
    },
    NGN: {
      scenarioA: 300000,
      scenarioB: 400000,
      monthly: 300000,
      rebuild: 'Custom'
    }
  };

  const scenarioDetails = {
    scenarioA: "Messy DIY Books: Net deposits as sales, no COGS setup, missing fee breakdowns, sales tax mixed into income.",
    scenarioB: "Previous Bookkeeper File: Non-specialist bookkeeper involved, wrong account mapping, duplicates, deep errors.",
    monthly: "Ongoing Monthly Bookkeeping: Bank reconciliation, P&L, balance sheet, cash flow tracking & dedicated bookkeeper.",
    rebuild: "Complete Rebuild / No QBO Activity: Historical build from spreadsheets/bank statements only."
  };

  // Scenario Button Click Handlers
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      activeScenario = targetBtn.dataset.scenario;
      
      if (scenarioDescription && scenarioDetails[activeScenario]) {
        scenarioDescription.textContent = scenarioDetails[activeScenario];
      }
      
      updatePriceCalculation();
    });
  });

  // Slider Change Handler
  if (monthsSlider) {
    monthsSlider.addEventListener('input', (e) => {
      const months = e.target.value;
      if (monthsValueDisplay) {
        monthsValueDisplay.textContent = `${months} ${months == 1 ? 'Month' : 'Months'}`;
      }
      updatePriceCalculation();
    });
  }

  // Currency Toggle Handler
  if (currencyToggle) {
    currencyToggle.addEventListener('change', (e) => {
      activeCurrency = e.target.checked ? 'NGN' : 'USD';
      updatePriceCalculation();
    });
  }

  function updatePriceCalculation() {
    if (activeScenario === 'rebuild') {
      priceDisplay.textContent = 'Custom Quote';
      return;
    }

    const months = monthsSlider ? parseInt(monthsSlider.value) : 1;
    const basePrice = basePrices[activeCurrency][activeScenario];
    
    // Calculation model: Base fee + incremental multiplier per month beyond month 1
    let total = basePrice;
    if (months > 1 && activeScenario !== 'monthly') {
      const monthlyIncrement = activeCurrency === 'USD' ? 120 : 120000;
      total += (months - 1) * monthlyIncrement;
    } else if (activeScenario === 'monthly') {
      total = basePrice * months;
    }

    // Format output
    if (activeCurrency === 'USD') {
      priceDisplay.textContent = `$${total.toLocaleString()}`;
    } else {
      priceDisplay.textContent = `₦${total.toLocaleString()}`;
    }
  }
}

/* ==========================================================================
   Appointment Booking Modal & WhatsApp Handler
   ========================================================================== */
function initBookingModal() {
  const bookingForm = document.getElementById('bookingForm');
  const planButtons = document.querySelectorAll('[data-bs-target="#bookingModal"]');

  // Pre-fill service selector when coming from specific plan cards
  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.dataset.service;
      const selectElem = document.getElementById('modalServiceSelect');
      if (serviceName && selectElem) {
        selectElem.value = serviceName;
      }
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('modalClientName').value.trim();
      const email = document.getElementById('modalClientEmail').value.trim();
      const phone = document.getElementById('modalClientPhone').value.trim();
      const service = document.getElementById('modalServiceSelect').value;
      const software = document.getElementById('modalSoftwareSelect').value;
      const notes = document.getElementById('modalNotes').value.trim();

      // Format WhatsApp Message
      const messageText = `Hi Wuraola! I'd like to book a consultation for Crystal Bookkeeping.%0A%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Email:* ${encodeURIComponent(email)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        `*Service Needed:* ${encodeURIComponent(service)}%0A` +
        `*Accounting Software:* ${encodeURIComponent(software)}%0A` +
        `*Details/Notes:* ${encodeURIComponent(notes || 'N/A')}`;

      const whatsappUrl = `https://wa.me/2349033714425?text=${messageText}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Close modal
      const modalElem = document.getElementById('bookingModal');
      if (modalElem) {
        const modalInstance = bootstrap.Modal.getInstance(modalElem);
        if (modalInstance) modalInstance.hide();
      }

      alert('Thank you! Your request has been formatted and forwarded to WhatsApp. You can also email us directly at Crystalbooksconsult@gmail.com.');
    });
  }
}

/* ==========================================================================
   Contact Page Direct Message Form Handler
   ========================================================================== */
function initContactPageForm() {
  const form = document.getElementById('contactPageForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim() || '';
    const email = document.getElementById('contactEmail')?.value.trim() || '';
    const phone = document.getElementById('contactPhone')?.value.trim() || '';
    const software = document.getElementById('contactSoftware')?.value || 'Not Specified';
    const service = document.getElementById('contactService')?.value || 'General Inquiry';
    const message = document.getElementById('contactMessage')?.value.trim() || '';

    // Format email message
    const subject = encodeURIComponent(`Inquiry from ${name} - Crystal Bookkeeping`);
    const bodyText = `Hi Wuraola,\n\nI am reaching out via Crystal Bookkeeping's website.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Software: ${software}\n` +
      `Primary Need: ${service}\n\n` +
      `Message:\n${message || 'Looking forward to discussing our bookkeeping needs.'}`;

    const mailtoUrl = `mailto:Crystalbooksconsult@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    window.location.href = mailtoUrl;
  });
}

/* ==========================================================================
   Smooth Scrolling & Mobile Nav Auto-Close
   ========================================================================== */
function initSmoothScroll() {
  // Auto-close mobile collapse navbar when clicking any nav link
  const navLinks = document.querySelectorAll('.navbar-collapse .nav-link, .navbar-collapse .btn-lime');
  const navCollapse = document.querySelector('.navbar-collapse');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#bookingModal') return;
      
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
