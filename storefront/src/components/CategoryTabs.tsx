import { CATEGORY_FILTERS, categoryFilterLabel, type CategoryFilter } from '../domain/catalog';

/** カテゴリの絞り込み（US-2）。選択中は aria-pressed と赤の下線（A-10）。 */
export function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}) {
  return (
    <div className="category-tabs" role="group" aria-label="カテゴリで絞り込む">
      {CATEGORY_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className="category-tabs__tab"
          aria-pressed={filter === value}
          onClick={() => onChange(filter)}
          data-testid={`category-tab-${filter}`}
        >
          {categoryFilterLabel(filter)}
        </button>
      ))}
    </div>
  );
}
