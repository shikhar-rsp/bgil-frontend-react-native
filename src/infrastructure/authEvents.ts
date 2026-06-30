/**
 * Auth event bridge.
 *
 * The web API layer redirected to the login route via `window.location.href`
 * when a token refresh failed (forced logout). React Native has no `window`, so
 * the API layer instead calls `emitUnauthorized()` and the navigation layer
 * registers a handler via `setOnUnauthorized()` (see App.tsx) to reset the stack
 * back to the login screen.
 */
type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export const setOnUnauthorized = (fn: UnauthorizedHandler | null): void => {
  handler = fn;
};

export const emitUnauthorized = (): void => {
  handler?.();
};
