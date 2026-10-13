### 1. Как внедрявате Singleton pattern в React приложение и кога бихте го използвали?

**Концепция:** Осигурява съществуването само на един екземпляр на клас или модул.

**Кога:** Споделени услуги (напр. config, logging, API clients).

```tsx
// singleton.js
let instance;
class Logger {
  constructor() {
    if (instance) return instance;
    instance = this;
  }
  log(msg) {
    console.log(msg);
  }
}
export const logger = new Logger();
```

**В React:** Използва се в service layers извън component tree.

<br />

### 2. Какъв е вашият подход към използване на Factory pattern в JavaScript за създаване на React компоненти динамично?

**Концепция:** Създаване на компоненти според input type.

```
const componentFactory = (type) => {
  switch (type) {
    case 'text': return <TextInput />;
    case 'select': return <SelectInput />;
    default: return <DefaultInput />;
  }
};
```

**Кога:** Динамични форми или dashboard-и с config-driven UI.

<br />

### 3. Как прилагате Builder pattern в React app за конструиране на сложни UI компоненти?

**Концепция:** Конструиране на UI елемент стъпка по стъпка.

```
class CardBuilder {
  constructor() {
    this.card = {};
  }
  setTitle(title) { this.card.title = title; return this; }
  setContent(content) { this.card.content = content; return this; }
  build() {
    return <Card {...this.card} />;
  }
}

```

**Кога:** UI компоненти с много незадължителни части (напр. modals).

<br />

### 4. Каква е ролята на Prototype pattern в JavaScript и как може да се използва в React контекст?

**Концепция:** Споделяне на поведение чрез прототипи вместо класове.

**В React:** Рядко се използва директно, но се среща под капака в JS. Полезен е за разширяване на обекти (напр. custom event systems или polyfills).

```
const proto = {
  greet() { return `Hello ${this.name}`; }
};
const user = Object.create(proto);
user.name = "Alice";
```

<br />

### 5. Как внедрявате Decorator pattern в React приложение, за да подобрите функционалността на компонентите?

**Концепция:** Добавяне на поведение без модифициране на оригинала.

**React Example (HOC):**

```
const withLogger = (Component) => (props) => {
  console.log('Rendered with props:', props);
  return <Component {...props} />;
};
```

**Кога:** Cross-cutting concerns (auth, logging, metrics).

<br />

### 6. Какъв е вашият подход към използване на Adapter pattern в React app за интеграция със legacy API или трети страни библиотеки?

**Концепция:** Превежда един интерфейс в друг.

```
const legacyApi = { fetchData: () => fetch('/old-endpoint') };
const apiAdapter = {
  getData: () => legacyApi.fetchData().then(res => res.json())
};
```

**В React:** Обвиване на трети страни API в стандартизирани service modules.

<br />

### 7. Как прилагате Composite pattern в React за управление на йерархични component структури (напр. tree view)?

**Концепция:** Третирайте индивидуални и composite компоненти по един и същи начин.

```jsx
const TreeNode = ({ node }) => (
  <li>
    {node.label}
    {node.children && (
      <ul>
        {node.children.map((child) => (
          <TreeNode node={child} />
        ))}
      </ul>
    )}
  </li>
);
```

<br />

### 8. Каква е вашата стратегия за използване на Facade pattern в React app, за да опростите взаимодействията със сложни subsystems?

**Концепция:** Осигурява унифициран интерфейс към сложни subsystems.

```
// apiFacade.js
export const api = {
  getUser: () => fetch('/user'),
  getSettings: () => fetch('/settings')
};
```

**React Use:** Централизирани service modules за чиста component логика.

<br />

### 9. Как внедрявате Proxy pattern в JavaScript за React app, за да контролирате достъпа до ресурси?

**Концепция:** Контролира достъпа до обект (напр. caching, validation).

```
const api = new Proxy(fetch, {
  apply(target, thisArg, args) {
    console.log('Fetching:', args[0]);
    return target(...args);
  }
});
```

**Кога:** Logging, caching, lazy-loading.

<br />

### 10. Какъв е вашият подход към използване на Module pattern в React codebase, за да капсулирате логиката?

