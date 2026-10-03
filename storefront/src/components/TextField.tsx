import type { InputHTMLAttributes, Ref } from 'react';
import { InlineError } from './InlineError';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'value'> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * ラベル付きの入力欄（A-2）。必須は「*」と aria-required、エラーは「!」と文言を
 * aria-invalid / aria-describedby で入力欄に関連付ける（A-3）。
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  required = true,
  ref,
  ...rest
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__label">
        {label}
        {required && (
          <span className="text-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        {...rest}
        ref={ref}
        id={id}
        className="text-field__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-testid={`checkout-${id}`}
      />
      {hint && (
        <span id={hintId} className="text-field__hint">
          {hint}
        </span>
      )}
      {error && <InlineError id={errorId} message={error} testId={`checkout-error-${id}`} />}
    </div>
  );
}
