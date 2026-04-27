## A production API with:

- Structured error responses — Every error follows a consistent schema. No stack traces in production. Error codes that clients can program against.
- Input validation at the boundary — Validate BEFORE business logic. Reject early, reject clearly. Use a schema-based validator (Zod, Valibot, or similar), not manual if checks.
- Layered architecture — Routes → Service → Repository. Not everything in one file. Each layer has a single responsibility.
- Database safety — Parameterized queries only. Connection pooling. Migrations, not manual schema changes.
- Testing discipline — Unit tests for business logic, integration tests for endpoints, test database that resets between runs.
- CI from day one — Every push runs tests. No manual "it works on my machine."

### Architecture pattern
src/
├── routes/          # HTTP handlers — parse request, call service, format response
├── services/        # Business logic — owns the rules, knows nothing about HTTP
├── repositories/    # Data access — owns SQL, knows nothing about business rules
├── middleware/       # Cross-cutting: error handling, validation, logging
├── schemas/         # Zod/Valibot validation schemas
├── db/              # Migrations, connection setup
└── __tests__/       # Test files mirroring the structure

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