<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-03T06:07:29Z — Q3 options A and B overlap for this intent; A was worded 'always, for greenfield' which is effectively the org.md scope-dependent default. For a greenfield workshop intent both yield a gated skeleton Bolt 1; they differ only for later bugfix/refactor/security-patch intents. User asked for clarification, explained in chat.

- 2026-10-03T06:12:59Z — Stage prose orders report-approved (Step 5.5) before practices-promote (Step 6) but Step 7 says not to mark the stage complete if promote fails; interpreted as: on Approve run practices-promote first, then set the timestamp, then report approved.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-10-03T06:12:59Z — Q2 answer (merge commit) overrides the org.md squash-merge default for this team; recorded in team.md Way of Working as --strategy merge so the Bolt worktree merge picks it up. Trunk-based KB runbook assumes squash, so the merge strategy is a deliberate team deviation.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-10-03T06:12:59Z — Q5 'no deploy this time' is an intent-level choice, but the Deployment section is a team-wide practice; per F1 (A) recorded the org default as the team standard plus a workshop-scope exception (no real deploy, Operation phase limited to design artifacts) rather than writing 'never deploy' into team.md.
- 2026-10-03T06:12:59Z — Testing Posture Minimal (Nyquist) reconciled with phases/construction.md 'happy path + at least two error/edge cases per test file' by stating Minimal governs test count while each test file still meets the construction guardrail, instead of asking the user to pick one.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-10-03T06:12:59Z — Repo has no git remote, so the Code Style practice 'CI blocks merge on lint/format failure' has no CI to run on yet; CI platform (GitHub Actions vs CodeBuild) to be settled in ci-pipeline (3.7).
- 2026-10-03T06:12:59Z — No AWS credentials in this session (aws-mcp failed to connect); not blocking because workshop does no real deploy, but environment-provisioning/infra design may want read-only pricing/IaC lookups.
- 2026-10-03T06:13:59Z — Framework issue: runtime-graph.json memory_path omits the intent record segment (aidlc/spaces/default/intents/inception/... instead of .../261003-apparel-ec-site/inception/...), so 'aidlc-learnings.ts surface' reads a missing file and returns 0 candidates; candidates were surfaced by hand from the directive's memory_path. Also upstream-coverage sensor fails on greenfield because it ignores 'conditional_on: brownfield' consumes (advisory false positive).
