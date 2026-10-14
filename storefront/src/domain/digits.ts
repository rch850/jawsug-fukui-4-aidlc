/**
 * 番号の入力を判定用に整える。全角数字は半角に、ハイフン（全角・長音記号を含む）と空白は取り除く。
 * 例: "１２３－４５６７" → "1234567"
 *
 * 郵便番号（address.ts）と電話番号（checkout.ts）の両方で使うため、独立したモジュールに置く。
 */
export function normalizeDigits(value: string): string {
  return value.normalize('NFKC').replace(/[\s\-‐‑‒–—―−ー]/g, '');
}
