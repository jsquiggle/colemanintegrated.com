document.addEventListener('DOMContentLoaded', () => {
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('open'));
});
