# Design System Mapping

> Stage: refined-mockups（Inception 2.5）· Depth: Minimal
> 入力: `refined-mockups-questions.md`（Q1: A 列数、Q3: B 赤）、`requirements.md`（Constraints、NFR-3、NFR-5）、`stories.md`、`team-practices.md`。ラフ案（`wireframes`、`user-flow`）はアイデア出しフェーズを省いたため存在しない。
> 既存のデザインシステムはない（グリーンフィールド）。UI ライブラリは使わず、CSS カスタムプロパティ（変数）とプレーンな CSS で実装する。

## Design Tokens

### Color

| トークン | 値 | 用途 | コントラスト（白背景に対して） |
|----------|----|------|-------------------------------|
| `--color-bg` | `#FFFFFF` | 背景 | — |
| `--color-text` | `#1A1A1A` | 本文、ロゴ | 約 17:1 |
| `--color-text-sub` | `#595959` | 補足テキスト | 約 7:1 |
| `--color-border` | `#D9D9D9` | 区切り線（装飾のみ） | — |
| `--color-border-strong` | `#767676` | 入力欄・ボタン・白の色見本の枠線 | 約 4.5:1 |
| `--color-surface` | `#F5F5F5` | 写真の代替枠、カートの行の背景 | — |
| `--color-accent` | `#B71C1C` | 主ボタンの背景、選択中タブの下線、リンク（Q3: B） | 約 6.6:1（白文字との比も同じ） |
| `--color-accent-hover` | `#8E1414` | 主ボタンのホバー | 約 9:1 |
| `--color-disabled` | `#BDBDBD` | 無効なボタン | — |
| `--color-error` | `#B71C1C` | エラー文言（必ず「!」アイコンと文言を付け、色だけで示さない） | 約 6.6:1 |
| `--color-toast-bg` | `#1A1A1A` | 通知の背景（白文字） | 約 17:1 |

- ロゴ「FUKUI BASICS」は `--color-text` の太字テキストにする。赤い四角に白文字のロゴは、実在ブランドに似るため使わない。

### Typography

| トークン | 値 |
|----------|----|
| `--font-family` | `"Hiragino Sans", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif` |
| `--font-size-sm` | 12px（補足） |
| `--font-size-md` | 14px（本文） |
| `--font-size-lg` | 16px（商品名、入力欄） |
| `--font-size-xl` | 20px（価格、画面見出し） |
| `--font-size-2xl` | 24px（商品詳細の商品名） |

### Spacing / Shape

| トークン | 値 |
|----------|----|
| `--space-1` 〜 `--space-5` | 4px / 8px / 16px / 24px / 32px |
| `--radius` | 0（角を丸めないシンプルな見た目） |
| `--header-height` | 56px |
| 写真の比率 | 3:4（縦長） |

### Breakpoints and Grid（Q1: A）

| 画面幅 | 一覧の列数 | 余白 |
|--------|------------|------|
| mobile（〜767px） | 2 列 | 左右 16px |
| tablet（768〜1024px） | 3 列 | 左右 24px |
| desktop（1025px〜） | 4 列 | 最大幅 1200px で中央寄せ |

## Component Mapping

| 画面の部品（`interaction-spec.md`） | 実装（React コンポーネント） | 使うトークン |
|------------------------------------|------------------------------|--------------|
| Header / CartLink | `Header` | text、border、accent（件数） |
| CategoryTabs | `CategoryTabs` | accent（下線）、text |
| ProductCard / ProductImage | `ProductCard`、`ProductImage` | surface、text、text-sub |
| VariantSelector | `ColorSwatches`、`SizeSelector` | text、border、accent（選択） |
| AddToCartButton ＋ Toast | `Button`（primary / secondary）、`Toast` | accent、disabled、toast-bg |
| CartLine | `CartLine` | border、surface |
| CheckoutForm | `TextField`、`RadioGroup`、`CheckoutForm` | border、error |
| NotFound / OrderComplete | `NotFoundPage`、`CompletePage` | text、accent |

## Implementation Notes

- 技術: React + Vite + TypeScript、画面遷移は `react-router-dom`（`requirements.md` FR-0.2）。
- 色・余白は CSS 変数で `src/styles/tokens.css` にまとめ、各コンポーネントの CSS から参照する。
- 写真は `public/images/<商品ID>.jpg` に置き、出典は `CREDITS.md` に記録する（FR-0.3）。
