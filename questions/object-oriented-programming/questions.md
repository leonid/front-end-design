### 1. What are the core ideas commonly associated with object-oriented programming?

The commonly taught ideas are **encapsulation**, **abstraction**, **inheritance**, and **polymorphism**. They are ways to organize state and behavior, not a checklist that every design must satisfy through classes.

In frontend work, choose the simplest model that makes responsibilities and change boundaries clear. JavaScript supports object-oriented techniques, but also supports functional and compositional styles.

### 2. What is encapsulation, and how can JavaScript and TypeScript support it?

Encapsulation groups implementation details behind an intentional interface so callers depend on behavior rather than internal representation. Closures can hide state; JavaScript classes can use `#private` fields for runtime-enforced private fields; TypeScript's `private` modifier is enforced by the type checker but is erased at runtime.

Encapsulation is not simply making every field private. Expose the operations callers need, avoid unnecessary getters/setters, and keep invariants enforced where state changes.

### 3. What is abstraction, and how can you tell whether an abstraction is useful?

An abstraction presents a smaller contract while hiding details that callers should not need to manage. A useful abstraction reduces repeated reasoning and gives a stable boundary; an unhelpful one adds indirection without hiding meaningful complexity.

For example, a data-access function can hide transport and response parsing while exposing domain operations and explicit errors. Keep the abstraction aligned with a real responsibility, and avoid speculative generality.

### 4. What is polymorphism, and how can it appear without class inheritance?

Polymorphism allows code to work with values that provide a common behavior while each value supplies its own implementation. In JavaScript this can use duck typing or composition; in TypeScript, structurally compatible objects can satisfy an interface without explicitly declaring that they implement it.

For example, a formatter can accept any object with a `format` method. This can make extension easier, but callers should validate untrusted runtime data rather than relying only on static types.

### 5. How does inheritance work in JavaScript, and what trade-offs come with class hierarchies?

Class inheritance links prototypes: a subclass inherits lookup behavior from its parent and can override methods. This can reuse behavior, but subclasses become coupled to parent assumptions and changes; deep hierarchies can make behavior difficult to trace.

Use inheritance when there is a stable “is-a” relationship and substitutability holds. Prefer composition when behavior varies independently or the relationship is primarily code reuse.

### 6. What is composition over inheritance, and when is it useful in frontend code?

Composition builds behavior by combining smaller objects, functions, or components instead of inheriting from a base class. In UI code, capabilities can be passed as props, composed with hooks, or provided through narrow services.

Composition is useful when features need to vary independently and when a base class would accumulate conditionals. It can still become over-engineered if behavior is split into too many tiny abstractions.

### 7. What is the difference between an interface and an abstract class in TypeScript?

An interface describes a structural contract and is erased at runtime. A class can implement multiple interfaces. An abstract class is a runtime JavaScript class that can provide shared implementation and require subclasses to implement abstract members; classes can extend only one class.

Prefer interfaces for describing capabilities and object shapes. Use an abstract class when sharing implementation and lifecycle/invariant behavior is genuinely valuable. Neither construct validates external data at runtime.

### 8. How do access modifiers in TypeScript differ from JavaScript private fields?

TypeScript `public`, `protected`, and `private` modifiers control access during type checking, but ordinary TypeScript `private` is not a runtime security boundary. JavaScript `#field` syntax enforces private access at runtime and is represented in emitted JavaScript when the target requires it.

Choose based on the needed guarantee and compilation target. Do not treat either mechanism as a way to protect secrets delivered to a browser; client code and data are inspectable by users.

### 9. What is the Liskov Substitution Principle, and how can a frontend design violate it?

The Liskov Substitution Principle says a subtype should be usable wherever its base type is expected without breaking the base contract. A subtype that strengthens preconditions, weakens postconditions, or violates expected invariants is not safely substitutable.

For example, a component or service that claims to implement a common interface but silently rejects valid base inputs violates callers' expectations. Prefer narrower capability interfaces or composition when behavior is not truly substitutable.

### 10. What does the Open/Closed Principle mean, and how do you avoid turning it into over-abstraction?

