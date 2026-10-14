import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '../data/products';
import {
  CART_STORAGE_KEY,
  addToCart,
  lineKey,
  lineSubtotal,
  loadCart,
  parseCart,
  removeLine,
  saveCart,
  serializeCart,
  totalAmount,
  totalQuantity,
  updateQuantity,
  type CartLine,
} from './cart';

const tee120 = { productId: 'k-01', color: 'グレー', size: '120' };
const tee140 = { productId: 'k-01', color: 'グレー', size: '140' };
const shirtM = { productId: 'm-02', color: 'ホワイト', size: 'M' };

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    data,
  };
}

describe('addToCart（FR-2.3 / FR-3.4）', () => {
  it('新しい商品・カラー・サイズは数量 1 の行として追加される', () => {
    const result = addToCart([], tee120);
    expect(result).toEqual({ ok: true, lines: [{ ...tee120, quantity: 1 }] });
  });

  it('同じ商品でもサイズが違えば別の行になる（120 と 140）', () => {
    const first = addToCart([], tee120);
    const second = addToCart(first.lines, tee140);
    expect(second.lines).toHaveLength(2);
    expect(totalQuantity(second.lines)).toBe(2);
  });

  it('同じ商品・カラー・サイズは行を増やさず数量を 1 足す', () => {
    const once = addToCart([], tee120);
    const twice = addToCart(once.lines, tee120);
    expect(twice.lines).toEqual([{ ...tee120, quantity: 2 }]);
  });

  it('すでに 10 個ある行には追加せず、上限エラーを返す（境界）', () => {
    const lines: CartLine[] = [{ ...tee120, quantity: 10 }];
    const result = addToCart(lines, tee120);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: 'limit' });
    expect(totalQuantity(result.lines)).toBe(10);
  });

  it('9 個の行には追加できて 10 個になる（境界）', () => {
    const result = addToCart([{ ...tee120, quantity: 9 }], tee120);
    expect(result.ok).toBe(true);
    expect(result.lines[0]?.quantity).toBe(10);
  });
});

describe('数量変更・削除・合計（FR-3.1〜FR-3.3）', () => {
  const lines: CartLine[] = [
    { ...tee120, quantity: 1 },
    { ...shirtM, quantity: 1 },
  ];

  it('数量を 2 にすると小計が単価の 2 倍になり、合計と件数も変わる', () => {
    const updated = updateQuantity(lines, lineKey(tee120), 2);
    const tee = PRODUCTS.find((p) => p.id === 'k-01');
    expect(lineSubtotal(updated[0]!, tee)).toBe(990 * 2);
    expect(totalAmount(updated, PRODUCTS)).toBe(990 * 2 + 2990);
    expect(totalQuantity(updated)).toBe(3);
  });

  it('数量は 1〜10 だけ。0 や 11 や小数は RangeError（エラー）', () => {
    expect(() => updateQuantity(lines, lineKey(tee120), 0)).toThrow(RangeError);
    expect(() => updateQuantity(lines, lineKey(tee120), 11)).toThrow(RangeError);
    expect(() => updateQuantity(lines, lineKey(tee120), 1.5)).toThrow(RangeError);
    expect(updateQuantity(lines, lineKey(tee120), 10)[0]?.quantity).toBe(10);
  });

  it('行を削除するとその行が消え、合計が変わる', () => {
    const removed = removeLine(lines, lineKey(tee120));
    expect(removed).toEqual([{ ...shirtM, quantity: 1 }]);
    expect(totalAmount(removed, PRODUCTS)).toBe(2990);
  });

  it('空のカートの合計と件数は 0（境界）', () => {
    expect(totalAmount([], PRODUCTS)).toBe(0);
    expect(totalQuantity([])).toBe(0);
  });
});

describe('localStorage の読み込みと保存（FR-3.5 / FR-3.7）', () => {
  it('保存した中身を読み込むと同じカートに戻る', () => {
    const storage = memoryStorage();
    const lines: CartLine[] = [{ ...tee120, quantity: 3 }];
    expect(saveCart(storage, lines)).toBe(true);
    expect(loadCart(storage, PRODUCTS)).toEqual(lines);
  });

  it('保存するのはカートの 4 項目だけ（余計な項目は書き出さない）', () => {
    // 型の上では CartLine でも、実行時に余計な項目（例: 氏名）が混ざっていた場合を想定する
    const lineWithExtra = { ...tee120, quantity: 1, name: '田中 健太' };
    const withExtra: CartLine[] = [lineWithExtra];
    expect(JSON.parse(serializeCart(withExtra))).toEqual([{ ...tee120, quantity: 1 }]);
  });

  it('壊れた値（JSON でない・配列でない）は空のカートとして扱う（エラー）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadCart(memoryStorage({ [CART_STORAGE_KEY]: '{not json' }), PRODUCTS)).toEqual([]);
    expect(loadCart(memoryStorage({ [CART_STORAGE_KEY]: '{"a":1}' }), PRODUCTS)).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('不正な行（存在しない商品・範囲外の数量・ないサイズ）だけを捨てる（エラー）', () => {
    const raw = JSON.stringify([
      { ...tee120, quantity: 2 },
      { productId: 'x-99', color: 'グレー', size: 'M', quantity: 1 },
      { ...shirtM, quantity: 11 },
      { productId: 'k-01', color: 'グレー', size: 'XL', quantity: 1 },
      'garbage',
    ]);
    const result = parseCart(raw, PRODUCTS);
    expect(result.lines).toEqual([{ ...tee120, quantity: 2 }]);
    expect(result.problem).toContain('4 行');
  });

  it('値がないときは空のカート、localStorage が使えないときも空のカート（境界）', () => {
    expect(loadCart(memoryStorage(), PRODUCTS)).toEqual([]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(loadCart(throwing, PRODUCTS)).toEqual([]);
    const full = {
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(saveCart(full, [{ ...tee120, quantity: 1 }])).toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
