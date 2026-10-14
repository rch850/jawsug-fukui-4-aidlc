import { useSearchParams } from 'react-router-dom';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import {
  categoryFilterLabel,
  filterByCategory,
  parseCategoryFilter,
  type CategoryFilter,
} from '../domain/catalog';
import { pageTitle } from './pageTitle';

/** 商品一覧 `/`（US-1、US-2）。絞り込みは URL の ?category= に持つ（戻るボタンで戻せる）。 */
export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseCategoryFilter(searchParams.get('category'));
  const products = filterByCategory(PRODUCTS, filter);

  const handleChange = (next: CategoryFilter) => {
    setSearchParams(next === 'all' ? {} : { category: next });
  };

  const heading = filter === 'all' ? 'すべての商品' : `${categoryFilterLabel(filter)}の商品`;

  return (
    <div className="container page">
      <title>{pageTitle(filter === 'all' ? '商品一覧' : heading)}</title>
      <h1 className="page-title">{heading}</h1>
      <CategoryTabs value={filter} onChange={handleChange} />
      <p className="result-count text-sub" data-testid="product-count" aria-live="polite">
        {products.length} 点
      </p>
      <ul className="product-grid" data-testid="product-grid">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
