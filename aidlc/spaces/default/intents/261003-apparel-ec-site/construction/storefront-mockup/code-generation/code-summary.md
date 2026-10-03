# Code Summary — storefront-mockup

> Stage: code-generation（Construction 3.5）· Unit: storefront-mockup · 作った範囲: Must + Should + Could（全部）
> 計画: `code-generation-plan.md`（Step 1〜8 すべて完了）
> アプリの場所: ワークスペース直下の `storefront/`

## Verification

| 確認 | 結果（コンダクターが再実行して確認） |
|------|--------------------------------------|
| `npm install` | 成功（開発担当の報告: 脆弱性 0） |
| `npm run lint`（ESLint + Prettier） | 成功、エラー 0 |
| `npm test`（Vitest） | 3 ファイル、33 / 33 成功 |
| `npm run build`（`tsc -b && vite build`） | 成功。JS 290 kB（gzip 92 kB）、CSS 13 kB |
| `npm run dev` | 起動を確認済み（開発担当の報告。`/`、`/products/m-01`、写真が HTTP 200） |
| 商品写真 | 12 / 12 枚を取得して同梱、出典は `CREDITS.md` |
| カード情報 | 入力欄なし（ソースを検索して確認） |

開発担当は追加で、ヘッドレス Chrome で US-1〜US-9 とアクセシビリティ項目を操作確認した（53 / 53 件成功、コンソールエラーなし）。このスクリプトは一時フォルダに置いたもので、アプリの依存関係には含まれない。

## Files Created

| フォルダ | ファイル |
|----------|----------|
| `storefront/` | `package.json`、`package-lock.json`、`tsconfig*.json`（strict）、`vite.config.ts`、`index.html`、`eslint.config.js`、`.prettierrc`、`.prettierignore`、`.gitignore`、`README.md`、`CREDITS.md` |
| `public/` | `images/` に写真 12 枚（800×1067、3:4、計約 1.5 MB）、`favicon.svg` |
| `scripts/` | `fetch-photos.mjs`（写真の取得。有料写真を除外し、同じ写真の重複を避け、失敗した商品は記録して除外） |
| `src/data/` | `colors.ts`（8 色）、`products.ts`（12 商品）、`photos.json`（写真と出典） |
| `src/domain/` | `catalog.ts`、`cart.ts`、`checkout.ts`、`order.ts` と、テスト `catalog.test.ts`、`cart.test.ts`、`checkout.test.ts` |
| `src/state/` | `cartContext.ts`、`CartProvider.tsx`（カートを localStorage に保存。注文番号は React の状態だけ） |
| `src/components/` | `Header`、`CategoryTabs`、`ProductCard`、`ProductImage`、`ColorSwatches`、`SizeSelector`、`Button`、`Toast`、`CartLine`、`TextField`、`RadioGroup`、`InlineError` |
| `src/pages/` | `ProductListPage`、`ProductDetailPage`、`CartPage`、`CheckoutPage`、`CompletePage`、`NotFoundPage` |
| `src/styles/` | `tokens.css`（CSS 変数）、`global.css` |

## Story Coverage

| ストーリー | 実装 |
|------------|------|
| US-1 一覧 | `ProductListPage`、`ProductCard`、`ProductImage`、`Header` |
| US-2 絞り込み | `CategoryTabs`、`catalog.ts`（カテゴリは URL の `?category=` に保持） |
| US-3 選んで入れる | `ProductDetailPage`、`ColorSwatches`、`SizeSelector`、`Toast` |
| US-4 存在しない商品 | `ProductDetailPage` の見つからない表示 |
| US-5 カートと合計 | `CartPage`、`cart.ts`、`CartProvider` |
| US-6 数量・削除・上限 | `CartLine`、`cart.ts`、`InlineError` |
| US-7 配送先の入力 | `CheckoutPage`、`checkout.ts`、`TextField`、`RadioGroup` |
| US-8 確認 | `CheckoutPage` の確認の段階 |
| US-9 完了 | `CompletePage`、`order.ts` |

## Key Decisions

- TypeScript は 6.0 系に固定した（typescript-eslint が 6.1 未満までしか対応していないため）。
- 写真は、キーワード検索の自動選択だと不適切なもの（重複、柄物、大人の写真など）が混ざったため、候補を目で確認して商品ごとに写真を決め、スクリプトに固定した。12 枚ともロゴや文字のない服。
- 写真に合わせて 1 色目を 3 商品で変更した（w-02 → ネイビー、k-01 → グレー、k-04 → イエロー）。
- 保存されたカートは読み込み時に検証し、壊れた値は空のカート、不正な行（存在しない商品・色・サイズ、範囲外の数量）は除外して警告を出す。
- 色とサイズは標準のラジオボタンで、矢印キーで選べる。入力エラー時は最初のエラー項目へフォーカスを移す。

## Deviations and Notes

