import { defineMiddleware } from 'astro:middleware';

// trailingSlash is "never", so /peptide-store-build/ is not a route in dev.
// Skip this while the static build renders a page: that request uses the folder
// address, and saving the redirect would replace route/index.html with the
// "Redirecting from /route/ to /route" stub Vercel then serves as the page.
export const onRequest = defineMiddleware((context, next) => {
  if (context.isPrerendered) return next();
  const { pathname, search } = context.url;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return context.redirect(pathname.slice(0, -1) + search, 308);
  }
  return next();
});
