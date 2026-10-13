### 1. How do JavaScript's primitive and object values behave differently when copied or compared?

Primitive values such as strings, numbers, booleans, `null`, `undefined`, `bigint`, and symbols are copied as values. Objects are accessed through references, so assigning an object copies the reference, not the object:

```js
const first = { count: 1 };
const second = first;
second.count = 2;
console.log(first.count); // 2
```

Two separately created objects are not equal with `===`, even when their properties match. This matters when updating UI state: create a new object or array when a change should be observable, and do not mistake a shallow copy for a deep clone.

### 2. What is the difference between `==`, `===`, and `Object.is`?

- `===` compares values without coercing types. Objects compare by identity.
- `==` applies coercion rules before comparing; it has special cases such as `null == undefined`.
- `Object.is` is mostly like `===`, except `Object.is(NaN, NaN)` is true and `Object.is(0, -0)` is false.

Prefer `===` for application logic unless coercion is deliberate and documented. The `==` behavior is specified, but relying on its less-obvious conversions makes conditions harder to review.

### 3. How do truthiness and type coercion affect expressions such as `||`, `??`, and `+`?

`||` uses truthiness, so it replaces values such as `0`, `false`, and `""`. `??` only replaces `null` and `undefined`, which is generally safer for defaults where zero or an empty string are valid. The `+` operator adds numbers or concatenates strings after primitive conversion, so `"2" + 1` is `"21"` while `"2" - 1` is `1`.

Use explicit conversion at data boundaries (`Number(value)`, for example) and choose `??` when only absent values should trigger a default.

### 4. What are the differences between `var`, `let`, and `const`, including hoisting and the temporal dead zone?

`var` is function-scoped (or global-scoped at script top level), can be redeclared, and is initialized to `undefined` when its scope is entered. `let` and `const` are block-scoped, cannot be redeclared in the same scope, and cannot be accessed before their declaration is evaluated; that interval is the temporal dead zone.

All three declarations are processed before execution in some sense, but that does not mean they can all be safely read early. Use `const` by default, `let` for reassignment, and avoid `var` in modern code.

### 5. How do closures work, and what common bugs can they cause?

A closure is a function together with access to its lexical environment. It keeps access to bindings from the scope in which it was created, even after that scope has returned.

Closures are useful for callbacks and encapsulation, but callbacks may observe changing bindings or preserve references longer than intended. A classic bug comes from declaring a loop counter with `var`, causing callbacks to share one function-scoped binding; `let` creates a new binding for each loop iteration. In UI code, check effect dependencies and cleanup when a callback could retain stale values or resources.

### 6. How is `this` determined in JavaScript, and how do arrow functions differ?

For a normal function, `this` is determined by how it is called: `object.method()` supplies `object`, while extracting the method and calling it alone does not preserve that receiver. `call`, `apply`, and `bind` can set the receiver explicitly. Arrow functions do not have their own `this`; they capture it lexically from the surrounding scope.

Use arrow functions for callbacks that should inherit surrounding `this`. Use normal methods when the call-site receiver is meaningful, and be careful when passing object methods as callbacks.

### 7. How do property lookup and the prototype chain work?

When reading `object.name`, JavaScript first checks the object's own properties, then follows its `[[Prototype]]` links until it finds the property or reaches `null`. The `in` operator checks both own and inherited properties; `Object.hasOwn(object, "name")` checks only the object's own properties.

This delegation model underlies class instances too: methods are normally placed on the class prototype and shared by instances. When processing untrusted keys, avoid assuming every property is an own property.

### 8. What does `class` syntax do, and what are its relationship and differences with prototypal inheritance?

JavaScript `class` syntax provides a structured way to create constructor functions and prototype-based inheritance. Instance methods are generally stored on the prototype; static methods belong to the class constructor. A subclass can call `super`, but instances still participate in the prototype chain.

Classes do not turn JavaScript into a classical, nominal type system: objects can still be composed or delegated to dynamically. Prefer composition when inheritance would couple unrelated behavior.

### 9. What is the difference between shallow and deep copying an object?

Object spread and `Object.assign` make shallow copies: top-level properties are copied, but nested objects remain shared references.

```js
const copy = { ...original };
copy.settings === original.settings; // true if settings is an object
```

For structured-cloneable data, `structuredClone` can create a deep copy, but it is not suitable for every value (for example, functions). Choose an update strategy based on the data shape; do not assume a shallow spread recursively copies nested state.

### 10. How do you explain the iterable and iterator protocols?

An iterable exposes a `[Symbol.iterator]()` method that returns an iterator. An iterator has a `next()` method that returns `{ value, done }`. Arrays, strings, maps, and sets are built-in iterables; `for...of`, spread, and array destructuring consume iterables.

