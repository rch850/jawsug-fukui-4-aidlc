# Practices Discovery — Questions

> Stage: practices-discovery (Inception 2.2) · Scope: workshop · Depth: Standard · Test Strategy: Minimal
> Project: ユニクロのような自社のECサイトを構築したいです（Greenfield）
>
> グリーンフィールドのため、コード上の証拠スキャン（Step 2）は行わず、`org.md` の既定値を推奨回答として 5 つのプラクティス領域を確認します。
> 回答は各 `[Answer]:` タグに記入してください（例: `[Answer]: A`）。

---

## Q1. Way of Working — ブランチ戦略

チームはどのようなブランチ戦略で開発しますか？

A. トランクベース開発 — `main` へ短命フィーチャーブランチ（1〜2日）でマージ（org.md 既定・推奨）
B. GitHub Flow — `main` + PR ベースのフィーチャーブランチ（期間の縛りなし）
C. Git Flow — `develop` / `release` / `hotfix` などの長命ブランチを併用
D. `main` に直接コミット（ワークショップ／個人開発向け、ブランチなし）
X. Other (please specify)

[Answer]:A

## Q2. Way of Working — マージ方式

Bolt（実装単位）のブランチを `main` へ取り込む方式は？

A. Squash merge — 1 Bolt = `main` 上の 1 コミット（org.md 既定・推奨）
B. Merge commit — ブランチの履歴をそのまま残す
C. Rebase merge — 線形履歴を保ちつつ個別コミットも残す
X. Other (please specify)

[Answer]:B

## Q3. Walking Skeleton — 最初の Bolt の扱い

Construction の最初に「ウォーキングスケルトン」（全レイヤーを貫く最小の縦切り：例 商品一覧表示 → カート投入 → 注文確定 の最小動線）を作りますか？

A. 常に作る — グリーンフィールドでは Bolt 1 をスケルトンとし、承認後に残りを進める（org.md 既定・推奨）
B. スコープ次第 — グリーンフィールド系スコープでは作り、バグ修正・リファクタでは省く
C. 作らない — 最初から機能単位で Bolt を進める
X. Other (please specify)

[Answer]:B
**Mode:** chat（A/B/C の違いを説明したうえで回答。今回の greenfield / workshop ではスケルトンを作り、bugfix・refactor・security-patch では省く）

## Q4. Testing Posture — テスト方針

テストをどの程度、どのタイミングで書きますか？（workshop スコープの既定テスト戦略は Minimal）

A. Minimal（Nyquist モデル）— 要件ごとに検証テスト 1 本＋各コンポーネントに最低 1 本のハッピーパス単体テスト。カバレッジ下限なし（workshop 既定・推奨）
B. コードと同時にテストを書き、行カバレッジ 80% 以上・CI でマージ前に実行（org.md の mvp/feature 既定）
C. TDD（テストファースト）で進める
D. 単体＋結合＋E2E まで網羅的に書く（Comprehensive）
X. Other (please specify)

[Answer]:A

## Q5. Deployment — デプロイ方針

どのようにデプロイしますか？

A. マージ時にステージングへ自動デプロイ、本番は手動承認ゲート（org.md 既定・推奨）
B. 継続的デプロイ — マージで本番まで自動デプロイ
C. 手動デプロイのみ（ワークショップ中はローカル／単一環境で確認）
D. 今回はデプロイしない（設計・ローカル実行まで）
X. Other (please specify)

[Answer]:D

## Q6. Code Style — フォーマッタ／リンタ

コードスタイルはどう担保しますか？

A. 言語標準のフォーマッタ＋リンタ（JS/TS なら Prettier + ESLint 等）をリポジトリに設定し、CI で失敗時はブロック（org.md 既定・推奨）
B. フォーマッタ／リンタは設定するが CI では警告のみ（ブロックしない）
C. 特に設定しない（ワークショップのため最小限）
X. Other (please specify)

[Answer]:A

## Q7. 必須・禁止ルール（Mandated / Forbidden）

チームとして「必ず守る」「絶対にしない」ルールはありますか？（select all that apply）

A. 認証情報・API キー・決済情報をコードにハードコードしない（NEVER）
B. カード番号などの決済情報を自社で保存しない（決済代行サービスに委譲する）（NEVER）
C. すべての変更は PR レビューを経てマージする（ALWAYS）
D. インフラはすべて IaC（CDK / CloudFormation 等）で管理する（ALWAYS）
E. 特になし
X. Other (please specify)

[Answer]:A, B

---

## Follow-up

### F1. Q5（デプロイしない）と workshop スコープの Operation フェーズの整合

Q5 で「D. 今回はデプロイしない」を選びましたが、workshop スコープには Operation フェーズの 7 ステージ（デプロイパイプライン、環境構築、デプロイ実行、監視、障害対応、性能検証、改善）が含まれています。また Deployment の回答は `team.md` に**チームの標準**として保存され、今後のワークフローにも効きます。どう扱いますか？

A. 通常はマージでステージングへ自動デプロイ・本番は手動承認（org 既定）。ただし workshop スコープ（学習目的）では実デプロイせず、Operation フェーズは設計・IaC・手順書づくりまでとする（推奨）
B. チームの標準としても「デプロイしない（ローカル実行まで）」とし、Operation フェーズは設計・手順書づくりまでとする
C. Q5 を「C. 手動デプロイ」に変更し、AWS の単一環境に実際にデプロイする（このセッションでは現在 AWS 認証情報が見つかっていないため、設定が必要）
X. Other (please specify)

[Answer]:A
**Mode:** chat（構造化質問で回答）
