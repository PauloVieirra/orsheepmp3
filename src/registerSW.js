let deferredPrompt;

// Função para solicitar permissão de notificação
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }
  return false;
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Solicitar permissão de notificação primeiro
      await requestNotificationPermission();
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);

      // Configurar o manipulador de áudio em segundo plano
      if (registration.active) {
        registration.active.postMessage({
          type: 'BACKGROUND_AUDIO',
          payload: { enabled: true }
        });
      }
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
};

// Capturar o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPrompt();
});

// Função para mostrar o prompt de instalação
export const showInstallPrompt = () => {
  if (!deferredPrompt) return;

  // Criar o modal de instalação
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  const message = document.createElement('p');
  message.textContent = 'Instalar aplicativo?';
  message.style.margin = '0';

  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '10px';

  const installButton = document.createElement('button');
  installButton.textContent = 'Instalar';
  installButton.style.cssText = `
    background: #4CAF50;
    border: none;
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
  `;

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Agora não';
  cancelButton.style.cssText = `
    background: transparent;
    border: 1px solid white;
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
  `;

  installButton.addEventListener('click', async () => {
    const promptResult = await deferredPrompt.prompt();
    console.log('Resultado da instalação:', promptResult);
    deferredPrompt = null;
    modal.remove();
  });

  cancelButton.addEventListener('click', () => {
    modal.remove();
  });

  buttonsContainer.appendChild(installButton);
  buttonsContainer.appendChild(cancelButton);
  modal.appendChild(message);
  modal.appendChild(buttonsContainer);
  document.body.appendChild(modal);
};