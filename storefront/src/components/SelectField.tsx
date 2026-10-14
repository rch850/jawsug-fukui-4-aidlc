import type { Ref, SelectHTMLAttributes } from 'react';
import { InlineError } from './InlineError';

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'id' | 'onChange' | 'value' | 'children'
> & {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** 未選択のときの先頭の選択肢。 */
  placeholder?: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
};

/**
 * ラベル付きの選択欄（都道府県など）。TextField と同じく、必須は「*」と aria-required、
 * エラーは「!」と文言を aria-invalid / aria-describedby で関連付ける（A-2、A-3）。
 */
export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = '選択してください',
  error,
  required = true,
  ref,
  ...rest
}: SelectFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__label">
        {label}
        {required ? (
          <span className="text-field__required" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="text-field__optional">任意</span>
        )}
      </label>
      <select
        {...rest}
        ref={ref}
        id={id}
        className="text-field__input text-field__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        data-testid={`checkout-${id}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <InlineError id={errorId} message={error} testId={`checkout-error-${id}`} />}
    </div>
  );
}
