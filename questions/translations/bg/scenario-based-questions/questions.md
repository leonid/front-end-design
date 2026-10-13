### 1. Проектирайте повторно използваем компонент за модален прозорец в React, който може да се извиква от всякъде в приложението.

**Подход** : Използвайте context и портали.

```tsx
// ModalContext.tsx
const ModalContext = createContext(null);
export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [content, setContent] = useState(null);

  return (
    <ModalContext.Provider value={{ setContent }}>
      {children}
      {content &&
        ReactDOM.createPortal(
          <div className="modal-backdrop">{content}</div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
```

**Употреба** :

```tsx
const { setContent } = useModal();
setContent(<MyModalContent onClose={() => setContent(null)} />);
```

<br />

### 2. Как бихте се справили със ситуация, в която React компонент трябва да извлече данни от множество API и да комбинира резултатите?

**Подход** :

- Използвайте `Promise.all` или `async/await`.
- Комбинирайте резултатите в `useEffect`.

```tsx
useEffect(() => {
  const fetchData = async () => {
    const [user, posts] = await Promise.all([
      fetch("/api/user").then((res) => res.json()),
      fetch("/api/posts").then((res) => res.json()),
    ]);
    setData({ user, posts });
  };
  fetchData();
}, []);
```

**Бонус** : Добавете статуси за зареждане/грешка и използвайте `AbortController` за почистване.

<br />

### 3. Представете си, че ви е възложено да рефакторизирате голяма, лошо поддържана React кодова база. От къде бихте започнали?

**Подход** :

1. **Проверете** кодовата база: структура, linting, дублираща се логика, мъртъв код.
2. **Въведете linting/форматиране** : ESLint, Prettier.
3. **Изолирайте повторно използваните компоненти** в директория `shared/`.
4. **Добавете тестове** за критични сценарии преди рефакторинг.
5. **Преобразувайте класовите компоненти в hooks**, където е възможно.
6. **Постепенно типизирайте с TypeScript** , започвайки от utils и споделени компоненти.

<br />

### 4. Как бихте реализирали функционалност, при която потребител може да влачи и пуска елементи в списък в React приложение?

**Инструмент** : Използвайте `@dnd-kit/core` или `react-beautiful-dnd`.

**Пример с `react-beautiful-dnd`** :

```tsx
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="list">
    {(provided) => (
      <ul {...provided.droppableProps} ref={provided.innerRef}>
        {items.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided) => (
              <li
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {item.name}
              </li>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </ul>
    )}
  </Droppable>
</DragDropContext>
```

<br />

### 5. Вие сте натоварени да ръководите екип за създаване на dashboard с данни в реално време в React. Как бихте подходили?

**Архитектура** :

- Използвайте **WebSockets** или **SSE** за актуализации в реално време.
- **Redux/Context/Zustand** за управление на споделено състояние.
- **Fallback с polling**, ако е необходимо.

  **Стратегия за компоненти** :

- Разделете widget-ите на изолирани компоненти.
- Ограничете актуализациите чрез debouncing, за да намалите повторните рендери.
- Показвайте състояния за зареждане/скелетни каркаси.

  **Инфраструктура** :

- Използвайте WebSocket manager и логика за реконекция.
- Ограничете скоростта на актуализациите за производителност.

<br />

### 6. Как бихте се справили със ситуация, в която заинтересована страна иска функция, която е в конфликт с целите за производителност или достъпност?

**Подход** :

- **Съпричастност** : Потвърдете целите им.
- **Образование** : Споделете въздействието (напр. бавно зареждане, счупена клавиатурна навигация).
- **Демонстрация** : Създайте малък POC, показващ компромиса.
- **Компромис** : Предложете алтернатива, която отговаря и на бизнес и на техническите нужди.
- **Документация** : Запишете решенията и преглеждайте отново, ако данните покажат, че си струва да се повтори.

<br />

### 7. Проектирайте повторно използваем компонент за таблица с данни в React със сортировка, филтриране и пагинация.

**API на високо ниво** :

```tsx
<DataTable
  data={data}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
  ]}
  pagination={{ pageSize: 10 }}
  onSort={(key, direction) => {}}
  onFilter={(query) => {}}
/>
```

**Съображения за внедряване** :

- Обработвайте локална vs. сървърна пагинация/сортировка.
- Използвайте memoization (`useMemo`) за производни данни.
- Извличайте визуализацията на редовете чрез render prop.

<br />

### 8. React приложение, което наследихте, няма тестове и лоша документация. Как бихте ръководили усилията за подобряването им?

**План** :

1. **Инвентаризирайте критичните потоци** (напр. вход, checkout).
2. Първо напишете **интеграционни тестове** с React Testing Library.
3. Въведете **unit тестове** за логиката на помощните функции и споделените компоненти.
4. Използвайте **JSDoc** и Storybook за подобряване на разработчиците документация.
5. Установете CI pipeline с проследяване на покритието и lint checks.
6. Създайте **ръководство за участие**, което да налага contrib-ът с тестове.

<br />

### 9. Как бихте интегрирали трета страна API с лимити за честота в React приложение, без да влошавате потребителското изживяване?

**Стратегии** :

- **Ограничете** или **debounce** извикванията (напр. с Lodash).
- Използвайте **кеширане** (напр. `SWR`, `React Query`), за да избегнете дублиращи се заявки.
- **Backoff и retry** при 429 отговори.
- Осигурете optimistic UI или loading skeletons, за да намалите възприеманото забавяне.
- Ако е необходимо, проксирайте през backend, за да управлявате глобално лимитите за честота.

```tsx
const fetcher = async (url) => {
  const res = await fetch(url);
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1000)); // просто backoff
    return fetcher(url);
  }
  return res.json();
};
```
