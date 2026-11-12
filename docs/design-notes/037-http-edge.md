# 037 — HTTP edge

Every app answers with the security headers of `helmet` and allows a browser from another origin
only when `HTTP_CORS_ORIGINS` lists it. `trust proxy`, the other setting of the edge, belongs to the
request limits (see `003-authentication.md` and `036-production-stack.md`).

## One module for the API routes

`HttpSecuritySetupModule` of `libs/http`, imported by the `AppModule` of all three apps, mounts two
middlewares on every route of the prefix, in this order:

| Middleware           | What it does                                                                      |
| -------------------- | --------------------------------------------------------------------------------- |
| `helmet`             | the security headers, without `X-Powered-By`                                      |
| `HttpCorsMiddleware` | the CORS headers of an allowed origin, and the answer to its preflight with `204` |

**The module lives in DI, not in `main.ts`.** An e2e context built from `AppModule` gets the same
headers as the running app (see `012-app-bootstrap.md`), and the health suite of each app asserts
them.

**The CSP of a JSON response allows nothing.** No route of an app returns a page, so the policy is
`default-src 'none'; frame-ancestors 'none'` and `X-Frame-Options` is `DENY`. The other headers keep
the defaults of `helmet`: `Strict-Transport-Security` for a year with subdomains,
`X-Content-Type-Options: nosniff`, `Cross-Origin-Resource-Policy: same-origin`. A browser applies
`Cross-Origin-Resource-Policy` only to a request without CORS, so it does not stop an allowed
origin.

## CORS from an allowlist

`HTTP_CORS_ORIGINS` is a comma-separated list of origins, `https://app.example.com` without a path
or a trailing slash; Joi refuses any other form. An empty value, the one of the examples, mounts no
CORS at all: the app sends no CORS header, and a browser refuses every call from another origin, as
it did before the setting existed.

**An origin outside the list gets no `Access-Control-Allow-Origin`.** The middleware answers its
preflight with `204` too, without that header, so the browser stops the call itself.

**The token travels in a header, so credentials stay off.** A browser client sends
`Authorization: Bearer`, not a cookie, and the app sends no `Access-Control-Allow-Credentials`. The
allowed headers echo the ones a preflight asks for.

**A browser can read the headers it needs.** `Access-Control-Expose-Headers` lists
`x-correlation-id` and the `Retry-After` and `Retry-After-auth` of the request limits.

## The API reference has its own policy

Scalar at `/<prefix>/reference` is a page, so the strict policy of the API would break it.
`ApiReference.setup` of `libs/openapi` mounts its own `helmet` in front of the page with a policy
for it:

| Directive     | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| `script-src`  | `'self'`, `https://cdn.jsdelivr.net`, a nonce                         |
| `style-src`   | `'self'`, `'unsafe-inline'`                                           |
| `font-src`    | `'self'`, `https://fonts.scalar.com`                                  |
| `img-src`     | `'self'`, `data:`                                                     |
| `connect-src` | `'self'`                                                              |
| the rest      | `default-src`, `base-uri`, `form-action`, `frame-ancestors`: `'none'` |

**The nonce is new for every request.** The first middleware of the route stores a random nonce for
the response, `helmet` writes it into `script-src`, and Scalar puts it on its two script tags: the
bundle from the CDN and the inline script with the document. With a nonce Scalar loads its
single-file bundle, which pulls no further scripts.

**The styles stay inline.** Scalar adds its styles at runtime without a nonce, and a nonce in
`style-src` would make the browser ignore `'unsafe-inline'`.

**The route needs its own headers because it comes first.** `main.ts` mounts the page with `app.use`
before `listen`, and Nest mounts the middlewares of the modules only when the app starts, so the
request of the page never reaches the middlewares of `HttpSecuritySetupModule`.
