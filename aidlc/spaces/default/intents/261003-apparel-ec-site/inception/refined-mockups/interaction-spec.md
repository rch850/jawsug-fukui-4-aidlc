# Interaction Spec

> Stage: refined-mockups（Inception 2.5）· Depth: Minimal
> 入力: `stories.md`、`requirements.md`、`team-practices.md`、`mockups.md`。ラフ案（`wireframes`、`user-flow`）はアイデア出しフェーズを省いたため存在しない。
> 形式は `.claude/knowledge/aidlc-design-agent/component-spec-template.md` に従う。Minimal のため、状態が多い部品だけを詳しく書き、残りは一覧表にまとめた。

## Component: VariantSelector（カラーとサイズの選択、US-3）

| Field | Value |
|---|---|
| Component | VariantSelector |
| Description | 商品詳細でカラー（色見本）とサイズを 1 つずつ選ぶ |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | 何も選ばれていない。ボタン下に「カラーとサイズを選んでください」 | 画面を開いた |
| selected | 選んだ色見本は二重の輪、サイズは黒地に白文字で強調〔強調は Should〕 | クリック / Enter / Space |
| focus | 2px の黒いフォーカス枠 | Tab |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| colors | string[] | yes | — | カラー名の一覧（1 色目が写真の色） |
| sizes | string[] | yes | — | S〜XL またはキッズの 110〜140 |
| value | { color?: string; size?: string } | yes | {} | 現在の選択 |
| onChange | function | yes | — | 選択が変わったとき |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | 写真の下に縦並び。サイズボタンは 4 つ横並び |
| tablet (768–1024px) | mobile と同じ |
| desktop (>1024px) | 写真の右側の列に配置 |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | カラーとサイズはそれぞれ `radiogroup`、各選択肢は `radio` |
| Keyboard interaction | Tab でグループに入り、矢印キーで移動、Space で選択 |
| Label / aria-label | 色見本は `aria-label="ネイビー"`。グループ名は「カラー」「サイズ」 |
| Contrast ratio | WCAG AA（文字 4.5:1、部品の境界 3:1） |
| Screen reader | 選択時に「ネイビー 選択済み」と読まれる |
| Focus management | 選択してもフォーカスは移動しない |

## Component: AddToCartButton ＋ Toast（US-3、US-6、Q2: A）

| Field | Value |
|---|---|
| Component | AddToCartButton / Toast |
| Description | カートに 1 個追加し、画面下部に結果を 3 秒表示する |
| Category | input / feedback |

### States

| State | Description | Trigger |
|---|---|---|
| disabled | グレー。押しても何も起きない | カラーかサイズが未選択 |
| default | 赤地に白文字「カートに入れる」 | 両方選択済み |
| success | Toast「カートに追加しました」＋「カートを見る」リンクを 3 秒。マウスを重ねている間とフォーカス中は消さない。ヘッダー件数 +1 | 押した |
| error | ボタンの下に「!」アイコン付きで「同じ商品は 10 点までです」。カラーかサイズを選び直すまで残る。件数は変わらない〔Should〕 | 同じ行がすでに 10 個 |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `button`。Toast は `role="status"`（`aria-live="polite"`） |
| Keyboard interaction | Enter / Space で押せる。カートへはヘッダーのカートのリンクからも移動できる |
| Screen reader | Toast の文言が読み上げられる |
| Focus management | 押した後もフォーカスはボタンに残る |

## Component: CheckoutForm（US-7、US-8）

| Field | Value |
|---|---|
| Component | CheckoutForm |
| Description | 配送先と支払い方法を入力し、確認の段階を経て注文を確定する |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| input | 入力の段階。支払い方法は「クレジットカード（デモ）」が初期選択 | 画面を開いた |
| error | 不備のある項目の下に「!」アイコンと文言。最初のエラー項目にフォーカス | 「次へ」で検証に失敗 |
| confirm | 確認の段階〔Could〕。入力内容は読み取り専用で表示 | 「次へ」で検証に成功 |
| redirect | カートが空なら `/cart` へ移動〔Should〕 | 画面を開いた時点でカートが空 |

### Validation

| 項目 | 必須（Must） | 形式（Could） | エラー文言 |
|---|---|---|---|
| 氏名 | 空でない（前後の空白は除く） | — | 氏名を入力してください |
| 郵便番号 | 空でない | ハイフンを除いて 7 桁の数字 | 郵便番号は 7 桁の数字で入力してください |
| 住所 | 空でない | — | 住所を入力してください |
| 電話番号 | 空でない | ハイフンを除いて 10〜11 桁の数字 | 電話番号は 10〜11 桁の数字で入力してください |
| メールアドレス | 空でない | `xxx@yyy.zz` の形 | メールアドレスの形式で入力してください |

### Accessibility

| Requirement | Implementation |
|---|---|
| Label / aria-label | 各入力に `<label>`。必須は「*」と `aria-required="true"` |
| Error | `aria-invalid="true"` と `aria-describedby` でエラー文言を関連付ける。色だけで示さない |
| Focus management | 検証失敗時は最初のエラー項目へ。段階を切り替えたら見出しへ |

## Other Components

| 部品 | 画面 | 動き | ストーリー |
|------|------|------|------------|
| Header / CartLink | 全画面 | ロゴで `/`、カートで `/cart`。件数は数量の合計で、カートの変更に即時追従 | US-1、US-6 |
| CategoryTabs | 一覧 | すべて / メンズ / ウィメンズ / キッズ。選択中は `aria-pressed="true"` と赤の下線 | US-2 |
| ProductCard | 一覧 | カード全体が `/products/:id` へのリンク。写真がなければ代替の枠 | US-1 |
| ProductImage | 一覧・詳細・カート | 同梱した写真を表示。`alt` は常に「〔1 色目〕の〔商品名〕」。写真がなければ 1 色目のカラーコードで塗った枠に商品名とカラー名 | US-1 |
| CartLine | カート | 数量セレクト（1〜10）、削除ボタン。変更は即時に小計・合計・ヘッダーへ反映 | US-5、US-6 |
| NotFound | 詳細 | 「商品が見つかりません」と一覧へのボタン | US-4 |
| OrderComplete | 完了 | 注文番号を表示しカートを空にする。未確定で開いたら `/` へ | US-9 |
