import { defineMiddleware } from 'astro:middleware';

// trailingSlash is "never", so /peptide-store-build/ is not a route.
// Send the slashed address to the real one instead of the dev 404.
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return context.redirect(pathname.slice(0, -1) + search, 308);
  }
  return next();
});
