const WA_NUMBER = '5592991005074'
const WA_DEFAULT_MSG = 'Olá! Vim pelo site da UP Tech e gostaria de mais informações.'

export function waLink(message = WA_DEFAULT_MSG) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export function initWhatsAppFAB() {
  const fab = document.getElementById('wa-fab')
  if (fab) {
    fab.href = waLink()
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', initWhatsAppFAB)