- 郵便番号・電話番号・メールが空のときは、`interaction-spec.md` の「1 項目 1 文言」の表どおり、形式エラーの文言（例: 「郵便番号は 7 桁の数字で入力してください」）を表示する。
- 写真の補足: m-04（チノパンツ）は上半身にピンクのポロシャツが写る。k-01 は後ろ姿。m-03 は空に小さなドローンが写る。
- フレームワークの型チェックセンサーが `storefront/` の中に空のキャッシュファイルを作ったため、開発担当が削除した。センサーが再び作る可能性がある。
- npm が macOS 用の任意パッケージ `fsevents` のインストールスクリプトを許可していないと表示するが、動作には影響しない。
- `storefront/` はまだ git にコミットしていない。

## Review

**Verdict**: READY

レビュー担当: アーキテクチャのレビュー担当（Minimal 深度、コードと成果物を独立に確認）

良い点: US-1〜US-9 の受け入れ条件はコード上ですべて追えた（一覧と絞り込み、未選択では押せない「カートに入れる」、上限 10、カートは数量の合計を件数に表示、空カートで `/checkout` → `/cart`、未確定で `/complete` → `/`、確認の段階の「入力に戻る」で入力値を保つ）。ガードレールも守られている。カード番号の入力欄はなく、支払い方法はデモ用のラジオボタンだけ。localStorage に保存するのはカートの 4 項目（商品 ID・カラー・サイズ・数量）だけで、配送先と注文番号は React の状態にしか持たない。API キーなどの秘密情報もない。localStorage との境目のエラー処理もそろっている。ストレージ自体に触れない場合、読み込みの例外、JSON の破損、配列でない値、不正な行や重複した行は、それぞれ空のカートにするか、その行だけ捨てたうえで `console.warn` を出す。レビュー担当の再実行でも `npm test`（33 / 33）と `npm run lint` は成功した。以下はどれも、次へ進むのを止めるものではない。

1. **[non-blocking] 写真取得スクリプトの説明が実態と違い、再実行すると商品データと合わない写真になるおそれがある。** `scripts/fetch-photos.mjs` は Unsplash の非公開の内部エンドポイント（`unsplash.com/napi/...`）を API キーなしで呼んでいる。それなのにコメントには「公開検索エンドポイントを利用」とある。公式 API（`api.unsplash.com`、Access Key が必要、ダウンロード時に `download_location` を呼ぶ）の利用条件には沿っていない。User-Agent についてのコメントも、ボット対策を避けているように読める。写真はすでに同梱済みで、アプリ本体は実行時に通信しない（NFR-1）ので、今の動作には影響しない。ただし、再実行はいつでも失敗しうる。さらに、写真に合わせて 1 色目を変えた 3 商品（w-02 → ネイビー、k-01 → グレー、k-04 → イエロー）は、固定した写真を取れなかったときの検索語が古い色のまま（`white linen shirt`、`kid yellow t-shirt`、`girl pink dress`）になっている。このため、写真の色と代替テキスト（1 色目を使う）が食い違う。対応: コメントを「非公式の内部エンドポイント。再実行できる保証はない」と事実どおりに直し、検索語を今の 1 色目に合わせる。公式 API に切り替える場合は、Access Key を環境変数（例: `UNSPLASH_ACCESS_KEY`）から読む（project.md の Forbidden のとおりハードコードしない）。
2. **[non-blocking] 画面の振る舞いの確認を、あとから再現できない。** 33 本の単体テストが確かめているのは domain の処理（絞り込み、カート操作、入力チェック、注文番号）だけ。画面側の受け入れ条件（FR-4.6 の 2 つのリダイレクト、ヘッダー件数の更新、詳細画面での上限エラーの表示、エラー時に最初の項目へフォーカスを移すこと、「入力に戻る」で値を保つこと）を確かめるテストは、リポジトリにない。開発担当がヘッドレス Chrome で確認した 53 件は一時フォルダのスクリプトで、残っていない。テストを 3 ファイルに絞ったのは承認済みの NFR-4 どおりなので、不合格ではない。ただし team.md の Testing Posture（「要件ごとに検証テストを 1 本」「各コンポーネントに最低 1 本のハッピーパス」）からは外れている。そのことを Deviations に 1 行書いておく。あわせて、53 件の確認スクリプトか手順を、record の下か build-and-test の手動確認手順として残す。そうすれば「確認済み」の根拠を後から追える。
3. **[non-blocking] カートを保存できなかったことが、利用者には伝わらない。** `saveCart` は保存に失敗する（容量超過、保存が無効など）と、`console.warn` を出して false を返す。しかし `CartProvider` はこの戻り値を使っていない。ログには残るのでガードレール（黙って失敗しない）には反していないし、FR-3.7 が求めているのは読み込み側だけなので、要件違反でもない。ただ、利用者は再読み込みでカートが消えることを知らないまま進むことになる。モックアップとしては今のままでよい。直すなら、最初に保存に失敗したときに一度だけトーストで知らせる。
4. **[non-blocking] `storefront/` がまだコミットされていない。** `storefront/` は `main` 上でまだ追跡されていないファイルのまま。team.md の進め方（短命のフィーチャーブランチを作り、`--strategy merge` で `main` に取り込む）に従い、次のステージ（build-and-test）の前にブランチを切ってコミットする。`node_modules/` と `dist/` は `storefront/.gitignore` で除外済みなので、そのままコミットしてよい。
