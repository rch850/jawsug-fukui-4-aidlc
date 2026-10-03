/**
 * カラー名 → カラーコード（mockups.md「カラーコード」の表）。
 * 色見本の丸と、写真がないときの代替の枠の塗りに使う。
 */
export const COLOR_HEX = {
  ホワイト: '#FFFFFF',
  ブラック: '#1A1A1A',
  グレー: '#9E9E9E',
  ネイビー: '#1F2A44',
  ブルー: '#3B6EA5',
  ベージュ: '#D8C3A5',
  ピンク: '#F2B8C6',
  イエロー: '#F4D35E',
} as const;

export type ColorName = keyof typeof COLOR_HEX;

export const COLOR_NAMES = Object.keys(COLOR_HEX) as ColorName[];

/** 白背景に溶ける色（ホワイト）には #767676 の枠線を付ける（mockups.md の備考）。 */
export function needsOutline(color: ColorName): boolean {
  return color === 'ホワイト';
}

/**
 * 塗りの上に載せる文字色を、塗りの明るさから選ぶ（黒か白）。
 * WCAG の相対輝度で、黒文字と白文字のうちコントラストが高いほうを返す。
 */
export function textColorOn(color: ColorName): '#1A1A1A' | '#FFFFFF' {
  const hex = COLOR_HEX[color];
  const channel = (offset: number): number => {
    const v = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  const contrastWithBlack = (luminance + 0.05) / (0.0103 + 0.05); // #1A1A1A の輝度 ≒ 0.0103
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? '#1A1A1A' : '#FFFFFF';
}
