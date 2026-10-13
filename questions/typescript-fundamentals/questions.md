### 1. What is TypeScript's type system model, and how does it differ from nominal typing?

TypeScript primarily uses structural compatibility: values are generally compatible when their members have compatible types, regardless of the names of the types they were declared with. Classes and private/protected members introduce additional compatibility rules.

This makes JavaScript objects easy to describe, but it does not guarantee that two structurally similar values have the same meaning. Use branded/opaque types when distinct domain identifiers (such as user IDs and order IDs) should not be mixed accidentally.

### 2. When should you use `unknown`, `any`, and `never`?

- `unknown` can hold any value, but must be narrowed or checked before use. Prefer it for untrusted input.
- `any` disables most checking and can spread unsafety through dependent expressions. Keep it at narrow interoperability boundaries when necessary.
- `never` represents values that cannot occur, such as a function that always throws or the impossible branch after exhaustive narrowing.

For exhaustiveness, assign a remaining discriminated-union value to `never`; the compiler then reports newly added cases that are not handled.

### 3. How do union and intersection types work, and when would you use each?

A union (`A | B`) means a value can be either alternative; code can safely use only members common to all alternatives until it narrows the value. An intersection (`A & B`) requires a value to satisfy both types and combines their members.

Use unions to model alternatives in inputs and results. Use intersections to compose compatible object capabilities, but avoid intersecting conflicting property definitions, which can produce unusable types.

### 4. How do discriminated unions improve modeling and exhaustive handling?

A discriminated union gives each variant a shared property whose literal value identifies that variant:

```ts
type Result =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };
```

Checking `result.status` narrows the remaining properties. Handle every variant explicitly and use a `never` check for the final branch so adding a new status cannot silently leave a code path unhandled.

### 5. What is type narrowing, and how do built-in guards differ from user-defined type guards?

Type narrowing uses control flow to refine a broad type. Built-ins include `typeof`, `instanceof`, equality checks, the `in` operator, and checks against discriminant properties. A user-defined predicate such as `function isUser(value: unknown): value is User` tells the compiler that a check narrows to `User`.

The compiler trusts a predicate's declared result; it does not prove the implementation is correct. Make the runtime checks genuinely validate the properties the predicate claims.

### 6. How do you write a generic function, and what does a generic constraint provide?

Generics preserve relationships between input and output types:

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

A constraint such as `T extends { id: string }` lets an implementation safely use `id` while retaining the caller's more specific type. Prefer inference and the narrowest useful constraint; avoid adding type parameters that do not express a real relationship.

### 7. How do generic inference and explicit type arguments interact?

TypeScript infers type arguments from function arguments and contextual types where possible. Explicit type arguments are useful when inference is ambiguous or when a caller intentionally chooses a broader type, but they can also hide an incorrect API design.

When inference produces a surprising type, inspect the input widening, constraints, and contextual type first. `as const` can preserve literal values, while annotating a variable often widens them to a broader type.

### 8. What are `keyof` and indexed access types used for?

`keyof T` produces a union of the keys of `T`. `T[K]` looks up the type of a property selected by key type `K`.

```ts
function getProperty<T, K extends keyof T>(value: T, key: K): T[K] {
  return value[key];
}
```

This pattern keeps a key and its corresponding value type connected, which is useful for generic property helpers and typed configuration APIs.

### 9. What does `typeof` mean in a TypeScript type position?

In a type position, `typeof value` refers to the static type inferred for a value. Together with `keyof`, it can derive types from runtime constants:

```ts
const routes = { home: "/", profile: "/profile" } as const;
type RouteName = keyof typeof routes;
```

This is different from JavaScript's runtime `typeof` operator, which returns a string and has some historical edge cases (such as `typeof null === "object"`).

### 10. What are mapped types, and how do modifiers such as `readonly` and `?` work?

Mapped types iterate over a key union to create a new object type:

```ts
type Optional<T> = { [K in keyof T]?: T[K] };
```

Mapped types can add or remove optional and readonly modifiers with `?`, `readonly`, `-?`, and `-readonly`. They are useful for systematic transformations; avoid replacing a simple named interface with a complex mapped type unless the transformation is reusable or meaningfully generic.

