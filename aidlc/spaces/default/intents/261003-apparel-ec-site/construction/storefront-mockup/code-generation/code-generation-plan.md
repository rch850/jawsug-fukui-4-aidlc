# Code Generation Plan — storefront-mockup

> Stage: code-generation（Construction 3.5）· Scope: workshop · Depth: Minimal · Test Strategy: Minimal
> Unit: storefront-mockup（Units Generation はプラン B でスキップしたため、アプリ全体を 1 つのユニットとして扱う）
> 作る範囲: **全部**（Must + Should + Could。refined-mockups のゲートで「全部作る」）
> 出力先: ワークスペース直下の `storefront/`（記録ディレクトリには置かない）

## Inputs

| 成果物 | 要点 |
|--------|------|
| `inception/requirements-analysis/requirements.md` | FR-0〜FR-4（5 画面とパス、カート上限 10、localStorage、Unsplash 写真）、NFR-1〜NFR-5、Priority |
| `inception/user-stories/stories.md` | US-1〜US-9 の Given / When / Then。キッズのサイズは 110〜140 |
| `inception/refined-mockups/mockups.md` | ワイヤーフレーム、ダミー商品 12 点（説明文・カラーコード付き） |
| `inception/refined-mockups/interaction-spec.md` | 部品ごとの状態、入力チェックとエラー文言 |
| `inception/refined-mockups/design-system-mapping.md` | CSS 変数（赤 `#B71C1C` など）、列数（2 / 3 / 4） |
| `inception/refined-mockups/accessibility-checklist.md` | A-1〜A-13 |
| `inception/practices-discovery/team-practices.md` | Prettier + ESLint、Minimal テスト、秘密情報なし、カード情報を持たない |

## Steps

- [x] **Step 1: プロジェクトの土台**（全ストーリー）
  - `storefront/` に Vite + React + TypeScript の構成を手書きで作る（`package.json`、`tsconfig.json`（strict）、`vite.config.ts`、`index.html`）。
  - 依存: `react`、`react-dom`、`react-router-dom`。開発用: `vite`、`@vitejs/plugin-react`、`typescript`、`vitest`、`eslint`、`typescript-eslint`、`eslint-plugin-react-hooks`、`prettier`。
  - スクリプト: `dev`、`build`、`preview`、`lint`、`format`、`test`、`fetch-photos`。
  - `eslint.config.js`、`.prettierrc`、`.gitignore`（`node_modules`、`dist`）。
- [x] **Step 2: 商品データ**（US-1、US-3）
  - `src/data/colors.ts`: 8 色のカラー名 → コード（`mockups.md` の表）。
  - `src/data/products.ts`: 12 商品（ID、カテゴリ、商品名、種類、税込価格、カラー、サイズ、説明文）。キッズは 110 / 120 / 130 / 140。
- [x] **Step 3: 業務ロジック（画面に依存しない純粋な関数）**（US-2、US-5、US-6、US-7、US-9）
  - `src/domain/catalog.ts`: カテゴリの絞り込み、ID による商品検索。
  - `src/domain/cart.ts`: 追加（同じ商品・カラー・サイズは加算、上限 10 で拒否）、数量変更（1〜10）、削除、小計・合計・件数、localStorage の値の読み込み（壊れていれば空のカート）と書き出し。
  - `src/domain/checkout.ts`: 必須チェックと形式チェック（ハイフンを除いて郵便番号 7 桁、電話番号 10〜11 桁、メール形式）。エラー文言は `interaction-spec.md` のとおり。
  - `src/domain/order.ts`: 注文番号 `FB-YYYYMMDD-NNNN` の生成。
- [x] **Step 4: 単体テスト（Vitest、Minimal）**
  - `catalog.test.ts`、`cart.test.ts`、`checkout.test.ts` の 3 ファイル（注文番号の形式は `checkout.test.ts` に含める）。
  - 各ファイルに正常系と、エラー・境界ケース 2 件以上（例: 上限 10、壊れた保存値、6 桁の郵便番号、空の氏名）。
- [x] **Step 5: 状態管理**（US-3、US-5、US-6、US-9）
  - `CartContext`: カートを保持し、変更のたびに localStorage へ保存（カートの中身だけ。配送先は保存しない）。
  - 直前に確定した注文番号は React の状態にだけ持つ（`/complete` を直接開いたら `/` へ）。
- [x] **Step 6: 画面と部品**（US-1〜US-9）
  - `src/styles/tokens.css`（CSS 変数）と `global.css`。
  - 部品: `Header`、`CategoryTabs`、`ProductCard`、`ProductImage`（写真がなければ 1 色目で塗った枠）、`ColorSwatches`、`SizeSelector`、`Button`、`Toast`、`CartLine`、`TextField`、`RadioGroup`。
  - 画面: `ProductListPage`（`/`）、`ProductDetailPage`（`/products/:id`、見つからないときの表示を含む）、`CartPage`（`/cart`）、`CheckoutPage`（`/checkout`、入力 → 確認の 2 段階、空のカートなら `/cart` へ）、`CompletePage`（`/complete`）。
  - 操作できる要素に `data-testid` を付ける。画面ごとに `<title>` と `<h1>`。アクセシビリティは `accessibility-checklist.md` の A-1〜A-13。
- [x] **Step 7: 商品写真**（FR-0.3、US-1）
  - `scripts/fetch-photos.mjs`: 商品ごとに英語の検索語（例: "white crew neck t-shirt"）で Unsplash を検索し、有料（premium / Unsplash+）を除いた最初の写真を幅 800px で `public/images/<商品ID>.jpg` に保存する。撮影者名と写真ページの URL を `CREDITS.md` と `src/data/photos.json` に書き出す。
  - 一度だけ実行して、写真と `CREDITS.md` をアプリに同梱する。取得できなかった商品は `photos.json` に載せず、画面では代わりの枠を出す。
- [x] **Step 8: 動作確認とドキュメント**
  - `npm install`、`npm run lint`、`npm test`、`npm run build` がすべて成功するまで直す。
  - `npm run dev` で起動できることを確認してから止める。
  - `storefront/README.md`: 起動方法、画面一覧、写真の出典（`CREDITS.md`）、デモであること（決済・発送なし）。

## Story Traceability

| ストーリー | Steps |
|------------|-------|
| US-1 一覧で眺める | 2、6、7 |
| US-2 カテゴリで絞り込む | 3、4、6 |
| US-3 カラーとサイズを選んで入れる | 2、5、6 |
| US-4 存在しない商品ページ | 3、6 |
| US-5 カートの中身と合計 | 3、4、5、6 |
| US-6 数量変更・削除・上限 | 3、4、6 |
| US-7 配送先の入力 | 3、4、6 |
| US-8 確認してから確定 | 6 |
| US-9 注文完了 | 3、5、6 |
