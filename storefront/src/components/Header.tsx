import { Link } from 'react-router-dom';
import { useCart } from '../state/cartContext';

/** 共通ヘッダー（FR-0.1）。ロゴで一覧へ、カートのリンクに数量の合計を出す。 */
export function Header() {
  const { totalQuantity } = useCart();
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" data-testid="header-logo">
          FUKUI BASICS
        </Link>
        <Link
          to="/cart"
          className="site-header__cart"
          data-testid="header-cart-link"
          aria-label={`カート（${totalQuantity} 点）`}
        >
          カート{' '}
          <span className="site-header__count" data-testid="header-cart-count">
            ({totalQuantity})
          </span>
        </Link>
      </div>
    </header>
  );
}
