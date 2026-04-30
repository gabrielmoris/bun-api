import { serve } from "bun";
// import { connectDB } from "./db/mongo";

// const mongoconnection = await connectDB();

const server = serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World from Bun API!");
  },
});

console.log(`Server running on http://localhost:${server.port}`);

// TODO:

// 2. Create the first route
// 3. Add the connection to the mongo db
