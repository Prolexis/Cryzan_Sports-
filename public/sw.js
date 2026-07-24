// Service Worker para Notificaciones Web Push de Cryzan Sport
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cryzan Sport Perú 🏆';
  const options = {
    body: data.body || 'Tu pedido ha sido actualizado.',
    icon: '/img/productos/polo.jpeg',
    badge: '/img/productos/polo.jpeg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
