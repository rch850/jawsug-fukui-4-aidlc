# User Stories Assessment

> Stage: user-stories（Inception 2.4）· Scope: workshop · Depth: Minimal
> 入力: `requirements.md`（requirements-analysis で承認済み）、`team-practices.md`

## Decision

**Execute**（ユーザーストーリーを作る）

## Rationale

- 一般の購入者が直接操作する画面（商品一覧・商品詳細・カート・注文手続き・注文完了）が中心のプロジェクトで、ユーザー視点の受け入れ条件がそのまま画面設計とコード生成の確認項目になる。
- アーキテクチャ設計を飛ばす（プラン B）ため、「誰が・何を・なぜ」をストーリーで固定しておくと、次の画面設計（refined-mockups）で画面ごとの目的がぶれない。

## Factors Considered

| 観点 | 判断 |
|------|------|
| プロジェクトの種類 | 新規開発（グリーンフィールド）、利用者向けの EC サイト |
| 利用者向けの範囲 | 5 画面すべてが利用者向け |
| 複雑さ | ロジックは軽い（カートの上限・合計、入力チェック）。ペルソナは少数 |
| 深さ | Minimal のため、ストーリーは購入の流れに沿った少数（8 本前後）に絞る |

## Where Stories Add the Most Value

- 購入の流れ（探す → 選ぶ → カートで調整 → 注文する）の各段階で、何ができれば「できた」と言えるかを受け入れ条件で明確にする。
- 時間切れのときに削る順（`requirements.md` の Priority）を、ストーリーの MoSCoW 優先度と揃える。
