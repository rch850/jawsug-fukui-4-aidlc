import { Link, Navigate } from 'react-router-dom';
import { buttonClassName } from '../components/buttonClassName';
import { useCart } from '../state/cartContext';
import { pageTitle } from './pageTitle';

/** 注文完了 `/complete`（US-9）。注文を確定していないのに開いたら一覧へ（FR-4.6）。 */
export function CompletePage() {
  const { lastOrderNumber } = useCart();
  if (!lastOrderNumber) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="container page">
      <title>{pageTitle('注文完了')}</title>
      <div className="complete" data-testid="complete">
        <h1 className="page-title">ご注文ありがとうございました</h1>
        <p className="complete__number">
          注文番号: <strong data-testid="order-number">{lastOrderNumber}</strong>
        </p>
        <p className="text-sub">※ デモのため、実際には発送されません</p>
        <Link to="/" className={buttonClassName('primary')} data-testid="complete-continue">
          買い物を続ける
        </Link>
      </div>
    </div>
  );
}
