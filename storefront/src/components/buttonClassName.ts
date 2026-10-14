/** ボタンの見た目のクラス名（リンクをボタンの見た目にするとき用）。 */
export function buttonClassName(variant: 'primary' | 'secondary' = 'primary'): string {
  return `button button--${variant}`;
}
