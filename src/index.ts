import { serve } from "bun";

const server = serve({
  port: 3001,
  fetch(req) {
    return new Response("Hello World from Bun API!");
  },
});

console.log(`Server running on http://localhost:${server.port}`);
