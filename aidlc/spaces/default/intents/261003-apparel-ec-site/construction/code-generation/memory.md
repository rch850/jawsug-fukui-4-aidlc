<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-03T07:08:59Z — No units-generation ran (jumped per Plan B), so the engine emitted the single {unit-name} directive; used unit name 'storefront-mockup' for the per-unit artifact dir.
- 2026-10-03T07:08:59Z — 'Application code goes to workspace root' read as 'inside the workspace, not the record dir'; app placed in storefront/ so its ESLint/TS config does not pick up the framework's .claude/tools TypeScript.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-10-03T07:35:18Z — Photo sourcing used Unsplash's unofficial internal /napi endpoint without an API key (the conductor verified and handed this to the developer); reviewer flagged it as outside the official API terms. Bundled photos are Unsplash License (non-premium) and credited; corrected the script comment and README to state this honestly, updated stale fallback search terms, and recommended the official API with an env-var key for any re-fetch.
- 2026-10-03T07:35:18Z — Test volume follows approved NFR-4 (3 domain-logic files, 33 tests), which is narrower than team.md Testing Posture (one test per requirement / happy path per component); UI acceptance criteria were checked only by the developer's throwaway headless-Chrome script. build-and-test should record a manual check procedure.

- 2026-10-03T07:08:59Z — Design inputs come from inception artifacts (requirements, stories, refined-mockups) instead of functional/NFR/infra design, which were skipped by the jump.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
