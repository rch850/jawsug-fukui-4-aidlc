import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/products';
import { filterByCategory, findProductById, formatPrice, parseCategoryFilter } from './catalog';

describe('filterByCategory（US-2 / FR-1.2）', () => {
  it('「キッズ」を選ぶとキッズの商品だけになる', () => {
    const kids = filterByCategory(PRODUCTS, 'kids');
    expect(kids).toHaveLength(4);
    expect(kids.every((product) => product.category === 'kids')).toBe(true);
  });

  it('「すべて」に戻すと全 12 商品が元の並び順で返る', () => {
    expect(filterByCategory(PRODUCTS, 'all')).toEqual(PRODUCTS);
    expect(filterByCategory(PRODUCTS, 'all')).toHaveLength(12);
  });

  it('メンズからウィメンズに切り替えると、メンズの商品は残らない', () => {
    const mens = filterByCategory(PRODUCTS, 'mens');
    const womens = filterByCategory(PRODUCTS, 'womens');
    expect(womens.map((p) => p.id)).toEqual(['w-01', 'w-02', 'w-03', 'w-04']);
    expect(womens.some((p) => mens.includes(p))).toBe(false);
  });

  it('該当する商品がないときは空の配列を返す（境界）', () => {
    const onlyMens = PRODUCTS.filter((p) => p.category === 'mens');
    expect(filterByCategory(onlyMens, 'kids')).toEqual([]);
  });

  it('URL などから来た不正なカテゴリの値は「すべて」として扱う（エラー）', () => {
    expect(parseCategoryFilter('womens')).toBe('womens');
    expect(parseCategoryFilter('shoes')).toBe('all');
    expect(parseCategoryFilter(null)).toBe('all');
  });
});

describe('findProductById（US-4 / FR-2.4）', () => {
  it('存在する ID なら商品を返す', () => {
    expect(findProductById(PRODUCTS, 'm-01')?.name).toBe('スーピマコットン クルーネック T シャツ');
  });

  it('存在しない ID や空の ID なら undefined（「商品が見つかりません」を出す）', () => {
    expect(findProductById(PRODUCTS, 'x-99')).toBeUndefined();
    expect(findProductById(PRODUCTS, '')).toBeUndefined();
    expect(findProductById(PRODUCTS, undefined)).toBeUndefined();
  });
});

describe('商品データ', () => {
  it('キッズのサイズは 110〜140、それ以外は S〜XL', () => {
    for (const product of PRODUCTS) {
      const expected =
        product.category === 'kids' ? ['110', '120', '130', '140'] : ['S', 'M', 'L', 'XL'];
      expect(product.sizes).toEqual(expected);
    }
  });
});

describe('formatPrice', () => {
  it('税込価格を ¥ と 3 桁区切りで表示する', () => {
    expect(formatPrice(1990)).toBe('¥1,990');
    expect(formatPrice(990)).toBe('¥990');
    expect(formatPrice(0)).toBe('¥0');
  });
});
