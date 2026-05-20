export function getCorsHeaders(req: Request): Headers {
  const allowedOrigins = JSON.parse(
    process.env.ALLOWED_ORIGINS ?? "[]",
  ) as string[];

  const origin = req.headers.get("origin");
  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : (allowedOrigins[0] ?? "");

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");

  return headers;
}

export function withCors(req: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(req);

  corsHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function handlePreflight(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
