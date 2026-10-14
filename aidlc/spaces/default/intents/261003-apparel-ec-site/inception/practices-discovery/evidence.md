# Practices Discovery — Evidence

> 再実行時に鮮度を判断するための記録。何をスキャンし、何を推論し、何を質問したか。

## Context

- **Intent**: 261003-apparel-ec-site — 「ユニクロのような自社のECサイトを構築したいです」
- **Scope / Depth / Test Strategy**: workshop / Standard / Minimal
- **Project Type**: Greenfield（`aidlc-state.md` の Project Type。言語・フレームワーク・ビルドシステムはすべて Unknown）
- **Step 2（マルチエージェントの証拠スキャン）**: グリーンフィールドのためステージ定義どおり実行せず。代わりにリポジトリの状態を軽く確認した

## Repository Snapshot

| 項目 | 結果 |
|------|------|
| コミット | 1 件（`f7c53dc` Initial commit、追跡ファイルなし） |
| リモート | 未設定（`git remote -v` が空） |
| ルート直下 | `.claude/`, `.gitignore`, `.mcp.json`, `aidlc/`（AI-DLC フレームワークのみ、アプリケーションコードなし） |
| CI 設定 | なし（`.github/` などなし） |
| テスト／リンタ設定 | なし |

## Per-Agent Findings

### aidlc-pipeline-deploy-agent（lead）— Way of Working / Deployment

- **Scanned**: git 履歴、ブランチ、リモート、CI 設定の有無
- **Inferred**: 証拠なし（コミット 1 件、ブランチは `main` のみ、リモートと CI なし）
- **Asked**: Q1（ブランチ戦略）→ A トランクベース、Q2（マージ方式）→ B merge commit（`org.md` 既定の squash を上書き）、Q5（デプロイ）→ D 今回はデプロイしない、F1（Q5 と workshop の Operation フェーズの整合）→ A 通常は `org.md` 既定、workshop では実デプロイなし

### aidlc-quality-agent — Testing Posture / Walking Skeleton

- **Scanned**: テストフレームワーク、カバレッジツール、CI ゲートの有無
- **Inferred**: 証拠なし。workshop スコープの既定テスト戦略は Minimal
- **Asked**: Q3（ウォーキングスケルトン）→ B スコープ次第（A/B/C の違いをチャットで説明したうえで回答）、Q4（テスト方針）→ A Minimal（Nyquist モデル）
- **Reconciled**: Minimal のテスト本数方針と `phases/construction.md` の「テストファイルごとにハッピーパス＋エラー／境界ケース 2 件以上」を両立させる記述にした

### aidlc-developer-agent — Code Style

- **Scanned**: 命名規則、レイヤー構成、エラーハンドリング、ファイル構成
- **Inferred**: アプリケーションコードがないため証拠なし
- **Asked**: Q6（フォーマッタ／リンタ）→ A 言語標準のフォーマッタ＋リンタ、CI で失敗時はブロック

### aidlc-devsecops-agent — Security Posture

- **Scanned**: リンタ設定、SAST/DAST、シークレットスキャン、依存関係の更新自動化
- **Inferred**: いずれも未設定（グリーンフィールド）。EC サイトは決済と個人情報を扱うため、カード会員データの非保持とシークレット管理を最優先の制約とみなした
- **Asked**: Q7（必須・禁止ルール）→ A 秘密情報をハードコードしない、B カード会員データを自社で保存しない（どちらも NEVER）

## Gaps Carried Forward

- リモート未設定のため、Code Style の「CI でマージ前に実行・失敗時ブロック」は現時点では実行できる CI がない。CI 基盤（GitHub Actions、AWS CodeBuild など）は ci-pipeline ステージ（3.7）で決める
- このセッションでは AWS 認証情報が見つかっていない（aws-mcp が接続失敗）。workshop では実デプロイしない方針（F1）なので、現時点ではブロッカーではない
