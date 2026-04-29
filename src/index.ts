import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World from Bun API!");
  },
});

console.log(`Server running on http://localhost:${server.port}`);

// TODO:
// 1. add a mongodb service in the Compose file.
// 2. Create the first route
// 3. Add the connection to the mongo db
