// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky header style on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => {
  if (window.scrollY > 12) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  mobileNav.hidden = !open;
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    mobileNav.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Reveal-on-scroll
const revealTargets = document.querySelectorAll(
  '.section-head, .card, .approach-copy, .pillars li, .about-media, .about-copy, .quote, .faq-list details, .contact-copy, .contact-form'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

// Contact form — silent background submit to Formspree
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const submitBtn = form.querySelector('button[type="submit"]');
const RECIPIENT_EMAIL = 'info@kanespettransport.com';

function setNote(msg, isError = false) {
  note.textContent = msg;
  note.classList.toggle('error', isError);
  note.hidden = false;
}

function validate() {
  const required = ['name', 'email', 'from', 'to', 'service'];
  const missing = required.filter(id => !form.elements[id].value.trim());
  const email = form.elements.email.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (missing.length || !emailOk) {
    setNote(
      !emailOk && !missing.includes('email')
        ? 'Please enter a valid email address.'
        : 'Please fill in the required fields.',
      true
    );
    return false;
  }
  return true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  note.hidden = true;
  note.classList.remove('error');

  if (!validate()) return;

  // Web3Forms requires a valid access key in the access_key field.
  const accessKey = form.elements.access_key?.value?.trim();
  if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
    setNote(
      `The form isn't fully set up yet. Please email ${RECIPIENT_EMAIL} directly.`,
      true
    );
    return;
  }

  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  // Web3Forms accepts JSON-encoded form fields and returns { success, message }.
  const payload = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      form.reset();
      setNote(`Thank you — your request has been sent. We'll be in touch within one business day.`);
    } else {
      const msg = result.message || `Something went wrong. Please email ${RECIPIENT_EMAIL} directly.`;
      setNote(msg, true);
    }
  } catch (err) {
    setNote(`Network error. Please email ${RECIPIENT_EMAIL} directly.`, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});
