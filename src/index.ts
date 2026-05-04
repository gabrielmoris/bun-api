import { serve } from "bun";
import { routes } from "./routes";
// import { connectDB } from "./db/mongo";

// const mongoconnection = await connectDB();

const server = serve({
  port: 3000,
  routes,
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);

// TODO:
// 1. Validation with zod
// 2. Add the connection to the mongo db
// 3. add the post and the get
// 4. tests!
