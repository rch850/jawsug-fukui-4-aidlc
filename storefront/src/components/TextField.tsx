import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { InlineError } from './InlineError';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'value'> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  /** 入力欄の下に添える内容（郵便番号の自動入力の状態など）。 */
  children?: ReactNode;
};

/**
 * ラベル付きの入力欄（A-2）。必須は「*」と aria-required、エラーは「!」と文言を
 * aria-invalid / aria-describedby で入力欄に関連付ける（A-3）。任意の項目はラベルに「任意」と出す。
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
  children,
  ...rest
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
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
      {children}
    </div>
  );
}
