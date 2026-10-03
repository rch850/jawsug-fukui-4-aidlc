import type { ColorName } from './colors';

export type Category = 'mens' | 'womens' | 'kids';

export const CATEGORY_LABELS: Record<Category, string> = {
  mens: 'メンズ',
  womens: 'ウィメンズ',
  kids: 'キッズ',
};

export const ADULT_SIZES = ['S', 'M', 'L', 'XL'] as const;
export const KIDS_SIZES = ['110', '120', '130', '140'] as const;

export type Product = {
  /** 商品 ID（例: m-01）。写真のファイル名 public/images/<id>.jpg にも使う */
  id: string;
  category: Category;
  name: string;
  /** 服の種類（T シャツ、シャツ など） */
  kind: string;
  /** 税込価格（円） */
  price: number;
  /** 1 色目が写真の服の色 */
  colors: readonly ColorName[];
  sizes: readonly string[];
  description: string;
};

/**
 * ダミー商品 12 点（mockups.md「Dummy Catalogue」）。
 * 1 色目は、同梱した Unsplash の写真の服の色に合わせてある（FR-0.3）。
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'm-01',
    category: 'mens',
    name: 'スーピマコットン クルーネック T シャツ',
    kind: 'T シャツ',
    price: 1990,
    colors: ['ホワイト', 'ネイビー', 'グレー'],
    sizes: ADULT_SIZES,
    description:
      'なめらかで丈夫なスーピマコットンを使った、1 枚で着ても重ね着にも使える定番の T シャツ。',
  },
  {
    id: 'm-02',
    category: 'mens',
    name: 'オックスフォード シャツ',
    kind: 'シャツ',
    price: 2990,
    colors: ['ホワイト', 'ブルー'],
    sizes: ADULT_SIZES,
    description:
      'しっかりした織りのオックスフォード生地。仕事にも休日にも合わせやすいボタンダウンシャツ。',
  },
  {
    id: 'm-03',
    category: 'mens',
    name: 'スウェット プルパーカー',
    kind: 'パーカー',
    price: 3990,
    colors: ['グレー', 'ブラック'],
    sizes: ADULT_SIZES,
    description:
      '裏毛のやわらかいスウェット生地。フードと前ポケット付きのリラックスしたシルエット。',
  },
  {
    id: 'm-04',
    category: 'mens',
    name: 'ストレッチ チノパンツ',
    kind: 'パンツ',
    price: 3990,
    colors: ['ベージュ', 'ネイビー'],
    sizes: ADULT_SIZES,
    description: '伸びる生地で動きやすいチノパンツ。すっきりしたテーパードシルエット。',
  },
  {
    id: 'w-01',
    category: 'womens',
    name: 'リブ クルーネック T シャツ',
    kind: 'T シャツ',
    price: 1500,
    colors: ['ホワイト', 'ブラック', 'ピンク'],
    sizes: ADULT_SIZES,
    description: '体にほどよく沿うリブ編み。インナーにも 1 枚でも着られるクルーネック T シャツ。',
  },
  {
    id: 'w-02',
    category: 'womens',
    name: 'リネンブレンド シャツ',
    kind: 'シャツ',
    price: 2990,
    colors: ['ネイビー', 'ベージュ'], // 写真（ネイビーのリネンシャツ）に合わせて 1 色目をホワイトから変更
    sizes: ADULT_SIZES,
    description: 'リネン混の風通しのよい生地。羽織りにも使えるゆったりしたシャツ。',
  },
  {
    id: 'w-03',
    category: 'womens',
    name: 'フレアスカート',
    kind: 'スカート',
    price: 2990,
    colors: ['ブラック', 'ベージュ'],
    sizes: ADULT_SIZES,
    description: '歩くたびに揺れるフレアシルエット。ウエストはゴムで楽にはける。',
  },
  {
    id: 'w-04',
    category: 'womens',
    name: 'デニム ジャケット',
    kind: 'ジャケット',
    price: 4990,
    colors: ['ブルー'],
    sizes: ADULT_SIZES,
    description: '程よい厚みのデニム生地。季節を問わず羽織れる定番のジャケット。',
  },
  {
    id: 'k-01',
    category: 'kids',
    name: 'キッズ カラー T シャツ',
    kind: 'T シャツ',
    price: 990,
    colors: ['グレー', 'ブルー', 'ホワイト'], // 写真（無地のグレーの T シャツ）に合わせて 1 色目をイエローから変更
    sizes: KIDS_SIZES,
    description: '元気な色がそろうキッズ用 T シャツ。洗濯に強いコットン 100%。',
  },
  {
    id: 'k-02',
    category: 'kids',
    name: 'キッズ スウェット パーカー',
    kind: 'パーカー',
    price: 1990,
    colors: ['グレー', 'ネイビー'],
    sizes: KIDS_SIZES,
    description: '着脱しやすいキッズ用パーカー。肌寒い日の羽織りにも。',
  },
  {
    id: 'k-03',
    category: 'kids',
    name: 'キッズ デニム パンツ',
    kind: 'パンツ',
    price: 1990,
    colors: ['ブルー'],
    sizes: KIDS_SIZES,
    description: 'ウエストゴムで動きやすいキッズ用デニムパンツ。',
  },
  {
    id: 'k-04',
    category: 'kids',
    name: 'キッズ ワンピース',
    kind: 'ワンピース',
    price: 1990,
    colors: ['イエロー', 'ネイビー'], // 写真（イエローのワンピース）に合わせて 1 色目をピンクから変更
    sizes: KIDS_SIZES,
    description: '1 枚でコーディネートが決まるキッズ用ワンピース。',
  },
];