### 11. How do conditional types and `infer` work?

A conditional type selects a type based on assignability: `T extends U ? X : Y`. When the checked type is a naked type parameter, the conditional distributes over unions. Wrapping it in a tuple (for example, `[T] extends [U]`) disables that distribution.

`infer` introduces a type variable while matching a type pattern, such as extracting a function's return type. Conditional types can become difficult to read when nested; name important intermediate types and test behavior with representative examples.

### 12. Which built-in utility types do you use, and when would you define your own?

Common utilities include `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Parameters<F>`, `ReturnType<F>`, and `Awaited<T>`.

Use them to express straightforward transformations of an existing type. Define a named domain type when the result has business meaning, and avoid long chains of utilities that obscure the actual shape or permit invalid states.

### 13. When should a function use overload signatures instead of a union-typed parameter?

Use a union parameter when one implementation accepts the same set of inputs and has one natural result type. Use overloads when different argument shapes have corresponding, distinct return types that callers should see.

Overload signatures are the public contract; the implementation signature must be compatible with all overloads and is not itself callable from outside. Keep overload sets small, since overlapping signatures can make resolution hard to predict.

### 14. What does `satisfies` do, and how is it different from a type annotation or assertion?

`satisfies` checks that an expression is assignable to a target type without replacing the expression's inferred type with that target. It is useful for validating configuration while retaining useful literal keys and values.

A type annotation gives the variable the annotated type, which may widen it. A type assertion (`as Type`) tells the compiler to treat a value as a type and does not validate it at runtime; assertions should not be used as a substitute for checking data.

### 15. What is variance, and why can function parameter types be surprising?

Variance describes how assignability changes when a type parameter changes. Read-only output positions are commonly covariant; function input positions need contravariant safety so a function is not called with an input it cannot handle. TypeScript has intentional compatibility exceptions, including bivariance in some method and callback contexts.

Enable `strictFunctionTypes` through `strict` and pay attention to callback parameter types. When an assignment seems unsafe, check which side produces a value and which side consumes it rather than assuming generic types are interchangeable.

### 16. How do `readonly` properties and readonly arrays protect data, and what do they not guarantee?

`readonly` prevents reassignment through that particular TypeScript view. `readonly T[]` (or `ReadonlyArray<T>`) prevents array-mutating operations through that reference.

These are compile-time restrictions, not runtime freezing. They are also not automatically deep: nested objects may remain mutable unless their types are readonly too. Use runtime immutability or defensive copying where runtime guarantees are required.

### 17. How do you type an external API response safely?

Treat parsed JSON as `unknown`, not as a trusted interface. Type assertions such as `response.json() as User` only affect the compiler; they do not check the network payload.

Validate the runtime shape at the boundary with explicit checks or a schema-validation library, then return a typed value. Keep transport errors, validation errors, and valid domain data distinguishable so callers can handle them deliberately.

### 18. What are declaration files, and when do you need module augmentation?

Declaration files (`.d.ts`) describe types for JavaScript libraries or runtime APIs without implementing them. Prefer installed package types or existing declarations before writing your own. A local declaration can describe an untyped module, but its types must match the real runtime behavior.

Module augmentation extends an existing module declaration and must follow that module's resolution rules. It changes compiler knowledge, not runtime code, so augmentations should be narrowly scoped and documented.

### 19. What are template literal types and when are they useful?

Template literal types build string-literal types from other literal types, optionally combined with unions:

```ts
type Size = "sm" | "lg";
type SpacingToken = `space-${Size}`; // "space-sm" | "space-lg"
```

They can express constrained event names, keys, and design tokens. They do not validate arbitrary strings at runtime; pair them with runtime checks when values come from users, URLs, or APIs.

### 20. How do you choose compiler settings for a TypeScript application?

Enable `"strict": true` as a baseline; it turns on important checks such as strict null checking and strict function types. Also set module, target, and library options to match the runtime and bundler rather than copying a configuration from another project without understanding it.

TypeScript checks are only as reliable as the declared types and project boundaries. Include type-checking in the normal build/CI workflow, and avoid broad `any`, unchecked assertions, and ignored diagnostics that turn off the protections the team expects.
