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

// Contact form — client-side stub (no backend wired)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  note.hidden = true;
  note.classList.remove('error');

  const required = ['name', 'email', 'from', 'to', 'service'];
  const missing = required.filter(id => !form.elements[id].value.trim());
  const email = form.elements.email.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (missing.length || !emailOk) {
    note.textContent = !emailOk && !missing.includes('email')
      ? 'Please enter a valid email address.'
      : 'Please fill in the required fields.';
    note.classList.add('error');
    note.hidden = false;
    return;
  }

  // Compose a mailto fallback so the form is usable without a backend
  const subject = encodeURIComponent(
    `Ride request — ${form.elements.service.value} (${form.elements.from.value} → ${form.elements.to.value})`
  );
  const lines = [
    `Name: ${form.elements.name.value}`,
    `Email: ${email}`,
    `Phone: ${form.elements.phone.value || '—'}`,
    `Pickup: ${form.elements.from.value}`,
    `Drop-off: ${form.elements.to.value}`,
    `Service: ${form.elements.service.value}`,
    `Date: ${form.elements.when.value || '—'}`,
    '',
    'Pet details:',
    form.elements.details.value || '—'
  ];
  const body = encodeURIComponent(lines.join('\n'));

  note.textContent = 'Opening your email app to send your request to info@kanespettransport.com…';
  note.hidden = false;
  window.location.href = `mailto:info@kanespettransport.com?subject=${subject}&body=${body}`;
});
