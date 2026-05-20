import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getCorsHeaders } from "../../middleware/cors";

function makeRequest(origin?: string): Request {
  return new Request("http://localhost/api/test", {
    headers: origin ? { origin } : {},
  });
}

describe("getCorsHeaders", () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    process.env.ALLOWED_ORIGINS = originalEnv;
  });

  it("returns the matching origin when it is in the allowlist", () => {
    process.env.ALLOWED_ORIGINS = JSON.stringify([
      "https://www.gabrielcmoris.com",
      "https://other.com",
    ]);
    const req = makeRequest("https://www.gabrielcmoris.com");
    const headers = getCorsHeaders(req);
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://www.gabrielcmoris.com",
    );
  });

  it("falls back to ALLOWED_ORIGINS[0] when origin is not in the list", () => {
    process.env.ALLOWED_ORIGINS = JSON.stringify([
      "https://www.gabrielcmoris.com",
    ]);
    const req = makeRequest("https://wrong.com");
    const headers = getCorsHeaders(req);
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://www.gabrielcmoris.com",
    );
  });

  it("returns empty string when ALLOWED_ORIGINS is empty and origin is unknown", () => {
    process.env.ALLOWED_ORIGINS = JSON.stringify([]);
    const req = makeRequest("https://wrong.com");
    const headers = getCorsHeaders(req);
    expect(headers.get("Access-Control-Allow-Origin")).toBe("");
  });

  it("sets Vary: Origin", () => {
    process.env.ALLOWED_ORIGINS = JSON.stringify([
      "https://www.gabrielcmoris.com",
    ]);
    const req = makeRequest("https://www.gabrielcmoris.com");
    const headers = getCorsHeaders(req);
    expect(headers.get("Vary")).toBe("Origin");
  });

  it("sets Access-Control-Allow-Credentials to true", () => {
    process.env.ALLOWED_ORIGINS = JSON.stringify([
      "https://www.gabrielcmoris.com",
    ]);
    const req = makeRequest("https://www.gabrielcmoris.com");
    const headers = getCorsHeaders(req);
    expect(headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });
});
