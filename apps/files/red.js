// Cria um elemento que cobre toda a tela
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'red';
overlay.style.zIndex = 9999;
document.body.appendChild(overlay);

// Remove após 5 segundos
setTimeout(() => {
  document.body.removeChild(overlay);
}, 5000);