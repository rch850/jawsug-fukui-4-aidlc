import { useEffect, useState, type ReactNode } from 'react';

export const TOAST_DURATION_MS = 3000;

export type ToastMessage = {
  /** 同じ文言でも出し直すたびに変わる値（タイマーのリセット用） */
  id: number;
  message: string;
};

/**
 * 画面下部の通知（Q2: A）。3 秒で消えるが、マウスを重ねている間と
 * フォーカスがある間は消さない。role="status" で読み上げる（A-6）。
 * 読み上げを確実にするため、通知がないときも領域自体は置いておく。
 */
export function Toast({
  toast,
  onDismiss,
  action,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
  action?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!toast || hovered || focused) return;
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, hovered, focused, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div
          key={toast.id}
          className="toast"
          data-testid="toast"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          <span>{toast.message}</span>
          {action}
        </div>
      )}
    </div>
  );
}
