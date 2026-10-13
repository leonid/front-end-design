### 1. How do you design an authentication flow in a React application using OAuth 2.0 with a third-party provider (e.g., Google, Auth0)?

I’d use Authorization Code Flow with Proof Key for Code Exchange (PKCE) as the default for a React single-page application (SPA). The flow starts with the user being redirected to the identity provider, then the provider returns an authorization code, and the frontend sends that code to a backend or trusted token exchange endpoint. The backend exchanges it for access and refresh tokens, then stores the refresh token in a secure `httpOnly` cookie and keeps the access token in memory. This reduces token exposure to JavaScript and is much safer than storing tokens in browser storage. I’d also keep redirect URIs strict, enforce logout and revocation flows, and avoid treating the frontend as the trust boundary for session issuance.

### 2. What’s your approach to implementing JSON Web Token (JWT)-based authentication in a React app, including token storage and refresh mechanisms?

I prefer short-lived access tokens and refresh tokens with rotation. The access token should live in memory so it is not exposed to browser storage, while the refresh token should be stored in an `httpOnly` secure cookie. When the app receives a `401` (unauthorized) response, it calls a refresh endpoint and exchanges the refresh token for a new access token. I avoid `localStorage` because it is vulnerable to Cross-Site Scripting (XSS) and makes token theft much easier. I also use a refresh timer and a clear re-auth flow when refresh fails, so the app can handle expiry gracefully without silently breaking the user session.

### 3. How do you handle multi-factor authentication (MFA) in a React frontend, and what UX considerations do you prioritize?

I treat multi-factor authentication (MFA) as part of the authentication flow, not as a separate feature. After the user validates their username and password, I check whether multi-factor authentication (MFA) is enforced and then show the challenge step, such as Time-based One-Time Password (TOTP), SMS code, or a passkey-based flow. For UX, I care about clarity, progress, and fallback paths. A user should understand what is happening, should be able to retry if a code fails, and should not be locked out without a clear recovery path. The flow should feel seamless, but it must never hide the fact that an additional verification step is required.

### 4. What’s your strategy for managing user sessions in a single-page application (SPA) with React?

I manage sessions around token lifetime, inactivity, and revocation. In practice, I use short-lived access tokens, inactivity timers, and a refresh strategy that renews before expiry. I keep only minimal user identity and role data in application state and avoid storing sensitive auth data in Redux or Zustand if it can be avoided. I also handle expired sessions by redirecting the user to a login flow or prompting for re-authentication. The goal is to keep the app responsive without leaving the user in an ambiguous “logged in but unauthorized” state.

### 5. How would you implement a role-based access control (RBAC) system in a React application using authentication data?

I’d keep the permission model server-driven and use the frontend only to enforce a smoother UX. The JSON Web Token (JWT) or user profile can include roles and permissions, and the app can check those values before rendering routes or protected components. For example, I might check `user.permissions.includes("admin:view")` before rendering an admin screen. At the same time, I treat client-side checks as a convenience, not as the real security boundary. The backend must still enforce permissions on every protected request because the frontend is not trustworthy in a security context.

### 6. How do you design a logout mechanism in a React app that ensures all client-side state and tokens are securely cleared?

A reliable logout flow includes both client cleanup and server invalidation. I clear in-memory auth state, reset route guards, and remove any client-side session data that has been cached. If I use a session cookie, I also call a backend logout endpoint to revoke the refresh token and clear the cookie. This prevents the session from remaining valid even after the frontend state is cleared. A logout is only complete when the server-side session is invalidated and the client state is reset to a logged-out state.

### 7. What’s your approach to handling authentication in a server-side rendered React application (SSR)?

In server-side rendering (SSR), I prefer validating session state on the server using secure cookies rather than relying on client-side tokens. The server reads the cookie, checks the session or token, and decides whether to render the page or redirect to login before sending HTML to the browser. This is especially important for initial page loads, because hydration alone does not guarantee that the client has the correct auth state. I’d also avoid exposing sensitive auth material to the browser and keep authorization logic on the server wherever possible.

### 8. How do you integrate an authentication system with Redux or Zustand for global state management?

I keep auth state separate from the general UI state. The app stores only minimal values such as user identity, roles, and session status, while sensitive data like tokens stays outside the store. I’d centralize auth actions like login, refresh, logout, and session expiry in a dedicated auth slice or store module. This keeps the logic predictable and easier to test. The main idea is to treat auth as a structured domain, not as a scattered set of flags across the app.

### 9. What’s your process for handling authentication errors such as expired tokens or invalid credentials?

I centralize auth error handling in one place, usually an interceptor or custom request service. If a request responds with `401`, the app can attempt a silent refresh. If the refresh fails, it logs the user out and redirects them to the login experience. Invalid credentials are handled separately so the UX can tell the difference between a bad login and an expired session. I also keep error messages user-friendly and avoid exposing internals, while preserving a clean and deterministic recovery path in the application.

### 10. How do you design a frontend authentication system to support cross-domain or cross-origin scenarios, such as micro-frontends?

For cross-origin apps, I’d prefer a shared identity provider and a centralized auth boundary instead of letting each application manage its own session logic. If apps share a domain, I can use secure cookies and credentialed requests. If they are on different origins, I rely on the identity provider and carefully define trust boundaries, including Cross-Origin Resource Sharing (CORS) and cookie settings. In micro-frontends, I avoid duplicated token logic and instead use a common auth service or a shared session boundary. The main goal is consistency and security, not each app deciding independently how to handle auth.

### 11. What’s the most challenging security vulnerability you’ve encountered in a frontend application, and how did you address it?

