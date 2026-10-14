import type { Product } from '../data/products';

/** 1 行あたりの数量の上限（FR-3.2 / FR-3.4）。 */
export const MAX_QUANTITY_PER_LINE = 10;
export const MIN_QUANTITY_PER_LINE = 1;

/** localStorage のキー。保存するのはカートの中身だけ（NFR-2）。 */
export const CART_STORAGE_KEY = 'fukui-basics:cart:v1';

/**
 * カートの 1 行。localStorage にはこの 4 項目だけを保存する（NFR-2）。
 * 同じ商品・カラー・サイズは 1 行にまとめる。
 */
export type CartLine = {
  productId: string;
  color: string;
  size: string;
  quantity: number;
};

export type CartItemRef = Pick<CartLine, 'productId' | 'color' | 'size'>;

export type AddResult =
  { ok: true; lines: CartLine[] } | { ok: false; reason: 'limit'; lines: CartLine[] };

/** 行を一意に表すキー（商品 ID・カラー・サイズ）。 */
export function lineKey(item: CartItemRef): string {
  return `${item.productId}|${item.color}|${item.size}`;
}

/**
 * 1 個カートに入れる（FR-2.3 / FR-3.4）。
 * 同じ商品・カラー・サイズの行があれば数量を 1 足す。すでに上限 10 個なら追加しない。
 */
export function addToCart(lines: readonly CartLine[], item: CartItemRef): AddResult {
  const key = lineKey(item);
  const existing = lines.find((line) => lineKey(line) === key);
  if (!existing) {
    return { ok: true, lines: [...lines, { ...item, quantity: 1 }] };
  }
  if (existing.quantity >= MAX_QUANTITY_PER_LINE) {
    return { ok: false, reason: 'limit', lines: [...lines] };
  }
  return {
    ok: true,
    lines: lines.map((line) =>
      lineKey(line) === key ? { ...line, quantity: line.quantity + 1 } : line,
    ),
  };
}

export function isValidQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity >= MIN_QUANTITY_PER_LINE &&
    quantity <= MAX_QUANTITY_PER_LINE
  );
}

/**
 * 数量を変える（FR-3.2）。1〜10 以外は呼び出し側の誤りなので RangeError を投げる。
 * 画面の数量の選択欄は 1〜10 しか選べないため、通常は起きない。
 */
export function updateQuantity(
  lines: readonly CartLine[],
  key: string,
  quantity: number,
): CartLine[] {
  if (!isValidQuantity(quantity)) {
    throw new RangeError(
      `数量は ${MIN_QUANTITY_PER_LINE}〜${MAX_QUANTITY_PER_LINE} の整数で指定してください: ${quantity}`,
    );
  }
  return lines.map((line) => (lineKey(line) === key ? { ...line, quantity } : line));
}

/** 行を削除する（FR-3.2）。 */
export function removeLine(lines: readonly CartLine[], key: string): CartLine[] {
  return lines.filter((line) => lineKey(line) !== key);
}

/** ヘッダーのカート件数（数量の合計。行数ではない）。 */
export function totalQuantity(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** 行の小計（単価 × 数量）。商品が見つからない行は 0 円。 */
export function lineSubtotal(line: CartLine, product: Product | undefined): number {
  return product ? product.price * line.quantity : 0;
}

/** 合計金額（税込、FR-3.3）。送料・手数料はかからない。 */
export function totalAmount(lines: readonly CartLine[], products: readonly Product[]): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      lineSubtotal(
        line,
        products.find((product) => product.id === line.productId),
      ),
    0,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 保存値の 1 行が正しい形で、今の商品データに存在するカラー・サイズかを確かめる。 */
function toValidLine(value: unknown, products: readonly Product[]): CartLine | null {
  if (!isRecord(value)) return null;
  const { productId, color, size, quantity } = value;
  if (typeof productId !== 'string' || typeof color !== 'string' || typeof size !== 'string') {
    return null;
  }
  if (typeof quantity !== 'number' || !isValidQuantity(quantity)) return null;
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  if (!product.colors.some((c) => c === color) || !product.sizes.includes(size)) return null;
  return { productId, color, size, quantity };
}

export type ParseResult = {
  lines: CartLine[];
  /** 保存値が壊れていた、または一部の行を捨てたときの理由（ログ用）。問題なければ undefined。 */
  problem?: string;
};

/**
 * localStorage の値をカートに戻す（FR-3.5 / FR-3.7）。
 * - 値がない → 空のカート
 * - JSON として読めない、配列でない → 空のカート（problem に理由）
 * - 形が正しくない行・今は存在しない商品の行 → その行だけ捨てる（problem に件数）
 * - 同じ商品・カラー・サイズが重複していたら、最初の行だけを使う
 */
export function parseCart(raw: string | null, products: readonly Product[]): ParseResult {
  if (raw === null || raw === '') return { lines: [] };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { lines: [], problem: 'カートの保存値を JSON として読めません' };
  }
  if (!Array.isArray(data)) {
    return { lines: [], problem: 'カートの保存値が配列ではありません' };
  }
  const lines: CartLine[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  for (const value of data) {
    const line = toValidLine(value, products);
    if (!line || seen.has(lineKey(line))) {
      dropped += 1;
      continue;
    }
    seen.add(lineKey(line));
    lines.push(line);
  }
  return dropped > 0
    ? { lines, problem: `カートの保存値のうち ${dropped} 行が不正なため捨てました` }
    : { lines };
}

/** カートを localStorage に保存する文字列にする。カートの 4 項目以外は書き出さない（NFR-2）。 */
export function serializeCart(lines: readonly CartLine[]): string {
  return JSON.stringify(
    lines.map(({ productId, color, size, quantity }) => ({ productId, color, size, quantity })),
  );
}

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

/**
 * localStorage からカートを読み込む。読み込めない・壊れているときは空のカートにして、
 * 理由を console.warn に出す（黙って失敗しない）。
 */
export function loadCart(
  storage: ReadableStorage | undefined,
  products: readonly Product[],
): CartLine[] {
  if (!storage) return [];
  let raw: string | null;
  try {
    raw = storage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn('カートを読み込めないため、空のカートとして扱います。', error);
    return [];
  }
  const { lines, problem } = parseCart(raw, products);
  if (problem) console.warn(`${problem}。読み込めた分だけをカートに戻します。`);
  return lines;
}

/** カートを localStorage に保存する。保存できないとき（容量超過・無効化など）は false を返す。 */
export function saveCart(
  storage: WritableStorage | undefined,
  lines: readonly CartLine[],
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CART_STORAGE_KEY, serializeCart(lines));
    return true;
  } catch (error) {
    console.warn('カートを保存できませんでした（再読み込みすると中身が消えます）。', error);
    return false;
  }
}
