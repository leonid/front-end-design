### 1. Защо са разработени Single Page Applications (SPAs) и какви проблеми са имали за цел да решат в сравнение с традиционните multi-page applications (MPAs)?

SPAs намаляват пълните презареждания на страницата, като динамично актуализират интерфейса чрез client-side JavaScript. Това решава latency и UX проблеми в MPAs, където всяка навигация изисква round trip до сървъра и пълен DOM re-render.

<br />

### 2. Какъв исторически контекст (напр. възможности на браузърите, напредък в JavaScript) доведе до възхода на SPAs в уеб разработката?

Възходът на SPAs съвпадна с:

- Напредъка в AJAX (XMLHttpRequest, по-късно `fetch`)
- Модерните JS двигатели (V8, Chakra), които направиха тежката client-side логика осъществима
- Натиска към по-отзивчив, desktop-подобен UX в браузърите (напр. Gmail)

<br />

### 3. Как обяснявате компромисите, които доведоха до приемането на SPAs пред MPAs, на нетехнически заинтересована страна?

SPAs се чувстват по-бързи, защото се актуализират само части от страницата. MPAs презареждат цялата страница, което може да се усеща тромаво. SPAs намаляват времето за изчакване след първоначалното зареждане, но изискват повече усилия за SEO и производителност.

<br />

### 4. Какви са ключовите предимства на SPAs, които оправдаха разработката им, и как се вписват в съвременните изисквания към уеб приложения?

- Безпроблемен UX (без презареждане)
- По-добра възприемана производителност
- По-лесно създаване на отзивчиви, mobile-подобни преживявания
- По-лесна отделеност на front/backend development

<br />

### 5. Как ограниченията на традиционните server-rendered MPAs (напр. презареждане на страници, latency) повлияха на философията на дизайна зад SPAs?

MPAs страдаха от latency (пълни зареждания), ненужен рендер и тромав UX. SPAs преместиха отговорността за рендирането към браузъра, за да предложат почти незабавни преходи и по-гладки взаимодействия.

<br />

### 6. Какво е вашето мнение защо SPAs станаха стандартен избор за framework-и като React, Angular и Vue.js?

Тези framework-и бяха създадени, за да решат сложността на UI, като позволяват реактивно, управлявано от състояние рендиране — идеално за SPAs. Те предлагаха routing, data fetching и component models, които естествено се вписваха в single-page преживявания.

<br />

### 7. Как оценявате дали SPA е правилният архитектурен избор за конкретен проект спрямо MPA?

Използвайте SPA, когато:

- Имате нужда от висока интерактивност (dashboards, apps)
- Производителността след първоначалното зареждане има значение
- Създавате mobile/desktop-подобно преживяване
  Избягвайте SPAs за съдържателно богати или SEO-критични уебсайтове, освен ако не е наличен SSR.

<br />

### 8. С какви предизвикателства се сблъскаха ранните SPA реализации и как modern tools ги адресираха?

- Лош SEO (без server-rendered HTML)
- Дълго първоначално зареждане
- Проблеми с browser history
- Сигурност (експониране на API към client)
  Modern tools като Next.js, SSR, hydration и lazy loading решават повечето от тях.

<br />

### 9. Как обучавате екип за целта и предимствата на SPAs при преход от MPA codebase?

- Обяснявате SPA lifecycle и routing
- Представяте concepts като hydration, lazy loading
- Подчертавате client-side state и component-driven design
- Показвате реални примери (напр. React Router)

<br />

### 10. Какво е вашето мнение за еволюцията на SPAs от създаването им и къде смятате, че парадигмата ще се движи в бъдеще?

SPAs се развиват към **хибридни apps** с:

- SSR/SSG (напр. Next.js)
- Islands architecture
- Partial hydration
  Бъдещата посока подчертава производителност, SEO и developer experience.

<br />

### 11. Как работи routing в Single Page Application и как се различава от traditional server-side routing?

- SPA routing е **client-side** чрез History API (`pushState`)
- MPA routing е **server-driven** чрез HTTP заявки
  SPA router-ите прихващат link clicks и визуализират views динамично, без презареждане.

<br />

### 12. Какъв е вашият подход към внедряването на client-side routing в React SPA с React Router?

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</BrowserRouter>;
```

<br />

### 13. Как управлявате state в React SPA при навигация между routes?

Използвайте:

- Global state (напр. Zustand, Redux)
- URL query params за route-specific state
- `localStorage` или `sessionStorage` за persist-ване

<br />

### 14. Какви са предизвикателствата при работа с browser history и навигация назад/напред в SPA?

- Управление на `back/forward` без презареждане
- Възстановяване на scroll positions
- Deep linking & state persistence

React Router обработва голяма част от това чрез `<BrowserRouter>` и `useNavigate`.

<br />

### 15. Как оптимизирате SPA routing performance, за да минимизирате забавянията при навигация?

- **Code splitting** чрез `React.lazy` и `Suspense`
- **Prefetching** на данни или chunks
- Използвайте `memo`, `useMemo` и `useCallback`, за да избегнете ненужни рендари

<br />

### 16. Каква е вашата стратегия за обработка на 404s или невалидни routes в React SPA?

`<Route path="*" element={<NotFound />} />`
Обработвайте невалидни маршрути с fallback компоненти и по желание redirect към безопасни страници.

<br />

### 17. Как интегрирате server-side rendering (SSR) с SPA routing в React приложение, за да подобрите SEO?

Използвайте framework-и като **Next.js**:

- Рендирайте страници на сървъра с `getServerSideProps`
- Подобрете SEO с значими `<head>` тагове и pre-rendered content

<br />

### 18. Какъв е вашият подход към сигурността на routes в React SPA (напр. protected routes, изискващи автентикация)?

Използвайте pattern за protected route:

```jsx
const PrivateRoute = ({ children }) =>
  isAuthenticated ? children : <Navigate to="/login" />;
```

Интегрирайте проверки за токени, role-based access и redirect за неупълномощени потребители.

<br />

### 19. Как тествате SPA routing logic в React приложение, за да сте сигурни в надеждността на навигационните сценарии?

Използвайте:

- **React Testing Library** за симулация на навигация
- **Cypress/Playwright** за E2E route transitions
- Mock route params и history

Пример:

```jsx
render(
  <MemoryRouter initialEntries={["/dashboard"]}>
    <App />
  </MemoryRouter>
);
```

<br />

### 20. Как отстранявате routing проблеми в React SPA, когато навигацията се провали или визуализира неочаквано съдържание?

- Използвайте **React DevTools** + browser DevTools (network, console)
- Проверявайте `window.history` state
- Валидирайте route configuration
- Проверявайте dynamic imports и lazy components за проблеми с fallback/render
