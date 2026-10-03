import { useState } from 'react';
import { COLOR_HEX, needsOutline, textColorOn } from '../data/colors';
import photosJson from '../data/photos.json';
import type { Product } from '../data/products';
import { productImageAlt } from '../domain/catalog';

type PhotoCredit = { file: string; photographer: string; photoUrl: string };

const PHOTOS: Partial<Record<string, PhotoCredit>> = photosJson;

/**
 * 商品写真（FR-0.3）。写真を同梱できなかった商品、または読み込みに失敗したときは、
 * 1 色目のカラーコードで塗った枠に商品名とカラー名を書いて代わりに表示する。
 */
export function ProductImage({
  product,
  variant = 'card',
  className,
}: {
  product: Product;
  variant?: 'card' | 'detail' | 'thumb';
  className?: string;
}) {
  const photo = PHOTOS[product.id];
  const [failed, setFailed] = useState(false);
  const alt = productImageAlt(product);
  const classes = ['product-image', `product-image--${variant}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  if (photo && !failed) {
    return (
      <div className={classes}>
        <img
          src={`${import.meta.env.BASE_URL}${photo.file}`}
          alt={alt}
          width={800}
          height={1067}
          loading={variant === 'detail' ? 'eager' : 'lazy'}
          onError={() => {
            console.warn(`商品写真を読み込めませんでした: ${photo.file}（代わりの枠を表示します）`);
            setFailed(true);
          }}
          data-testid={`product-image-${product.id}`}
        />
      </div>
    );
  }

  const firstColor = product.colors[0] ?? 'グレー';
  return (
    <div className={classes}>
      <div
        className={`product-image__fallback${needsOutline(firstColor) ? ' product-image__fallback--outline' : ''}`}
        style={{ background: COLOR_HEX[firstColor], color: textColorOn(firstColor) }}
        role="img"
        aria-label={alt}
        data-testid={`product-image-fallback-${product.id}`}
      >
        {variant !== 'thumb' && (
          <>
            <span className="product-image__fallback-name" aria-hidden="true">
              {product.name}
            </span>
            <span aria-hidden="true">{firstColor}</span>
          </>
        )}
      </div>
    </div>
  );
}
