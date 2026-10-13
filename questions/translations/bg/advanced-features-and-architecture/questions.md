### 1. Как бихте внедрили server-side rendering (SSR) в React приложение?

**Подход**: Използвайте framework като **Next.js**, който абстрахира SSR настройката.

**Концепция**:

- SSR рендира React компоненти в HTML на сървъра.
- Това подобрява **инициалното зареждане**, **SEO** и **времето до интерактивност**.

  **Пример с Next.js**:

```tsx
// pages/index.tsx
export default function Home({ user }) {
  return <div>Hello, {user.name}</div>;
}

export async function getServerSideProps() {
  const res = await fetch("https://api.example.com/user");
  const user = await res.json();

  return { props: { user } };
}
```

**Custom SSR** (използвайки `ReactDOMServer`):

```tsx
const html = ReactDOMServer.renderToString(<App />);
```

**Кога да се използва**: Публични страници, които имат нужда от SEO или бързо първо рисуване (напр. landing pages, e-commerce).

<br />

### 2. Каква е разликата между controlled и uncontrolled компоненти в React? Кога да използвате всеки?

**Controlled**: Състоянието на формата се управлява от React чрез `useState`.

```tsx
const [value, setValue] = useState("");
<input value={value} onChange={(e) => setValue(e.target.value)} />;
```

**Uncontrolled**: Състоянието на формата се обработва от DOM чрез `ref`.

```tsx
const inputRef = useRef();
<input ref={inputRef} />;
```

**Кога да се използва**:

- **Controlled**: За динамична валидация, условно активирани полета или сложна логика на формите.
- **Uncontrolled**: За прости форми, неконтролирани полета (file uploads) или сценарии, чувствителни към производителността.

<br />

### 3. Как обработвате error boundaries в React? Можете ли да напишете прост error boundary компонент?

**Концепция**:

Error boundaries улавят **рендиране**, **life cycle** или **constructor** грешки в child компоненти — не event handlers или async code.

**Пример**:

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Регистриране на грешката в мониторинг услуга
    console.error(error, info);
  }

  render() {
    return this.state.hasError ? (
      <h1>Something went wrong.</h1>
    ) : (
      this.props.children
    );
  }
}

// Използване
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>;
```

**Кога да се използва**: Около главни функционални компоненти, маршрути или dynamic imports.

<br />

### 4. Как бихте архитектурирали голямо React приложение с стотици компоненти, за да осигурите мащабируемост и поддръжка?

**Ключови практики**:

- **Модулна структура на папките** по домейн или функционалност:
  ```
  /features/user
  /features/dashboard
  /shared/components
  ```
- **Atomic компоненти** и повторно използваеми UI модели (напр. buttons, inputs).
- **Типова сигурност** с TypeScript.
- **Управление на състоянието** в подходящ диапазон: локално състояние → context → глобално (напр. Redux/Zustand).
- **Code splitting** чрез React.lazy или Next.js dynamic imports.
- **Linting/formatting/testing** стандарти, наложени с tooling (ESLint, Prettier, Jest).
- **Docs и Storybook** за откриване на компоненти и съгласуване с design system.

<br />

### 5. Какво е event delegation pattern и как React го използва в своята synthetic event система?

**Event Delegation**: Един handler (напр. на `document`) следи събития от много child елементи, използвайки event bubbling.

**React’s Synthetic Events**:

- React прикачва един глобален event listener за всеки type събитие към **root DOM container** (не на всеки елемент).
- Събитията са обвити в **SyntheticEvent** за последователно cross-browser поведение.
- React разпространява събитията през **virtual DOM tree** вместо през реалния DOM.

  **Пример**:

```tsx
function App() {
  return <button onClick={() => console.log("clicked")}>Click Me</button>;
}
```

Под капака, този `onClick` се обработва чрез глобален listener на root, което подобрява **производителността** и **ефективността на паметта**.
