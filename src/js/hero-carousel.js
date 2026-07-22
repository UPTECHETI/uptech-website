// Carrossel do hero — troca suave (crossfade) entre as fotos da equipe UP Tech.
// Não depende de biblioteca externa, só troca a classe "active" por intervalo.

const SLIDE_INTERVAL_MS = 5000;

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-carousel .hero-slide');
  if (slides.length <= 1) return;

  let current = Array.from(slides).findIndex((s) => s.classList.contains('active'));
  if (current === -1) current = 0;

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, SLIDE_INTERVAL_MS);
});
