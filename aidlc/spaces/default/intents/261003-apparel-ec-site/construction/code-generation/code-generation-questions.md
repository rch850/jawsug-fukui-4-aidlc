# Code Generation — Questions

> Stage: code-generation（Construction 3.5）· Unit: storefront-mockup
> 計画: `construction/storefront-mockup/code-generation/code-generation-plan.md`（8 ステップ、`storefront/` に全部作る、写真は Unsplash から取得）

## Q1. 計画の承認

この計画でコード生成を始めてよいですか？

A. 承認（この計画で生成を始める。約 15〜20 分）
B. 変更したい（置き場所・範囲・手順など。内容を記入）
X. Other (please specify)

[Answer]:A
**Mode:** chat（ユーザーの返信「承認」）

## Q2. コード生成の承認（レビュー結果が届いてから提示）

`storefront/` にできたモックアップ（テスト 33 件・lint・ビルド成功、写真 12 枚）を承認し、ビルドとテストに進みますか？

A. Approve（承認してビルドとテストへ）
B. Request Changes（直したい点を記入）
X. Other (please specify)

[Answer]:B — 郵便番号から自動的に住所を入れてほしい。住所欄を都道府県、市区町村など日本のよくある形式にしてほしい。（コミット: 今すぐコミット → feature/storefront-mockup に 2 コミット済み）

## Q3. 郵便番号から住所を引くデータ（変更依頼への対応）

A. 無料の郵便番号検索 API（zipcloud）を、郵便番号の入力時に呼ぶ（約 5 分。全国の郵便番号に対応。入力時だけネット接続が必要で、つながらないときは手入力。郵便番号が外部サービスに送られる）（推奨）
B. 日本郵便の全国郵便番号データをアプリに同梱する（ネット不要で全国対応。ただし公式配布ファイルをすぐには取得できず、調査込みで約 15〜20 分）
C. 一部の郵便番号（福井県と主要都市など数十件）だけを同梱する（約 5 分、ネット不要。それ以外は手入力）
X. Other (please specify)

[Answer]:A

## Q4. 住所欄の分け方

A. 4 項目: 都道府県（選択式）／市区町村／町名・番地／建物名・部屋番号（任意）。自動入力で都道府県・市区町村・町名まで入り、番地を続けて入力する（推奨。日本の EC で一般的）
B. 5 項目: 都道府県／市区町村／町名／番地／建物名・部屋番号（任意）。入力欄が 1 つ増えるが、町名と番地を分けて扱える
X. Other (please specify)

[Answer]:A

## Q5. コード生成の承認（CR-1 の反映後に再提示）

郵便番号からの住所自動入力と 4 項目の住所欄を反映したモックアップを承認し、ビルドとテストに進みますか？

A. Approve
B. Request Changes（内容を記入）
X. Other (please specify)

[Answer]:A（コミット: 今すぐコミット）
