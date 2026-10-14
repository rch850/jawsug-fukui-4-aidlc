import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CompletePage } from './pages/CompletePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductListPage } from './pages/ProductListPage';

/** 画面が変わったらページの先頭から表示する（絞り込みの切り替えでは動かさない）。 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** 画面とパス（FR-0.2）。 */
export function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/complete" element={<CompletePage />} />
          <Route path="*" element={<NotFoundPage message="ページが見つかりません" />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            FUKUI BASICS（架空のブランド）の画面モックアップです。決済・発送は行いません。商品写真:
            Unsplash（出典は CREDITS.md）
          </p>
        </div>
      </footer>
    </>
  );
}
