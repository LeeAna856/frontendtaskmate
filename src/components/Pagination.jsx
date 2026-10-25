/**
 * Pagination control driven by the Laravel paginator meta payload.
 */
export default function Pagination({ meta = {}, onPageChange }) {
  const { current_page: currentPage = 1, last_page: lastPage = 1, total = 0, from, to } = meta

  if (!lastPage || lastPage <= 1) {
    if (!total) return null

    return (
      <div className="tm-pagination">
        <span className="tm-pagination__info">
          Showing {from ?? 0}–{to ?? 0} of {total} task{total === 1 ? '' : 's'}
        </span>
      </div>
    )
  }

  const pages = buildPageList(currentPage, lastPage)

  return (
    <div className="tm-pagination">
      <span className="tm-pagination__info">
        Showing {from ?? 0}–{to ?? 0} of {total} task{total === 1 ? '' : 's'}
      </span>

      <div className="tm-pagination__pages">
        <button
          type="button"
          className="tm-page-btn"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </button>

        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`gap-${index}`} className="tm-page-btn" style={{ border: 'none', background: 'none', cursor: 'default' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`tm-page-btn${page === currentPage ? ' is-active' : ''}`}
              onClick={() => onPageChange?.(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          className="tm-page-btn"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label="Next page"
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/** Builds a compact page list with ellipsis placeholders. */
function buildPageList(current, last) {
  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', last]
  }

  if (current >= last - 3) {
    return [1, '...', last - 4, last - 3, last - 2, last - 1, last]
  }

  return [1, '...', current - 1, current, current + 1, '...', last]
}
