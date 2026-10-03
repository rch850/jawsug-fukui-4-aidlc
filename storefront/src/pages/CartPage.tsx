import { Link } from 'react-router-dom';
import { buttonClassName } from '../components/buttonClassName';
import { CartLine } from '../components/CartLine';
import { PRODUCTS } from '../data/products';
import { findProductById, formatPrice } from '../domain/catalog';
import { lineKey } from '../domain/cart';
import { useCart } from '../state/cartContext';
import { pageTitle } from './pageTitle';

/** カート `/cart`（US-5、US-6）。 */
export function CartPage() {
  const { lines, totalAmount, setQuantity, removeItem } = useCart();

  return (
    <div className="container page">
      <title>{pageTitle('カート')}</title>
      <h1 className="page-title">カート</h1>
      {lines.length === 0 ? (
        <div className="empty-state" data-testid="cart-empty">
          <p className="empty-state__message">カートは空です</p>
          <Link to="/" className={buttonClassName('secondary')} data-testid="cart-empty-back">
            商品一覧へ
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-lines" data-testid="cart-lines">
            {lines.map((line) => {
              const product = findProductById(PRODUCTS, line.productId);
              // 読み込み時に存在しない商品の行は捨てているので、通常ここで undefined にはならない
              if (!product) return null;
              return (
                <CartLine
                  key={lineKey(line)}
                  line={line}
                  product={product}
                  onQuantityChange={setQuantity}
                  onRemove={removeItem}
                />
              );
            })}
          </ul>
          <div className="cart-summary">
            <p className="cart-summary__total">
              合計（税込） <span data-testid="cart-total">{formatPrice(totalAmount)}</span>
            </p>
            <Link to="/checkout" className={buttonClassName('primary')} data-testid="cart-checkout">
              注文手続きへ
            </Link>
            <Link to="/" className="text-link" data-testid="cart-continue">
              &lt; 買い物を続ける
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
