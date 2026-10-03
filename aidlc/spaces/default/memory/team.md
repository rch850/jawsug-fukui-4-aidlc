# Team-Level Rules

> This team's affirmed practices and corrections. Overrides aidlc-org.md.
> Populated by practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working

トランクベース開発（Trunk-Based）で進める。すべての作業は短命なフィーチャーブランチ（1〜2 日以内）から `main` にマージし、長命ブランチは作らない。Construction の worktree はベース・マージ先ともに `main` とし、Bolt ブランチは squash せず merge commit（`--strategy merge`）で `main` に取り込んで、ブランチ上のコミット履歴を残す。

## Walking Skeleton

スコープ依存（scope-dependent）。グリーンフィールドのスコープ（mvp / enterprise / feature / poc / workshop / infra）では、全レイヤーを貫く最小の縦切りを Bolt 1（ウォーキングスケルトン）として必ず最初に作り、人の承認を得てから残りの Bolt を進める。既存コードへの差分作業（bugfix / refactor / security-patch）ではスケルトンを作らず、最初の Bolt も他の Bolt と同じように進める。

## Testing Posture

テスト戦略は Minimal（Nyquist モデル）とする。要件ごとに検証テストを 1 本、各コンポーネントに最低 1 本のハッピーパス単体テストを書き、テストファイルごとに Construction フェーズのガードレールどおりハッピーパスとエラー／境界ケース 2 件以上をカバーする。テストは単体テストのみとし、結合・E2E・性能・セキュリティテストとカバレッジ下限は求めないが、既存のテストスイートは常にグリーンを保つ。

## Deployment

通常は `main` へのマージでステージング環境に自動デプロイし、本番デプロイは別途手動承認（テックリードとプロダクトオーナーの承認）でゲートする。ただし workshop スコープ（学習目的）のワークフローでは実環境へのデプロイを行わず、動作確認はローカル実行までとする。Operation フェーズは、デプロイパイプライン定義・IaC・手順書・監視設計などの設計成果物づくりまでとする。

## Code Style

言語標準のフォーマッタとリンタをリポジトリに設定する（JS/TS なら Prettier + ESLint、Python なら Black + Ruff など）。CI でマージ前に実行し、失敗したらマージをブロックする。命名は言語の慣用（JS/TS は camelCase、Python は snake_case など）に従う。エージェントはスタイルを提案する前にリポジトリのリンタ設定を読み、リンタが扱わない点だけを提案する。
## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
