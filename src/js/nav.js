// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle')
  const menu   = document.getElementById('nav-menu')
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden')
    })
  }

  // Highlight active page link
  const links = document.querySelectorAll('[data-nav-link]')
  links.forEach(link => {
    if (link.getAttribute('href') === window.location.pathname.replace(/\/$/, '') + '/' ||
        link.getAttribute('href') === window.location.pathname ||
        (window.location.pathname === '/' && link.getAttribute('href') === '/index.html')) {
      link.classList.add('text-brand-accent', 'border-b', 'border-brand-accent')
    }
  })
})
