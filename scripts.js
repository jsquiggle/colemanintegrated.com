document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));

  // Scroll fade-in observer
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => obs.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }
});
