/**
 * ダミーの注文番号を作る（FR-4.5）。形式は FB-YYYYMMDD-NNNN（NNNN は 4 桁の乱数）。
 * 日付は利用者の端末のローカル日付を使う。テストのため日付と乱数を差し替えられる。
 */
export function generateOrderNumber(now: Date = new Date(), random: () => number = Math.random) {
  if (Number.isNaN(now.getTime())) {
    throw new RangeError('注文番号の日付が不正です');
  }
  const yyyy = String(now.getFullYear()).padStart(4, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const r = random();
  const n = Math.min(9999, Math.max(0, Math.floor((Number.isFinite(r) ? r : 0) * 10000)));
  return `FB-${yyyy}${mm}${dd}-${String(n).padStart(4, '0')}`;
}

export const ORDER_NUMBER_PATTERN = /^FB-\d{8}-\d{4}$/;