The Open/Closed Principle encourages designs that can support expected extensions without repeatedly editing stable core logic. Strategies, registries, and well-defined component slots can help when variation is real.

It does not mean every function needs a plugin system. Start with the simplest design, identify likely variation points from actual requirements, and introduce extension mechanisms only when they reduce change cost.

### 11. How do the Single Responsibility and Interface Segregation principles apply to frontend modules?

Single Responsibility suggests a module should have one coherent reason to change, not necessarily one method. Interface Segregation suggests clients should not depend on methods they do not use.

For example, separate a large API client by domain responsibilities and expose small capabilities to consumers. Avoid splitting code mechanically into many files or creating interfaces for every implementation detail.

### 12. What does Dependency Inversion mean, and how can dependency injection be used in a frontend app?

Dependency Inversion encourages high-level policy not to depend directly on low-level details; both should depend on stable abstractions. Dependency injection supplies a dependency from outside instead of constructing it deep inside a consumer.

A UI feature can receive an API client through a provider, constructor, or function argument, making it easier to test or replace. Do this where there is a real boundary; a global service locator can obscure dependencies rather than clarify them.

### 13. How do you decide whether to model a behavior with inheritance, composition, or a plain function?

Use a plain function for a stateless transformation, composition for assembling independent capabilities, and inheritance when a true subtype relationship shares stable behavior and invariants.

Consider who owns state, which parts vary, how consumers test the behavior, and how changes propagate. Do not choose a pattern because it is described as more “object-oriented”; optimize for clear contracts and low coupling.

### 14. How do method overriding and dynamic dispatch work with JavaScript classes?

When a method is called on an instance, property lookup finds the most specific implementation on the instance or its prototype chain. A subclass can override a method; calling `super.method()` invokes the parent implementation with the current receiver.

Overriding makes dynamic dispatch possible, but fragile base-class assumptions can break subclasses. Keep contracts explicit and test subclass behavior through the base contract.

### 15. What are class fields, instance methods, and static methods, and when should behavior be static?

Instance fields hold per-instance state. Prototype methods are shared by instances. Static fields and methods belong to the class constructor and are not available on instances.

Use static behavior for operations genuinely associated with the class but not with a particular instance, such as a named factory. If a function has no meaningful relationship to the class, a module-level function may be clearer.

### 16. How would you design an object that protects a business invariant?

Keep state changes behind operations that validate the invariant. For example, a `Cart` might expose `addItem` and `removeItem` while preventing invalid quantities, instead of letting arbitrary callers mutate its internal item array.

In frontend applications, server-side validation remains authoritative for security and business correctness. Client-side objects can improve UX and maintain local consistency, but must not be treated as a trusted enforcement boundary.

### 17. How do composition and dependency injection improve testability, and what are their limits?

A consumer that accepts a narrow dependency can be tested with a fake implementation without replacing global state. Composed pure functions are often easy to test directly. These techniques also make dependencies visible.

Too many injection layers can make simple behavior hard to follow, and mocks can drift from real behavior. Use integration tests for important wiring and reserve fakes for boundaries where controlling behavior is useful.

### 18. What does the Single Responsibility Principle not mean?

It does not mean one class per method or one file per tiny operation. “Responsibility” is best understood as a coherent reason for a module to change, often tied to a domain behavior or stakeholder.

Group related behavior, keep boundaries explicit, and refactor when a unit develops multiple unrelated reasons to change—not merely because it has several methods.

### 19. How would you review an OOP design that uses a base class for every UI component?

Ask whether the hierarchy expresses stable substitutable types or is being used only to share implementation. Check how many conditional flags and overrides exist, whether subclasses can honor the parent contract, and whether composition or framework-native component composition would be simpler.

Propose a small change that reduces coupling, then test the behavior at its public boundary. OOP is one tool; a framework's own composition model may be the more natural design.

### 20. How can OOP concepts and functional programming work together in a frontend codebase?

They are complementary. A class can own a stateful resource such as a WebSocket connection, while pure functions transform data and UI components compose behavior declaratively. The important decision is where state and side effects live and how contracts are tested.

Avoid ideological rules such as “everything must be a class” or “classes are always bad.” Choose the approach that makes mutation, ownership, and dependencies easiest to understand.
