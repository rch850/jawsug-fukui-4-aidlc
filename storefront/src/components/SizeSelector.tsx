/**
 * サイズの選択（US-3）。S〜XL、キッズは 110〜140。選んだものは黒地に白文字。
 * ネイティブのラジオボタンなので、矢印キーで選べる（A-9）。
 */
export function SizeSelector({
  sizes,
  value,
  onChange,
  name,
}: {
  sizes: readonly string[];
  value: string | undefined;
  onChange: (size: string) => void;
  name: string;
}) {
  return (
    <fieldset className="option-group" data-testid="size-options">
      <legend className="option-group__legend">
        サイズ: <span data-testid="selected-size">{value ?? '未選択'}</span>
      </legend>
      <div className="option-group__options">
        {sizes.map((size) => {
          const id = `${name}-${size}`;
          return (
            <div key={size} className="radio-option">
              <input
                type="radio"
                id={id}
                name={name}
                value={size}
                checked={value === size}
                onChange={() => onChange(size)}
                data-testid={`size-option-${size}`}
              />
              <label htmlFor={id} className="size-chip">
                {size}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
