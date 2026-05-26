import { serve } from 'bun';
import { routes } from './routes';
import { initBookmarksTable } from './db/bookmarkModel';

initBookmarksTable();

const server = serve({
  port: 3000,
  routes,
  fetch(_req) {
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
