### 1. Как проектирате frontend система, която да обработва e-commerce платформа с висок трафик и милиони едновременни потребители?

**Ключови стратегии**:

- **Server-Side Rendering (SSR)** или **Static Site Generation (SSG)** чрез Next.js за product/category pages, за да се намали TTFB.
- **CDN caching** за статични ресурси и SSR отговори.
- Използване на **code-splitting** и **lazy loading** за product details, reviews и др.
- Изнасяне на тежки UI (напр. search, filters) в **client-side rendering** с async API.

```jsx
const Product = React.lazy(() => import("./Product"));
```

<br />

### 2. Какъв е вашият подход към проектирането на frontend архитектура, която поддържа real-time актуализации между множество клиенти (напр. чат приложение или live dashboard)?

**Подход**:

- Използване на **WebSockets** (напр. [Socket.IO](http://Socket.IO) или native) или **Server-Sent Events** за real-time данни.
- Използване на state management с **event queues**, за да debounce-вате актуализациите и да осигурите съгласуваност на UI.

```jsx
socket.on("newMessage", (msg) => {
  dispatch(addMessage(msg));
});
```

- Прилагане на **presence**, **typing indicators** и **message queues** на клиента за устойчивост.

<br />

### 3. Как проектирате frontend система, която безпроблемно да преминава между online и offline режими?

**Техники**:

- Използване на **Service Workers** за offline кеширане (чрез Workbox).
- Кеширане на потребителски действия в **IndexedDB** чрез библиотеки като `idb`.
- Синхронизиране на queue-нати действия, когато мрежата се възстанови (чрез `navigator.onLine` events).

```jsx
window.addEventListener("online", syncQueuedRequests);
```

- Използване на optimistic UI updates с rollback при неуспешна синхронизация.

<br />

### 4. Как бихте архитектурно проектирали frontend система за международна локализация (i18n) и локално адаптиране (L10n) за глобална аудитория?

**Архитектура**:

- Абстракция на всички низове и формати чрез инструменти като `react-i18next` или `vue-i18n`.
- Използване на **locale-based routing** (`/en/`, `/fr/`) за SEO.
- Динамично зареждане на locale файлове, за да се избегне претоварване на bundle-а.

```jsx
i18n.changeLanguage("fr"); // dynamically switches language
```

<br />

### 5. Каква е вашата стратегия за проектиране на frontend система, която се интегрира с microservices backend?

**Стратегия**:

- Използване на **API gateway** от backend, за да се абстрахира microservices от frontend.
- Нормализиране и трансформиране на microservice responses в client-side **API layer**.
- Централизирана обработка на versioning, retries и fallbacks.

<br />

### 6. Как проектирате React приложение, за да минимизирате bundle size и оптимизирате initial load time за голямо приложение?

**Тактики**:

- **Code-splitting** с React.lazy + Suspense.
- Използване на **tree-shaking-friendly** библиотеки.
- Зареждане на не-критичен JS с `async`/`defer`.
- Използване на **dynamic imports** и **preload** на критични ресурси.
- Компресия чрез Brotli и доставка чрез CDN.

<br />

### 7. Как бихте проектирали frontend система, която да обработва пагинация, infinite scrolling и големи набори данни (напр. 100,000+ записи)?

**Най-добри практики**:

- Използване на **cursor-based pagination** от backend.
- За infinite scroll използвайте `IntersectionObserver` и **windowed rendering** (напр. `react-window`, `vue-virtual-scroll-list`).

```jsx
<FixedSizeList height={600} itemSize={35} itemCount={items.length}>
  {Row}
</FixedSizeList>
```

- Избягване на зареждане на 100k записи в паметта.

<br />

### 8. Какъв е вашият подход към проектиране на frontend caching стратегия, за да намалите повтарящите се API заявки в React приложение?

**Слоеве на кеширане**:

- **In-memory** с React Query / SWR (`stale-while-revalidate` pattern).
- **Persistent** кеширане чрез IndexedDB или localStorage за статични данни.
- Използване на cache keys + invalidation при mutation.

<br />

### 9. Как проектирате frontend система, която да се справя с пикови натоварвания (напр. Black Friday sales), без да влошава производителността?

- SSR с пълно CDN кеширане на страници.
- Минимизиране на dynamic JS — използване на **islands architecture** или **partial hydration**.
- Показване на graceful loading states, fallback UI за rate-limited API.
- Използване на feature flags, за да **изключвате не-критични функции** по време на пиково натоварване.

<br />

### 10. Как бихте архитектурно проектирали React приложение за поддръжка на Progressive Web App (PWA) функции като push notifications и offline caching?

**Архитектура**:

- Използване на `create-react-app` или Next.js PWA plugin с **Service Workers**.
- Push notifications чрез **Web Push API** + server с VAPID.
- Кеширане на routes/assets чрез Workbox стратегии (`cacheFirst`, `networkFirst`).

```jsx
self.addEventListener('push', event => {
  self.registration.showNotification('New Offer!', {...});
});
```

<br />

### 11. Как проектирате state management система за React app със сложни, взаимозависими UI компоненти?

**Подход**:

- Използване на **Zustand**, **Redux Toolkit** или **Pinia** (Vue).
- Разделяне на global и local state.
- Нормализиране на релационни данни, за да избегнете nesting и circular dependencies.
- Използване на derived selectors и memoization за производителност.

<br />

### 12. Какъв е вашият подход към проектирането на frontend система, която синхронизира данни двупосочно с backend в реално време (напр. collaborative editing)?

**Шаблон**:

- Използване на WebSockets + OT (Operational Transform) или CRDT (напр. Yjs).
- Local changes се прилагат оптимистично.
- Server разрешава конфликти и разпространява актуализации.

```
editor.onChange = (change) => socket.emit('doc:update', change);
```

- Поддържане на versioning или timestamps, за да се предотвратят конфликти.

<br />

### 13. Как бихте проектирали frontend система за управление на client-side data persistence след refresh и между сесиите?

**Инструменти**:

- Използване на `localStorage`/`sessionStorage` за леки данни (напр. theme, tokens).
- Използване на **IndexedDB** за сложни или структурирани данни (напр. offline orders).
- Синхронизиране със memory cache при зареждане.

```livescript
localStorage.setItem('theme', 'dark');
```

<br />

### 14. Как проектирате frontend система, която да обработва rate-limited или ненадеждни API без да компрометира потребителското изживяване?

**Стратегии**:

- Поставяне на заявки в опашка и **retry с backoff**.
- Използване на **circuit breaker pattern** — временно изключване на проблемни функционалности.
- Graceful fallbacks: кеширани данни, skeleton UI, offline mode.

```jsx
axiosRetry(api, { retries: 3, retryDelay: exponentialDelay });
```

<br />

### 15. Какъв е вашият подход към проектиране на frontend система, която поддържа optimistic UI updates, докато гарантира целостта на данните с backend?

**Поток**:

1. **Незабавно актуализиране на UI** state (напр. като пост).
2. Изпращане на async заявка към backend.
3. При грешка, **rollback** към предишното състояние.

```jsx
mutation.mutate(updateItem, {
  onMutate: () => updateCacheLocally(),
  onError: () => rollback(),
});
```

Използвам `react-query` или custom mutation manager за проследяване.

<br />

### 16. Как проектирате frontend система, която да работи с GraphQL backend спрямо RESTful backend?

**Основни разлики**:

- **GraphQL** предлага гъвкави заявки и по-малко round trips.
- **REST** изисква множество endpoints и често over-fetching.

  **GraphQL стратегия**:

- Използване на GraphQL client като **Apollo Client** или **urql**.
- Дефиниране на queries близо до components.
- Използване на вградено кеширане и fragments за модулност.

```tsx
const { data, loading } = useQuery(GET_PRODUCT, { variables: { id } });
```

**REST стратегия**:

- Използване на централен API layer с **Axios** или **fetch**.
- Нормализиране на responses с инструменти като **normalizr**.
- Обработка на pagination/versioning ръчно.

<br />

### 17. Как бихте архитектурно проектирали frontend система за интеграция с legacy backend, който има несъгласувани API и бавни отговори?

**Подход**:

- Въвеждане на **client-side adapter layer** за нормализиране на данните и абстрахиране на особеностите.
- Използване на **API gateways** или **BFF (Backend-for-Frontend)**, когато е възможно, за да се разкачат frontend и backend несъответствия.
- Прилагане на **timeouts**, **caching**, **loading skeletons** и **graceful error handling** за бавни API.

```jsx
async function getNormalizedUser(id) {
  const raw = await legacyAPI.get(`/user/${id}`);
  return { name: raw.username, age: raw.details?.age ?? null };
}
```

<br />

### 18. Какъв е вашият подход към проектирането на frontend система, която поддържа A/B тестове и feature toggles в голям мащаб?

**Системен дизайн**:

- Използване на **feature flag provider** (напр. LaunchDarkly, Unleash или вътрешен).
- Flags трябва да се разрешават **преди рендиране**, за да се избегне flickering (SSR или ранно fetch).
- За A/B тестове интегриране на analytics за записване на поведението на варианти.

```jsx
{
  featureFlags.newCheckout ? <NewCheckout /> : <LegacyCheckout />;
}
```

- Flags трябва да са типизирани, scope-нати и чисто премахнати след експерименти.

<br />

### 19. Как проектирате frontend система, която да сътрудничи с backend екип чрез contract-first подход (напр. OpenAPI, GraphQL schemas)?

**Най-добри практики**:

- Използване на **auto-generated types** от contracts (напр. `graphql-codegen`, `openapi-typescript`).
- Валидиране на requests/responses чрез schema (напр. Zod или Yup).
- Споделяне на **mock servers** или използване на **MSW** за contract testing.

```jsx
// types generated from GraphQL schema
type GetUserQuery = {
  user: { id: string, name: string },
};
```

- Налагане на правила за еволюция на contracts (напр. само адитивни промени), за да се избегнат breaking changes за потребителите.

<br />

### 20. Как бихте проектирали frontend система, която да поддържа множество deployment environments (напр. dev, staging, prod) с различни конфигурации?

**Подход**:

- Екстернализиране на config чрез **environment variables** (напр. `.env.*`).
- Използване на `process.env` (React) или `import.meta.env` (Vite) за injection по време на build.

```
const apiBase = process.env.REACT_APP_API_URL;
```

- Гарантиране, че чувствителните стойности се inject-ват само по време на build и не излизат към client.
- Автоматизиране на deploy-овете с CI/CD pipelines по environment.

<br />

### 21. Как проектирате frontend система, която да се справя с browser compatibility issues в широк набор от устройства и версии?

**Техники**:

- Използване на **autoprefixer** + **Babel polyfills** (чрез `@babel/preset-env`).
- Разпознаване на features чрез **Modernizr** или runtime checks (`'IntersectionObserver' in window`).
- Серверно предоставяне на различни bundles чрез **differential loading** или **[polyfill.io](http://polyfill.io)** .

```jsx
if (!window.fetch) {
  loadPolyfill().then(initApp);
}
```

- Тестване с инструменти като BrowserStack или Playwright.

<br />

### 22. Какъв е вашият подход към проектирането на frontend система с zero-downtime deployments?

**Практики**:

- Използване на **immutable builds** с content hash (напр. `main.abc123.js`) и **atomic deploys**.
- Избягване на breaking changes в API или storage между версии.
- Използване на **feature flags**, за да разкачат deployment от release.

```html
<script src="/static/js/main.[hash].js" defer></script>
```

- Използване на Service Workers (PWA) внимателно, за да се избегнат stale caches (версиониране явно).

<br />

### 23. Как проектирате frontend monitoring система, за да проследявате производителност, грешки и поведение на потребителите в продукция?

**Tooling**:

- Грешки: **Sentry**, **Rollbar** за JS exceptions и stack traces.
- Производителност: **Web Vitals**, custom metrics чрез **Google Analytics**, **Datadog RUM** или **New Relic**.
- Поведение: **FullStory**, **PostHog** или custom event tracking.

```jsx
reportWebVitals((metric) => sendToAnalytics(metric));
```

- Групиране и алармиране на грешки по component/version, с source maps в продукция.

<br />

### 24. Как бихте архитектурно проектирали frontend система за дългосрочна поддръжка от екип с различни умения?

**Стратегии**:

- Налагане на **coding standards** с ESLint, Prettier и strict TypeScript.
- Използване на **design systems** и component libraries (напр. Storybook).
- Осигуряване на ясна folder структура, README docs и linted commit hooks.

```json
"scripts": {
  "lint": "eslint src --ext .js,.ts,.tsx",
  "typecheck": "tsc --noEmit"
}
```

- Подчертаване на **code reviews**, mentoring и писане на тестове (unit + E2E).

<br />

### 25. Какъв е вашият подход към проектирането на frontend система, която може да се възстанови от катастрофални повреди (напр. повредено състояние, претърпяна мрежова изолация)?

**Defense Strategy**:

- Обвиване на stateful logic в **error boundaries**, за да се изолират сривовете.

```tsx
<ErrorBoundary fallback={<Fallback />}>
  <Dashboard />
</ErrorBoundary>
```

- Запазване на критично състояние в **resilient storage** (напр. IndexedDB със schema validation).
- Поставяне на offline actions в опашка и retry с exponential backoff.
- Fallback към кеширано UI, където е възможно (Service Worker, localStorage snapshot).
