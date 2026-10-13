### 1. Как проектирате micro-frontend архитектура за голямо React приложение, разделено между множество екипи?

**Отговор:**

Започвам, като разделям приложението по **граници на домейна** (напр. auth, dashboard, checkout) и назначавам собственост по екип. Всеки екип изгражда своя micro-frontend (MFE) независимо, често деплоиран отделно.

**Подходи:**

- **Module Federation (Webpack 5)** за runtime интеграция.
- **Single-SPA** за routing и orchestration.
- **iframes** (рядко, за legacy изолация).

**Пример (Module Federation):**

```
// Host (app-shell)
import('checkout/CheckoutApp');

// checkout webpack.config.js
new ModuleFederationPlugin({
  name: 'checkout',
  filename: 'remoteEntry.js',
  exposes: {
    './CheckoutApp': './src/CheckoutApp',
  },
});
```

<br />

### 2. Какъв е вашият подход към управлението на споделени зависимости в React micro-frontend екосистема?

**Отговор:**

Използвам **Webpack Module Federation `shared` config**, за да избегна дублиране:

```
shared: {
  react: { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true },
}
```

Ключови съображения:

- **Фиксиране на версии** между repo-ове (чрез `.npmrc` или споделен `package.json` base).
- Използвам **peerDependencies**, когато пакетирам компоненти.
- Подравнявам резолюцията на dependency-ите по време на CI, за да хващам конфликти рано.

<br />

### 3. Как обработвате споделяне на състояние между micro-frontends в React app?

**Отговор:**
Използвам едно от следните според нуждите от изолация:

- **Global event bus** (напр. `window.dispatchEvent`) за слабо свързване.
- **Споделен state container** (като `zustand`, `redux` или `valtio`), изложен чрез Module Federation:

```
// host consumes remote store
import useCartStore from 'cart/store';
```

- **Персонален pub/sub service** или **RxJS** за комуникация между приложения.

Поддържам споделено състояние минимално, за да запазя независимостта на MFE.

<br />

### 4. Каква е вашата стратегия за routing в React micro-frontend приложение?

**Отговор:**
Две често срещани стратегии:

- **Single-SPA** или router на host-а делегира собствеността на route-овете на MFEs:

```
<Route path="/checkout/*" element={<CheckoutApp />} />
```

- **Независими routers** в MFEs, които се монтират под конкретни base paths:

```
<BrowserRouter basename="/checkout">...</BrowserRouter>
```

Използвам URL префикси и последователна структура на route-овете, за да избегна конфликти.

<br />

### 5. Как гарантирате последователен UI/UX между micro-frontends, изградени от различни екипи?

**Отговор:**

- Изграждаме и поддържаме **design system** като споделен пакет (Storybook + npm).
- Налагам **linting, theming, spacing и responsive правила** чрез CI.
- Използвам **CSS-in-JS** или **CSS Modules**, за да избегна style leakage.

По избор: прилагам **runtime theming** или design tokens, за да обединя брандирането.

<br />

### 6. Какъв е вашият подход към тестването на React micro-frontend приложение end-to-end?

**Отговор:**

- Всеки MFE трябва да има **unit + integration тестове** (Jest, RTL).
- За **E2E** използвам инструменти като **Cypress** или **Playwright** срещу **integrated shell**.
- Моквам API чрез **MSW** или тестови backend среди.
- Стартирам тестовете **паралелно** по MFE в CI, за да намаля времето за build.

<br />

### 7. Как деплойвате micro-frontends в CI/CD pipeline за React проект?

**Отговор:**

- Всеки MFE се деплойва независимо, често към CDN или S3.
- Излагам MFEs чрез `remoteEntry.js` (Module Federation).
- CI/CD стъпки:
  1. Lint, test, build
  2. Upload artifacts (напр. към S3)
  3. Update host manifest или config

Използвам **semantic versioning** и **env-specific remotes**, за да поддържам multi-env тестване.

<br />

### 8. Какъв е вашият процес за отстраняване на проблеми в React micro-frontend приложение, когато проблемите обхващат множество модули?

**Отговор:**

1. Повтарям проблема в integrated dev environment.
2. Проверявам **browser console/network** за липсващ или неправилен `remoteEntry.js`.
3. Използвам **source maps** и **host logs** за проследимост.
4. Добавям **version tags** към всеки MFE по време на build.
5. Използвам **dynamic imports** с logging, за да проверя поведението при зареждане.

Добавям feature flags, за да изключвам селективно MFEs и да ускоря изолирането.

<br />

### 9. Как обработвате оптимизацията на производителността в micro-frontend архитектура?

**Отговор:**

- Използвам **code splitting** в рамките на всеки MFE.
- Използвам **tree shaking** и споделени библиотеки, за да намаля размера на bundle-ите.
- Включвам **HTTP/2 или preloading** за remote chunks.
- Lazy-load MFEs:

```
const CheckoutApp = React.lazy(() => import('checkout/CheckoutApp'));
```

- Кеширам `remoteEntry.js` с long-lived headers и cache-busting versioning.

<br />

### 10. Как въвеждате екип в micro-frontend подход в React codebase?

**Отговор:**

1. Осигурявам **архитектурна документация** и диаграми на високо ниво.
2. Настройвам **template repos** с tooling (напр. Module Federation, testing).
3. Организирам **onboarding сесии** и walkthrough-и.
4. Въвеждам **developer portal** за откриване на remotes, shared modules и design system usage.
5. Pair programming + code reviews, фокусирани върху границите и API договорите.

Поддържам вътрешните API прости и interface-driven, за да минимизирам силното свързване.
