import { serve } from "bun";
import { routes } from "./routes";

const server = serve({
  port: 3000,
  routes,
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