One of the most challenging issues I’ve seen was a Cross-Site Scripting (XSS) vulnerability caused by unsanitized user input being rendered with `innerHTML`. The root cause was a trust boundary violation: data coming from users was treated as trusted HTML. I addressed it by removing the unsafe rendering path, sanitizing content with DOMPurify, and switching to safer rendering methods. I also added validation for the input and tightened backend sanitization so the problem could not be reintroduced. The key lesson was that user-generated content must always be treated as untrusted until it has been properly validated and sanitized.

### 12. How do you protect a React application from Cross-Site Request Forgery (CSRF) attacks?

I’d protect state-changing requests by using `SameSite` cookies, Cross-Site Request Forgery (CSRF) tokens for unsafe methods, and a backend validation check on each mutation. For a cookie-based authentication model, `SameSite=Lax` or `Strict` reduces the risk of cross-site requests, while Cross-Site Request Forgery (CSRF) tokens add explicit protection for actions like form submissions or token refresh requests. I also avoid storing auth tokens in `localStorage` because that makes them easier to misuse if a script executes unexpectedly. Cross-Site Request Forgery (CSRF) prevention should be enforced at the request boundary, not just in the frontend.

### 13. What’s your approach to securing API calls from a React frontend to prevent man-in-the-middle (MITM) attacks?

I’d ensure the app only communicates over Hypertext Transfer Protocol Secure (HTTPS) with valid certificates and enforce Hypertext Transfer Protocol (HTTP) Strict Transport Security (Hypertext Transfer Protocol (HTTP) Strict Transport Security (HSTS)) for the origin. I’d also keep auth tokens out of browser storage whenever possible and prefer secure cookies or a trusted backend exchange flow. The important point is not just “use Hypertext Transfer Protocol Secure (HTTPS),” but “enforce certificate validation, secure transport, and safe token handling.” In production, I’d also review Cross-Origin Resource Sharing (CORS) rules and restrict which origins are allowed to call the API so the trust boundary remains explicit.

### 14. How do you design a React application to prevent sensitive data exposure in the browser?

I’d keep sensitive data out of the DOM, browser storage, and logs. That means never logging tokens, secrets, or personally identifiable information, and avoiding the placement of sensitive values in app bundles or debug output. I also keep error messages generic so they do not expose internal details, and I minimize telemetry for user-sensitive data. The browser is not a secure storage boundary, so any sensitive state should be kept to a minimum, protected well, and removed from places where it is unnecessary.

### 15. What’s your strategy for securing third-party scripts or libraries in a React application?

I treat third-party dependencies as a trust boundary. I keep them updated, run audits with tools like `npm audit` or Snyk, and prefer libraries with a strong security record. For external scripts, I use Subresource Integrity (SRI) and restrict trusted domains with a strong Content Security Policy (CSP). I also avoid loading arbitrary scripts from untrusted origins. The app is only as secure as its dependency chain, so security review must include package hygiene and script loading policy.

### 16. How do you implement input validation and sanitization in a React frontend to prevent injection attacks?

I validate input at the UI for better user experience, but I rely on the backend as the real enforcement point for security. On the frontend, I use controlled components and pattern-based validation, and I sanitize untrusted HTML before rendering it. For example, if a field allows rich text, I use DOMPurify before inserting the content into the DOM. The key distinction is that validation checks whether input matches expected rules, while sanitization removes dangerous content before it can be interpreted. Both matter, but sanitization is essential when untrusted data is rendered in HTML or markdown.


<br />

### 17. What’s your approach to designing a Content Security Policy (CSP) for a React application?

I’d start with a restrictive default policy and then allow only the explicit origins and asset types the app actually needs. A basic setup would include `default-src 'self'`, `object-src 'none'`, and a narrow `script-src` policy that allows only trusted CDNs or inline script hashes if they are truly required. In practice, I’d also use nonces for inline scripts where possible and test in report-only mode before enforcing the policy in production. The goal is to reduce the attack surface without breaking legitimate functionality, and I’d treat Content Security Policy (CSP) as part of the overall defense-in-depth strategy rather than a one-time configuration step.

### 18. How do you handle security in a React application deployed in a zero-trust environment?

In a zero-trust model, I assume every request, origin, and client context must be verified. That means I validate identity and authorization on every protected interaction, not just at login, and I enforce least privilege for any frontend-accessible resources. I also require encrypted transport, strict Cross-Origin Resource Sharing (CORS) boundaries, short-lived tokens, and explicit validation of trust assumptions around session state. The frontend should never be treated as implicitly trusted, even if it is rendering a valid page. Zero trust is especially important in distributed systems where multiple services and applications rely on a shared trust model.

### 19. What’s your process for conducting a security audit of a React frontend before a major release?

I’d start with static analysis and dependency review, then move to runtime checks around auth and sensitive flows. That includes linting and security rules, dependency audits with tools like `npm audit` or Snyk, and review of any third-party code that touches user input or auth. I’d also test the real attack paths: login, logout, token refresh, cross-origin requests, and any place where user-generated content is rendered. Finally, I check the app in production-like conditions for exposed logs, debug data, and unexpected client-side leakage. A meaningful frontend security review is not just a package scan; it includes verifying behavior under realistic attack conditions.

### 20. How do you design a frontend system to comply with security standards like the General Data Protection Regulation (GDPR) or the Health Insurance Portability and Accountability Act (HIPAA)?

I’d design around data minimization, explicit consent, and clear user control. That means collecting only what is necessary, storing consent in a secure and auditable way, and providing mechanisms for access, deletion, and opt-out where required. For privacy-sensitive use cases, I avoid keeping Protected Health Information (PHI) in the frontend unless it is strictly necessary and I ensure it is encrypted in transit and at rest. I also separate user data from operational logs and ensure that any security or compliance requirements are reflected in both the product design and the backend handling of data. Compliance is not just a legal checkbox; it is a design constraint that affects how data is stored, displayed, and protected.
