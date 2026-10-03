import type { ReactNode } from 'react';

/** ラジオボタンのグループ（支払い方法など）。fieldset と legend でグループ名を付ける。 */
export function RadioGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  children,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  children?: ReactNode;
}) {
  return (
    <fieldset className="option-group" data-testid={`radio-group-${name}`}>
      <legend className="option-group__legend">{legend}</legend>
      <div className="option-group__options">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <div key={option.value} className="radio-option">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                data-testid={`${name}-${option.value}`}
              />
              <label htmlFor={id} className="radio-option__label">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {children}
    </fieldset>
  );
}
