## A production API with:

- Structured error responses — Every error follows a consistent schema. No stack traces in production. Error codes that clients can program against.
- Input validation at the boundary — Validate BEFORE business logic. Reject early, reject clearly. Use a schema-based validator (Zod, Valibot, or similar), not manual if checks.
- Layered architecture — Routes → Service → Repository. Not everything in one file. Each layer has a single responsibility.
- Database safety — Parameterized queries only. Connection pooling. Migrations, not manual schema changes.
- Testing discipline — Unit tests for business logic, integration tests for endpoints, test database that resets between runs.
- CI from day one — Every push runs tests. No manual "it works on my machine."

### Architecture pattern
```text
src/
├── routes/          # HTTP handlers — parse request, call service, format response
├── services/        # Business logic — owns the rules, knows nothing about HTTP
├── repositories/    # Data access — owns SQL, knows nothing about business rules
├── middleware/       # Cross-cutting: error handling, validation, logging
├── schemas/         # Zod/Valibot validation schemas
├── db/              # Migrations, connection setup
└── __tests__/       # Test files mirroring the structure
```

### Every API error response structure
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Documentation
https://bun.sh/docs/runtime/http/server

### Decisions
I chose SQLite instead of PostgreSQL/Redis because this project targets a single-instance deployment and prioritizes operational simplicity, cost, and portability. Bun provides built-in SQLite support, which reduces infrastructure dependencies while still allowing structured persistence, caching, and rate limiting in one embedded store. This tradeoff is appropriate for a small API on free or low-cost hosting with persistent disk, but I would switch to PostgreSQL plus Redis if the service needed horizontal scaling, shared cache state, or higher write concurrency across multiple instances.