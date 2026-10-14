# Discovered Rules

> エージェント向けの是正ルール。承認後、`## Mandated` / `## Forbidden` の各行が `aidlc/spaces/default/memory/project.md` の同名見出しに `(affirmed YYYY-MM-DD)` 付きで追記されます。
> 出典: `practices-discovery-questions.md` Q7（選択: A, B）。

## Mandated

<!-- Q7 で ALWAYS 型のハード制約（C: PR レビュー必須、D: インフラの IaC 管理）は選択されなかったため、追記するルールなし -->

## Forbidden

- NEVER 認証情報・API キー・決済情報をソースコード／設定ファイル／テストにハードコードしない。環境変数またはシークレット管理（AWS Secrets Manager / SSM Parameter Store など）から読み込む
- NEVER カード番号・セキュリティコードなどのカード会員データを自社のシステム（DB・ログ・キャッシュを含む）に保存しない。決済は PCI DSS 準拠の決済代行サービスに委ね、自社には決済代行が発行するトークン／参照 ID だけを保持する
