interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  resultCount?: number;
  totalCount?: number;
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search people…',
  label = 'Search',
  resultCount,
  totalCount,
}: TableSearchProps) {
  return (
    <div className="table-search">
      <label className="table-search-field">
        <span className="sr-only">{label}</span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </label>
      {typeof resultCount === 'number' && typeof totalCount === 'number' ? (
        <span className="muted table-search-meta">
          {value.trim()
            ? `${resultCount} of ${totalCount}`
            : `${totalCount} row${totalCount === 1 ? '' : 's'}`}
        </span>
      ) : null}
    </div>
  );
}

export function matchesPersonSearch(
  query: string,
  fields: Array<string | null | undefined>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f ?? '').toLowerCase().includes(q));
}