**Концепция:** Капсулира логиката в самостоятелна единица.

``` 
// counterModule.js
let count = 0;
export const counter = {
  increment: () => ++count,
  get: () => count
};
```

**React Use:** Споделена utility логика или stateful services.

<br />

### 11. Как внедрявате Observer pattern в React приложение за event-driven комуникация?

**Концепция:** Subject уведомява observer-ите при промяна на състоянието.

```
class EventBus {
  observers = [];
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}
```

**React Use:** Pub/sub за споделяне на state между micro-frontends или tabs.


<br />

### 12. Какъв е вашият подход към прилагането на Strategy pattern в React за динамично превключване между алгоритми или поведения?

**Концепция:** Разменя алгоритми/стратегии по време на изпълнение.

```
const sortStrategies = {
  byName: (a, b) => a.name.localeCompare(b.name),
  byAge: (a, b) => a.age - b.age
};
const sortData = (data, strategy) => data.sort(sortStrategies[strategy]);
```

**React Use:** Динамична UI логика (filters, layouts, validations).

<br />

### 13. Как използвате Command pattern в React app, за да капсулирате действия (напр. undo/redo функционалност)?

**Концепция:** Капсулира потребителски команди (undo/redo).

```
class Command {
  execute() {}
  undo() {}
}
class AddItemCommand extends Command {
  execute() { /* добави */ }
  undo() { /* премахни */ }
}
```

**React Use:** Form builders, canvas editors.

<br />

### 14. Каква е вашата стратегия за внедряване на Mediator pattern в React app, за да координирате няколко компонента?

**Концепция:** Централен обект координира комуникацията.

```
const mediator = {
  notify: (sender, event) => {
    if (event === 'save') console.log(`${sender} triggered save`);
  }
};
```

**React Use:** Dialog systems or loosely-coupled dashboards.

<br />

### 15. Как прилагате Chain of Responsibility pattern в React app за обработка на последователни задачи?

**Концепция:** Предава request по веригата, докато бъде обработен.

```
const handlerA = (req, next) => req.type === 'A' ? 'Handled A' : next(req);
const handlerB = (req) => req.type === 'B' ? 'Handled B' : 'Unhandled';

const chain = (req) => handlerA(req, handlerB);
```

**React Use:** Middleware-like UI logic, form validation chains.

<br />

### 16. Как използвате Higher-Order Component (HOC) pattern в React и какви са предимствата и недостатъците му?

**Концепция:** Функция, която добавя поведение към компонент.

```
const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading ? <Spinner /> : <Component {...rest} />;
```

**Pros:** Reusability, separation of concerns

**Cons:** Prop collision, nesting complexity

<br />

### 17. Какъв е вашият подход към внедряване на Render Props pattern в React за споделяне на логика между компоненти?

**Концепция:** Споделяне на логика чрез function-as-child.

```jsx
<MouseTracker render={({ x, y }) => <Cursor x={x} y={y} />} />
```

**Use:** Reusable logic without HOC pitfalls.

<br />

### 18. Как проектирате Provider pattern (напр. Context API) в React за глобално състояние или конфигурация?

**Концепция:** Използвайте React Context, за да инжектирате глобални стойности.

```
const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [theme] = useState("dark");
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
```

**Use:** Auth, theming, config, localization.

<br />

### 19. Каква е вашата стратегия за прилагане на Container/Presentational pattern в React app?

**Концепция:** Разделяте логиката (container) от гледната точка на визуализацията (presentational).

```jsx
// Container
const UserContainer = () => {
  const [user, setUser] = useState(null);
  return <UserProfile user={user} />;
};

// Presentational
const UserProfile = ({ user }) => <div>{user?.name}</div>;
```

**Use:** Testing, reuse, separation of concerns.

<br />

### 20. Как обучавате екип да избира и внедрява design patterns в React codebase?

- Използвайте **реални примери** и **code walkthroughs**.
- Документирайте повторно използваните patterns в **споделен guide или design system**.
- Насърчавайте **pattern discussions в code reviews**.
- Използвайте **pair programming**, за да укрепите дизайна на мисленето.

**Цел:** Да помогнете на разработчиците да избират patterns според намерението, а не само според познатост.
