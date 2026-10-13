export type Importance = "essential" | "important" | "specialist";

export interface Track {
  label: string;
  description: string;
}

export const tracks = [
  { id: "foundations", label: "Core foundations", description: "Language, browser, markup, styling, and accessible UI fundamentals." },
  { id: "interface-engineering", label: "Interface engineering", description: "Frameworks, application behavior, state, and object-oriented design." },
  { id: "quality-delivery", label: "Quality and delivery", description: "Testing, reliability, security, performance, and shipping software." },
  { id: "architecture-scale", label: "Architecture and scale", description: "System design, integrations, platforms, and long-term technical choices." },
  { id: "senior-practice", label: "Senior practice", description: "Communication, leadership, and realistic interview scenarios." },
] as const satisfies readonly (Track & { id: string })[];

export type TrackId = typeof tracks[number]["id"];

export interface TopicMetadata {
  label: string;
  track: TrackId;
  importance: Importance;
  order: number;
  description: string;
}

export const topicCatalog = {
  "javascript-language-fundamentals": { label: "JavaScript Fundamentals", track: "foundations", importance: "essential", order: 1, description: "Language behavior, runtime, and browser JavaScript." },
  "typescript-fundamentals": { label: "TypeScript Fundamentals", track: "foundations", importance: "essential", order: 2, description: "Types, inference, generics, and safe data boundaries." },
  "html-mental-models": { label: "HTML and the DOM", track: "foundations", importance: "essential", order: 3, description: "Semantic markup, document structure, and browser behavior." },
  "css-mental-models": { label: "CSS Fundamentals", track: "foundations", importance: "essential", order: 4, description: "Layout, cascade, responsive design, and rendering." },
  "css-and-styling": { label: "CSS and Styling Practice", track: "foundations", importance: "important", order: 5, description: "Styling systems, theming, and component design." },
  "web-accessibility": { label: "Web Accessibility", track: "foundations", importance: "essential", order: 6, description: "Inclusive interaction, semantics, keyboard use, and testing." },
  "typescript-and-javascript": { label: "JavaScript in React (Legacy Set)", track: "foundations", importance: "important", order: 7, description: "Earlier mixed language questions contextualized around React." },

  "core-react-vue-concepts": { label: "React and Vue Fundamentals", track: "interface-engineering", importance: "essential", order: 1, description: "Rendering, components, lifecycle, and framework trade-offs." },
  "object-oriented-programming": { label: "Object-Oriented Programming", track: "interface-engineering", importance: "important", order: 2, description: "OOP concepts and pragmatic JavaScript/TypeScript design." },
  "state-management": { label: "State Management", track: "interface-engineering", importance: "important", order: 3, description: "State ownership, data flow, and shared application state." },
  "single-page-applications": { label: "Single-Page Applications", track: "interface-engineering", importance: "important", order: 4, description: "Routing, navigation, and SPA trade-offs." },
  "advanced-features-and-architecture": { label: "Application Architecture", track: "interface-engineering", importance: "important", order: 5, description: "Rendering strategies, composition, and application structure." },
  "design-patterns": { label: "Design Patterns", track: "interface-engineering", importance: "specialist", order: 6, description: "Reusable design approaches and the costs they introduce." },

  "testing": { label: "Testing", track: "quality-delivery", importance: "essential", order: 1, description: "Test strategy, useful coverage, and confidence in behavior." },
  "frontend-security": { label: "Frontend Security", track: "quality-delivery", importance: "essential", order: 2, description: "Threat modeling, safe rendering, and browser security." },
  "performance-optimization-and-core-web-vitals": { label: "Performance and Core Web Vitals", track: "quality-delivery", importance: "essential", order: 3, description: "Measure, diagnose, and improve user-perceived performance." },
  "web-performance-budgets-and-optimization-strategies": { label: "Performance Budgets", track: "quality-delivery", importance: "important", order: 4, description: "Set performance targets and protect them over time." },
  "build-tools-and-bundlers": { label: "Build Tools and Bundlers", track: "quality-delivery", importance: "important", order: 5, description: "Build pipelines, bundling, and developer tooling." },
  "ci-cd-and-monitoring-tools": { label: "CI/CD and Monitoring", track: "quality-delivery", importance: "important", order: 6, description: "Ship safely and observe frontend behavior in production." },

  "frontend-system-design": { label: "Frontend System Design", track: "architecture-scale", importance: "essential", order: 1, description: "Design robust, scalable user-facing systems and explain trade-offs." },
  "frontend-backend-collaboration-and-api-design": { label: "API Design and Collaboration", track: "architecture-scale", importance: "important", order: 2, description: "Contracts, API integration, and cross-team boundaries." },
  "deep-frontend-development": { label: "Deep Frontend Engineering", track: "architecture-scale", importance: "important", order: 3, description: "Cross-cutting engineering judgment and production concerns." },
  "micro-frontends": { label: "Micro-Frontends", track: "architecture-scale", importance: "specialist", order: 4, description: "Independent frontend delivery and its organizational trade-offs." },
  "pwas-and-offline-capabilities": { label: "PWAs and Offline Support", track: "architecture-scale", importance: "specialist", order: 5, description: "Service workers, caching, and resilient offline experiences." },
  "emerging-trends-and-future-proofing": { label: "Emerging Trends", track: "architecture-scale", importance: "specialist", order: 6, description: "Evaluate evolving tools and make durable technical choices." },

  "scenario-based-questions": { label: "Interview Scenarios", track: "senior-practice", importance: "essential", order: 1, description: "Practice framing and communicating solutions to realistic problems." },
  "teamwork-and-best-practices": { label: "Teamwork and Best Practices", track: "senior-practice", importance: "important", order: 2, description: "Collaboration habits and sustainable team practices." },
  "leadership-and-team-collaboration": { label: "Leadership and Collaboration", track: "senior-practice", importance: "important", order: 3, description: "Influence, mentoring, decision-making, and team leadership." },
} satisfies Record<string, TopicMetadata>;

export const importanceLabels: Record<Importance, string> = {
  essential: "Core",
  important: "Important",
  specialist: "Specialist",
};
