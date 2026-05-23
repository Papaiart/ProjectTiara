import { assetUrl } from '../api';
import Stars from './Stars.jsx';

export default function BookCard({ book, onEdit, onDelete }) {
  return (
    <div className="book-card">
      <img
        className="book-card__cover"
        src={book.image ? assetUrl(book.image) : assetUrl('books/placeholder.svg')}
        alt={book.title}
        onError={(e) => { e.currentTarget.src = assetUrl('books/placeholder.svg'); }}
      />
      <div className="book-card__body">
        <div className="book-card__title">{book.title}</div>
        {book.author && <div className="small muted">{book.author}</div>}
        {book.rating ? <Stars value={book.rating} /> : null}
        {book.review && <p className="small" style={{ margin: '6px 0 0' }}>{book.review}</p>}
        {(onEdit || onDelete) && (
          <div className="pill-row" style={{ marginTop: 'auto', paddingTop: 10 }}>
            {onEdit && <button className="btn btn--ghost btn--sm" onClick={() => onEdit(book)}>Szerkesztés</button>}
            {onDelete && <button className="btn btn--ghost btn--sm" onClick={() => onDelete(book)}>Törlés</button>}
          </div>
        )}
      </div>
    </div>
  );
}
