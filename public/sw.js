const CACHE_NAME = 'orsheep-mp3-v1';
const ASSETS_CACHE = 'assets-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Recursos que serão cacheados na instalação
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-512x512.svg',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css'
];

// Instala o service worker e faz cache dos recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache separado para assets
      caches.open(ASSETS_CACHE).then((cache) => {
        return cache.addAll([
          '/icon-512x512.svg'
        ]);
      })
    ])
  );
  // Força a ativação imediata
  self.skipWaiting();
});

// Limpa caches antigos na ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== ASSETS_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      }),
      // Toma controle de todas as abas abertas
      self.clients.claim()
    ])
  );
});

// Estratégia de cache: Network First para APIs, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições para a API do YouTube
  if (url.hostname.includes('youtube.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache First para assets estáticos
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Network First para outras requisições
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a resposta bem-sucedida
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se offline, tenta buscar do cache
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // Se não encontrar no cache, retorna uma página offline personalizada
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
          return new Response('Offline');
        });
      })
  );
});

// Habilitar reprodução em segundo plano
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'BACKGROUND_AUDIO') {
    try {
      const permission = await self.registration.pushManager.permissionState({ userVisibleOnly: true });
      
      if (permission === 'granted') {
        await self.registration.showNotification('OrSheep Music Player', {
          body: 'Música em reprodução',
          icon: '/icon-512x512.svg',
          tag: 'background-playback',
          actions: [
            {
              action: 'pause',
              title: 'Pausar'
            },
            {
              action: 'next',
              title: 'Próxima'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }
});

// Manipula cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'pause') {
    // Envia mensagem para pausar a música
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'PAUSE_MUSIC' });
      });
    });
  } else if (event.action === 'next') {
    // Envia mensagem para próxima música
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'NEXT_MUSIC' });
      });
    });
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
});