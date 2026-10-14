import { COLOR_HEX, needsOutline, type ColorName } from '../data/colors';

/**
 * カラーの選択（US-3 / FR-2.5）。色見本の丸とカラー名を並べたラジオボタンのグループ。
 * ネイティブのラジオボタンなので、Tab でグループに入り矢印キーで選べる（A-9）。
 */
export function ColorSwatches({
  colors,
  value,
  onChange,
  name,
}: {
  colors: readonly ColorName[];
  value: string | undefined;
  onChange: (color: ColorName) => void;
  name: string;
}) {
  return (
    <fieldset className="option-group" data-testid="color-options">
      <legend className="option-group__legend">
        カラー: <span data-testid="selected-color">{value ?? '未選択'}</span>
      </legend>
      <div className="option-group__options">
        {colors.map((color) => {
          const id = `${name}-${color}`;
          return (
            <div key={color} className="radio-option">
              <input
                type="radio"
                id={id}
                name={name}
                value={color}
                checked={value === color}
                onChange={() => onChange(color)}
                data-testid={`color-option-${color}`}
              />
              <label htmlFor={id} className="swatch">
                <span
                  className={`swatch__chip${needsOutline(color) ? ' swatch__chip--outline' : ''}`}
                  style={{ background: COLOR_HEX[color] }}
                  aria-hidden="true"
                />
                <span className="swatch__name">{color}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
