# US-004: Implement deterministic seeded random utility

## Status: Complete

## Files Created
- `src/domain/types.ts` — `SeededRandom` interface and `Seed` type alias
- `src/domain/seed.ts` — PRNG implementation with all utility functions

## Implementation Decisions
- **PRNG algorithm**: mulberry32 — simple, fast, 32-bit state, fully deterministic. Sufficient for generative art; not cryptographic.
- **Hash function**: FNV-1a variant for converting seed strings to 32-bit integers. Good distribution, minimal collision risk for practical use.
- **Seed format**: URL-safe alphanumeric strings (`[a-zA-Z0-9_-]+`), 12 characters for generated seeds.
- **`generateSeed()`** uses `Math.random()` intentionally — it is the only function allowed to do so, as it creates initial seeds, not generator output.
- **`deriveSeed()`** is a pure function (combines parent seed + key via hashing), independent of any RNG state.

## Acceptance Criteria
- [x] Same seed always produces same random sequence
- [x] Different seeds produce different random sequences
- [x] Seed values are URL-safe strings
- [x] Generator modules do not call `Math.random()` directly
- [x] Helper exists for deriving repeatable sub-seeds (`deriveSeed`)
- [x] Utility has unit tests (40 tests passing)

## Verification
- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — 77 tests pass (40 for US-004)
