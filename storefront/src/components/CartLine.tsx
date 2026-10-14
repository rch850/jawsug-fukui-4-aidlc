import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { formatPrice } from '../domain/catalog';
import {
  MAX_QUANTITY_PER_LINE,
  MIN_QUANTITY_PER_LINE,
  lineKey,
  lineSubtotal,
  type CartLine as CartLineData,
} from '../domain/cart';
import { ProductImage } from './ProductImage';

const QUANTITY_OPTIONS = Array.from(
  { length: MAX_QUANTITY_PER_LINE - MIN_QUANTITY_PER_LINE + 1 },
  (_, i) => MIN_QUANTITY_PER_LINE + i,
);

/** カートの 1 行（US-5 / US-6）。数量は 1〜10 のセレクト、削除ボタンは確認なし。 */
export function CartLine({
  line,
  product,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineData;
  product: Product;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const key = lineKey(line);
  const testKey = `${line.productId}-${line.color}-${line.size}`;
  const quantityId = `quantity-${testKey}`;
  return (
    <li className="cart-line" data-testid={`cart-line-${testKey}`}>
      <ProductImage product={product} variant="thumb" className="cart-line__image" />
      <div className="cart-line__info">
        <Link to={`/products/${product.id}`} className="cart-line__name">
          {product.name}
        </Link>
        <span className="text-sub">
          {line.color} / {line.size}
        </span>
        <span>
          {formatPrice(product.price)}
          <span className="visually-hidden">（単価）</span>
        </span>
      </div>
      <div className="cart-line__controls">
        <div className="cart-line__quantity">
          <label htmlFor={quantityId}>数量</label>
          <select
            id={quantityId}
            value={line.quantity}
            onChange={(event) => onQuantityChange(key, Number(event.target.value))}
            data-testid={`cart-quantity-${testKey}`}
          >
            {QUANTITY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <span className="cart-line__subtotal" data-testid={`cart-subtotal-${testKey}`}>
          <span className="visually-hidden">小計 </span>
          {formatPrice(lineSubtotal(line, product))}
        </span>
        <button
          type="button"
          className="cart-line__remove"
          aria-label={`${product.name} ${line.color} ${line.size}を削除`}
          onClick={() => onRemove(key)}
          data-testid={`cart-remove-${testKey}`}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </li>
  );
}
