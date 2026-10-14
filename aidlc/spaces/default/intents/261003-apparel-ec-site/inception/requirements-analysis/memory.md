<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-03T06:33:06Z — Q4 answer 'a' read as option A; no brand name supplied, so used placeholder fictional brand 'FUKUI BASICS'; real Uniqlo name/logo/images are excluded to avoid impersonation.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-10-03T06:36:06Z — Applied all 8 non-blocking reviewer findings even though the verdict was READY; they were cheap and pin down routes, cart limit and error cases that code-generation would otherwise guess, since application-design is skipped.

- 2026-10-03T06:33:06Z — Tech stack (React + Vite + TypeScript) decided in requirements-analysis instead of application-design, because Plan B jumps over application-design to reach a local mockup within the workshop time box.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-10-03T06:42:49Z — User asked for real free stock photos instead of SVG illustrations; chose Unsplash (free licence, reachable from this machine; Pexels returned 403), excluding Unsplash+ premium images, bundling downloads locally to keep NFR-1, and dropping per-colour recolouring (FR-2.5 became colour swatches).

- 2026-10-03T06:41:22Z — For the requested dummy product images chose bundled SVG clothing illustrations recoloured per product colour over stock-photo URLs (needs network, licence terms, photos would not match our products) or generated photos (not available locally).

- 2026-10-03T06:33:06Z — Kept shipping fee, coupons, search and stock out of scope to fit the 1-hour time box; requirements limited to the browse-to-order happy path plus validation edge cases.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-10-03T06:33:06Z — Production backend / AWS architecture and final brand name are deferred to application-design when the workflow resumes after the mockup.
