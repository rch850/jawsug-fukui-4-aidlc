import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ColorSwatches } from '../components/ColorSwatches';
import { InlineError } from '../components/InlineError';
import { ProductImage } from '../components/ProductImage';
import { SizeSelector } from '../components/SizeSelector';
import { Toast, type ToastMessage } from '../components/Toast';
import { CATEGORY_LABELS, PRODUCTS, type Product } from '../data/products';
import { findProductById, formatPrice } from '../domain/catalog';
import { MAX_QUANTITY_PER_LINE } from '../domain/cart';
import { useCart } from '../state/cartContext';
import { NotFoundPage } from './NotFoundPage';
import { pageTitle } from './pageTitle';

const LIMIT_MESSAGE = `同じ商品は ${MAX_QUANTITY_PER_LINE} 点までです`;

/** 商品詳細 `/products/:id`（US-3、US-4）。 */
export function ProductDetailPage() {
  const { id } = useParams();
  const product = findProductById(PRODUCTS, id);
  if (!product) return <NotFoundPage />;
  // 商品が変わったら選択状態をリセットするため、key に商品 ID を使う
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [color, setColor] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [limitError, setLimitError] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const canAdd = color !== undefined && size !== undefined;

  const handleAdd = () => {
    if (color === undefined || size === undefined) return;
    const added = addItem({ productId: product.id, color, size });
    if (added) {
      setLimitError(false);
      setToast({ id: Date.now(), message: 'カートに追加しました' });
    } else {
      // 上限のエラーはボタンの下に残す（カラーかサイズを選び直すまで）
      setLimitError(true);
      setToast(null);
    }
  };

  return (
    <div className="container page">
      <title>{pageTitle(product.name)}</title>
      <Link to="/" className="back-link text-link" data-testid="back-to-list">
        &lt; 一覧に戻る
      </Link>
      <div className="product-detail" data-testid="product-detail">
        <div className="product-detail__media">
          <ProductImage product={product} variant="detail" />
        </div>
        <div className="product-detail__info">
          <div>
            <p className="product-detail__category">{CATEGORY_LABELS[product.category]}</p>
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__price" data-testid="product-price">
              {formatPrice(product.price)}
              <small>（税込）</small>
            </p>
          </div>
          <ColorSwatches
            name="color"
            colors={product.colors}
            value={color}
            onChange={(next) => {
              setColor(next);
              setLimitError(false);
            }}
          />
          <SizeSelector
            name="size"
            sizes={product.sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setLimitError(false);
            }}
          />
          <div className="add-to-cart">
            <Button
              block
              disabled={!canAdd}
              onClick={handleAdd}
              aria-describedby={
                !canAdd ? 'add-to-cart-hint' : limitError ? 'add-to-cart-error' : undefined
              }
              data-testid="add-to-cart"
            >
              カートに入れる
            </Button>
            {!canAdd && (
              <p id="add-to-cart-hint" className="add-to-cart__hint" data-testid="add-to-cart-hint">
                カラーとサイズを選んでください
              </p>
            )}
            {limitError && (
              <InlineError
                id="add-to-cart-error"
                message={LIMIT_MESSAGE}
                testId="cart-limit-error"
              />
            )}
          </div>
          <p className="product-detail__description" data-testid="product-description">
            {product.description}
          </p>
        </div>
      </div>
      <Toast
        toast={toast}
        onDismiss={dismissToast}
        action={
          <Link to="/cart" data-testid="toast-cart-link">
            カートを見る
          </Link>
        }
      />
    </div>
  );
}
