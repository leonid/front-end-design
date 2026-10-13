### 1. Как проектирате React приложение, за да отговаря на Progressive Web App (PWA) стандарти?

**Отговор:**
Започвам, като гарантирам, че са изпълнени основните PWA критерии:

- **Responsive UI**: Създадено е с mobile-first дизайн чрез CSS frameworks или media queries.
- **HTTPS**: Задължително за service workers и сигурност.
- **Web App Manifest**: Определя метаданни на приложението (име, икони, theme color).
- **Service Worker**: Включва кеширане и offline поддръжка.

В `create-react-app` повечето неща са изградени по default. Настройвам `manifest.json` и регистрирам service worker:

```
// index.js
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
serviceWorkerRegistration.register();
```

Използвам и Lighthouse, за да направя аудит и да потвърдя съответствието.

<br />

### 2. Какъв е вашият подход към внедряването на offline кеширане в React app чрез service workers?

**Отговор:**
Използвам service worker, за да кеширам основни ресурси (HTML, CSS, JS) и при желание — API отговори:

```
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-v1').then(cache =>
      cache.addAll(['/index.html', '/main.css', '/main.js'])
    )
  );
});
```

За кеширане на API:

```
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
```

Това гарантира, че shell-ът на приложението и част от динамичните данни са налични офлайн.

<br />

### 3. Как интегрирате push notifications в React PWA?

**Отговор:**

1. **Заявка за разрешение** чрез Notifications API.
2. **Регистрация за Push** с Push API и service worker.
3. **Абонамент към Push Service** (напр. Firebase Cloud Messaging или VAPID server).
4. **Обработка на Push в SW** :

```
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png'
  });
});
```

От страната на React интегрирам логиката за абонамент и я изпращам към backend за съхранение.

<br />

### 4. Каква е вашата стратегия, за да гарантирате, че React app остава функционален офлайн с динамични данни?

**Отговор:**

- **Кеширам динамични API данни** с IndexedDB (чрез библиотеки като `idb`) или localStorage.
- Използвам стратегия **"Cache then network"** или **"Network falling back to cache"**.
- Поддържам **опашка** от записващи операции (напр. form submissions) и ги синхронизирам, когато мрежата е налична.

Пример:

```
// Fallback to cache on failure
const getData = async () => {
  try {
    const res = await fetch('/api/data');
    const json = await res.json();
    localStorage.setItem('cachedData', JSON.stringify(json));
    return json;
  } catch {
    return JSON.parse(localStorage.getItem('cachedData'));
  }
};
```

<br />

### 5. Как тествате офлайн възможностите на React PWA на различни устройства и браузъри?

**Отговор:**

- Използвам **Chrome DevTools** → Application tab → Service Workers → Simulate offline.
- Правя **Lighthouse audits** за offline поддръжка.
- Изключвам ръчно Wi‑Fi и тествам критични потоци.
- Използвам **BrowserStack** или реални устройства за крос-браузър тестване.
- Тествам и студен старт (напълно офлайн) и топъл старт (cached session).

<br />

### 6. Какъв е вашият подход към оптимизирането на installability на React PWA (напр. manifest файлове)?

**Отговор:**

- Гарантирам, че `manifest.json` е валиден и е свързан в `index.html`:

```html
<link rel="manifest" href="/manifest.json" />
```

- Включвам задължителни полета: `name`, `short_name`, `start_url`, `display`, `icons` и `theme_color`.

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- Показвам install prompts чрез `beforeinstallprompt` събитие.

<br />

### 7. Как се справяте с управлението на състоянието в React PWA по време на проблеми с мрежата?

**Отговор:**

- Използвам local-first стратегия за състояние с библиотеки като **Zustand**, **Redux Persist** или **Dexie.js** за синхронизация с IndexedDB.
- Разпознавам online/offline чрез `navigator.onLine` или `window.addEventListener('online')`.
- Поставям действия, изпълнени офлайн, в опашка и ги повтарям при reconnect.

Пример:

```
window.addEventListener('online', () => {
  // Process queued actions
});
```

Целта е eventual consistency без блокиране на UI.

<br />

### 8. Какъв е вашият процес за отстраняване на проблеми със service worker в React приложение?

**Отговор:**

1. Отварям **DevTools → Application → Service Workers**, за да проверя жизнения цикъл.
2. Използвам `console.log()` вътре в service worker и проверявам DevTools → Console → Service Worker.
3. Валидирам, че `fetch` и `install` събитията се изпълняват.
4. Изчиствам старите кешове при upgrade версии.
5. Използвам **Lighthouse**, за да идентифицирам проблеми с кеш стратегията или регистрацията.

```
self.addEventListener('activate', event => {
  // Clean up old cache versions
});
```

<br />

### 9. Как измервате ефекта от PWA функционалностите върху производителността в React app?

**Отговор:**

- Използвам **Lighthouse**, за да измервам производителност, PWA съответствие и Time to Interactive (TTI).
- Следя **service worker timing** чрез Performance API.
- Отчитам **cache hit rates** и **fallback-и на мрежови заявки** чрез custom logging или analytics (напр. Sentry, LogRocket).
- Използвам `web-vitals`, за да следя метрики като FCP, LCP и CLS.

<br />

### 10. Как обучавате екип за създаване и поддръжка на PWA с React?

**Отговор:**

- Създавам **споделен документ или internal wiki** със стандарти, модели и code snippets за PWA.
- Организирам **live workshops** или walkthrough-и за:
  - Service workers
  - Caching strategies
  - Offline-friendly UX
- Използвам **Lighthouse** като checklist.
- Предоставям **template repos** или boilerplates.
- Разглеждам PWA-код в PR-ове, за да гарантирам най-добри практики.
