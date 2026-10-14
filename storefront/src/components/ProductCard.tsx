import { Link } from 'react-router-dom';
import { COLOR_HEX, needsOutline } from '../data/colors';
import type { Product } from '../data/products';
import { formatPrice } from '../domain/catalog';
import { ProductImage } from './ProductImage';

/** 一覧の商品カード（US-1）。カード全体が詳細へのリンク。 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card"
      data-testid={`product-card-${product.id}`}
    >
      <ProductImage product={product} variant="card" />
      <div className="product-card__body">
        <span className="product-card__name">{product.name}</span>
        <span className="product-card__price">
          {formatPrice(product.price)}
          <span className="visually-hidden">（税込）</span>
        </span>
        <span className="visually-hidden">カラー {product.colors.length} 色</span>
        <ul className="product-card__dots" aria-hidden="true">
          {product.colors.map((color) => (
            <li
              key={color}
              className={`color-dot${needsOutline(color) ? ' color-dot--outline' : ''}`}
              style={{ background: COLOR_HEX[color] }}
            />
          ))}
        </ul>
      </div>
    </Link>
  );
}
