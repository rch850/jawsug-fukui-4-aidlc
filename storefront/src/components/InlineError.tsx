/** エラーを色だけで示さず、「!」アイコンと文言で示す（A-3）。 */
export function InlineError({
  id,
  message,
  testId,
}: {
  id?: string;
  message: string;
  testId?: string;
}) {
  return (
    <p className="inline-error" id={id} data-testid={testId}>
      <span className="inline-error__icon" aria-hidden="true">
        !
      </span>
      <span>{message}</span>
    </p>
  );
}
