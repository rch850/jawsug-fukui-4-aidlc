import { Link } from 'react-router-dom';
import { buttonClassName } from '../components/buttonClassName';
import { pageTitle } from './pageTitle';

/** 見つからないときの表示（US-4）。商品詳細と、未定義のパスで使う。 */
export function NotFoundPage({ message = '商品が見つかりません' }: { message?: string }) {
  return (
    <div className="container page">
      <title>{pageTitle(message)}</title>
      <div className="empty-state" data-testid="not-found">
        <h1 className="empty-state__message">{message}</h1>
        <Link to="/" className={buttonClassName('secondary')} data-testid="not-found-back">
          商品一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
