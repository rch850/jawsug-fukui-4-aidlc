# Project-Level Rules

> Project-specific overrides and corrections. Overrides aidlc-team.md
> and aidlc-org.md. Populated by practices-discovery and the
> self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project deviates from team-wide practice in a
> stable, durable way (e.g., "this monorepo project rebases even though
> our team default is squash"; "this legacy project skips the test
> floor because the existing suite is unsalvageable and we accept
> that").

## Way of Working

<!-- Project-specific override. Example: -->
<!-- This monorepo project rebases instead of squash-merging because -->
<!-- the per-package commit history is the audit trail we depend on -->
<!-- for partial-rollback decisions. Override applies to this project -->
<!-- only. -->

## Walking Skeleton

<!-- Project-specific override. Example: -->
<!-- This project skips the walking skeleton because we're rewriting -->
<!-- an existing service in-place — there's no greenfield bootstrap -->
<!-- to gate. -->

## Testing Posture

<!-- Project-specific override. -->

## Deployment

<!-- Project-specific override. -->

## Code Style

<!-- Project-specific override. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER 認証情報・API キー・決済情報をソースコード／設定ファイル／テストにハードコードしない。環境変数またはシークレット管理（AWS Secrets Manager / SSM Parameter Store など）から読み込む (affirmed 2026-10-03)
- NEVER カード番号・セキュリティコードなどのカード会員データを自社のシステム（DB・ログ・キャッシュを含む）に保存しない。決済は PCI DSS 準拠の決済代行サービスに委ね、自社には決済代行が発行するトークン／参照 ID だけを保持する (affirmed 2026-10-03)
## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- ユーザーに判断を求めるときは、判断に必要な要素を必ず添える（聞いている対象が何か、各選択肢を選ぶと具体的に何が起きるか・どのファイルや後続ステージに影響するか、推奨とその理由）。説明なしに内部用語（ステージの日記、memory.md、候補 ID など）を出さない (learned 2026-10-03) <!-- cid:practices-discovery:u1 -->