This distinction is useful when implementing custom collections or streaming values: an iterable can create an iterator, while the iterator tracks traversal state.

### 11. What are generator functions, and when would you use them?

A generator declared with `function*` returns an iterator. Each `yield` pauses execution and provides a value; calling `next()` resumes the generator. Generators can lazily produce sequences and can be composed with iterator utilities.

They are useful when values should be produced on demand, but they are not a general replacement for promises: synchronous generators pause between yielded values, while `async function*` supports asynchronous iteration.

### 12. What are symbols and well-known symbols used for?

Symbols are unique primitive values often used as property keys without colliding with ordinary string keys. Well-known symbols define language protocols; for example, `Symbol.iterator` makes an object iterable and `Symbol.toStringTag` can customize its object tag.

Symbol-keyed properties are not returned by `Object.keys`, but they can be inspected with `Object.getOwnPropertySymbols` or `Reflect.ownKeys`. Symbols do not make a property private or secure; code with access to the symbol can still use it.

### 13. How should errors be handled across synchronous code and promise-based asynchronous code?

Use `try`/`catch` for synchronous exceptions and for rejections from promises that are awaited inside the `try` block. A promise chain should return or await the promise so that rejection handling remains connected to the caller. An un-awaited promise can reject after the surrounding `try` has already completed.

Add context at meaningful boundaries, preserve the original cause when rethrowing (`new Error("...", { cause })` where supported), and avoid swallowing failures or treating every error as recoverable.

### 14. Explain the event loop, tasks, microtasks, and rendering without oversimplifying them.

JavaScript execution runs to completion on an agent's call stack. Hosts such as browsers schedule tasks (often called macrotasks) and microtasks. Promise reactions and `queueMicrotask` use the microtask queue; the host drains microtasks at defined checkpoints before moving on. Browsers may update rendering between task processing, but exact scheduling depends on the host and context.

Do not assume that every asynchronous browser API maps directly to one generic "macrotask." When debugging order, identify the specific API and host behavior, then verify with a small reproducible example.

### 15. When would you use a Web Worker, `requestAnimationFrame`, or `requestIdleCallback`?

- Use a **Web Worker** for CPU-heavy work that can run without direct access to the DOM; communicate through messages.
- Use **`requestAnimationFrame`** for visual updates that should be synchronized with a browser repaint.
- Use **`requestIdleCallback`** for non-urgent work when supported, with a fallback and without making user-visible progress depend on it.

These APIs solve different scheduling problems. Moving work to another callback does not make expensive work cheap; measure and split work where necessary.

### 16. What browser-specific runtime constraints should frontend engineers account for?

The browser exposes host APIs such as the DOM, `fetch`, storage, timers, and workers; these are not all part of the ECMAScript language itself. They may be unavailable in another runtime, restricted by origin/security policy, or fail asynchronously. A page can also be hidden, suspended, navigated away, or lose its network connection.

Keep browser-only code behind clear boundaries when sharing modules with server-side or test environments. Handle cancellation and cleanup for listeners, timers, observers, and requests.

### 17. How do ES modules behave, and what is the difference between a live binding and a copied value?

ES module imports are read-only live bindings to exported values: if the exporting module updates an exported `let`, importers observe the updated binding. Modules are evaluated once per module graph and have their own scope. This differs from CommonJS, whose `require` returns an exported value/object and whose loading semantics are not identical.

Prefer explicit imports and exports. Be aware that circular dependencies can expose bindings before initialization and create confusing evaluation order.

### 18. What causes memory leaks in JavaScript if the runtime has garbage collection?

Garbage collection can reclaim objects that are no longer reachable; it cannot reclaim objects that remain reachable accidentally. Common causes include unremoved event listeners, timers, observers, retained DOM nodes, unbounded caches, and closures that keep large object graphs alive.

Use cleanup functions, bound cache sizes, and heap snapshots to compare retained objects. A rising memory graph alone does not prove a leak; inspect what remains reachable after the relevant work should have ended.

### 19. How would you debug an unexpected JavaScript output or ordering bug in an interview?

First write down the relevant rules: scope and bindings, value types and coercion, the call site for `this`, and whether each operation is synchronous or queued. Then trace the code in execution order and distinguish identity from structural similarity.

For async behavior, mark task and microtask boundaries rather than guessing. Confirm the trace with a minimal runnable example or debugger, then explain both the result and a clearer implementation.

### 20. How would you safely store arbitrary user-provided keys in a JavaScript collection?

For arbitrary string keys, `Map` avoids special object-property names and clearly separates data keys from object methods. If a plain object is required, create a null-prototype dictionary with `Object.create(null)` and use own-property checks such as `Object.hasOwn`.

Do not merge untrusted objects into configuration objects without validation; unexpected keys can affect prototypes or override sensitive options. Validate expected key names and value types at the boundary.
