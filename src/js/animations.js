// Scroll animations — Intersection Observer
// Adiciona .visible quando o elemento entra na viewport

const animatedItems = document.querySelectorAll('.animate-on-scroll');

if (animatedItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima só uma vez
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  animatedItems.forEach((item) => observer.observe(item));
}
