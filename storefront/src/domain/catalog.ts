import { CATEGORY_LABELS, type Category, type Product } from '../data/products';

/** カテゴリの絞り込みの値。'all' は「すべて」（絞り込みなし）。 */
export type CategoryFilter = Category | 'all';

export const CATEGORY_FILTERS: readonly CategoryFilter[] = ['all', 'mens', 'womens', 'kids'];

/** カテゴリで商品を絞り込む（US-2 / FR-1.2）。元の並び順を保つ。 */
export function filterByCategory(
  products: readonly Product[],
  filter: CategoryFilter,
): readonly Product[] {
  if (filter === 'all') return products;
  return products.filter((product) => product.category === filter);
}

/** ID で商品を探す。見つからなければ undefined（US-4 / FR-2.4 の「商品が見つかりません」）。 */
export function findProductById(
  products: readonly Product[],
  id: string | undefined,
): Product | undefined {
  if (!id) return undefined;
  return products.find((product) => product.id === id);
}

/** URL のクエリなどから来た文字列を、絞り込みの値に変換する。不正な値は 'all'。 */
export function parseCategoryFilter(value: string | null | undefined): CategoryFilter {
  return CATEGORY_FILTERS.find((filter) => filter === value) ?? 'all';
}

/** 絞り込みの表示名（「すべて」「メンズ」など）。 */
export function categoryFilterLabel(filter: CategoryFilter): string {
  return filter === 'all' ? 'すべて' : CATEGORY_LABELS[filter];
}

/** 商品写真の代替テキスト。写真の色は変わらないので、選んだ色ではなく常に 1 色目を使う（A-1）。 */
export function productImageAlt(product: Product): string {
  return `${product.colors[0] ?? ''}の${product.name}`;
}

/** 税込価格の表示（例: 1990 → "¥1,990"）。 */
export function formatPrice(yen: number): string {
  return `¥${yen.toLocaleString('ja-JP')}`;
}
