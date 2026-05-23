import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, assetUrl } from '../api';
import { useAuth } from '../auth.jsx';
import BookCard from '../components/BookCard.jsx';
import Modal from '../components/Modal.jsx';
import Stars from '../components/Stars.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

const PAGE_SIZE = 8;
const EMPTY_BOOK = { title: '', author: '', image: '', review: '', rating: 0 };

export default function Profile() {
  const { username: paramName } = useParams();
  const { user } = useAuth();
  const username = paramName || user?.username;

  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // book object or null
  const [showForm, setShowForm] = useState(false);

  const isOwn = !!user && data && user.username === data.user.username;

  const load = useCallback(() => {
    if (!username) return;
    api.get('/api/users/' + username).then(setData).catch((e) => setErr(e.message));
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const pages = useMemo(() => (data ? Math.ceil(data.books.length / PAGE_SIZE) : 0), [data]);
  const shown = data ? data.books.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : [];

  function openNew() { setEditing({ ...EMPTY_BOOK }); setShowForm(true); }
  function openEdit(book) { setEditing({ ...book, rating: book.rating || 0 }); setShowForm(true); }

  async function saveBook(e) {
    e.preventDefault();
    const payload = {
      title: editing.title, author: editing.author, image: editing.image,
      review: editing.review, rating: editing.rating || null,
    };
    if (editing.id) await api.patch('/api/books/' + editing.id, payload);
    else await api.post('/api/books', payload);
    setShowForm(false); setEditing(null); setPage(0); load();
  }

  async function deleteBook(book) {
    if (!confirm(`Törlöd ezt: „${book.title}”?`)) return;
    await api.del('/api/books/' + book.id);
    load();
  }

  if (err) return <section className="section container"><p className="alert alert--error">{err}</p></section>;
  if (!username) return <section className="section container"><p className="empty">Jelentkezz be a profilodhoz.</p></section>;
  if (!data) return <div className="spinner" />;

  return (
    <section className="section container">
      {/* Fej */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--cream-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--gold-dark)', overflow: 'hidden' }}>
          {data.user.avatar ? <img src={assetUrl(data.user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : data.user.username[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{data.user.username}</h1>
          {data.user.bio && <p className="muted" style={{ margin: 0 }}>{data.user.bio}</p>}
        </div>
      </div>

      {/* Plecsni gyűjtemény – lebegő */}
      <div className="box" style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Plecsni gyűjteményem</h2>
        {data.badges.length === 0 ? (
          <p className="empty">Még nincs plecsni. Teljesíts egy kihívást, és itt fog megjelenni!</p>
        ) : (
          <div className="badge-shelf">
            {data.badges.map((b) => (
              <div className="badge-coin" key={b.slug} title={b.name}>
                <img src={assetUrl('badges/' + b.image)} alt={b.name} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Könyves polc */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Könyves polcom</h2>
          {isOwn && <button className="btn btn--primary" onClick={openNew}>+ Új könyv</button>}
        </div>
        <p className="small muted">Olvasónapló: minden könyvedről kép és szöveges értékelés. Összesen {data.books.length} könyv.</p>

        {data.books.length === 0 ? (
          <p className="empty">{isOwn ? 'Még üres a polcod. Add hozzá az első könyvedet!' : 'Ez a polc még üres.'}</p>
        ) : (
          <>
            <div className="bookshelf">
              {shown.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  onEdit={isOwn ? openEdit : undefined}
                  onDelete={isOwn ? deleteBook : undefined}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button className="page-dot" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} className={'page-dot' + (i === page ? ' active' : '')} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                <button className="page-dot" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>›</button>
                <span className="small muted" style={{ marginLeft: 8 }}>össz: {data.books.length}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Könyv űrlap modal */}
      {showForm && editing && (
        <Modal title={editing.id ? 'Könyv szerkesztése' : 'Új könyv a polcra'} onClose={() => setShowForm(false)}>
          <form onSubmit={saveBook}>
            <div className="field">
              <label>Könyv címe *</label>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required autoFocus />
            </div>
            <div className="field">
              <label>Író</label>
              <input className="input" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
            </div>
            <div className="field">
              <label>Borító kép</label>
              <ImageUpload value={editing.image} onUploaded={(url) => setEditing({ ...editing, image: url })} label="Borító feltöltése" />
            </div>
            <div className="field">
              <label>Értékelés</label>
              <Stars value={editing.rating} onChange={(r) => setEditing({ ...editing, rating: r })} />
            </div>
            <div className="field">
              <label>Szöveges értékelés</label>
              <textarea className="textarea" value={editing.review} onChange={(e) => setEditing({ ...editing, review: e.target.value })} placeholder="Mit gondoltál a könyvről?" />
            </div>
            <button className="btn btn--primary btn--block">{editing.id ? 'Mentés' : 'Hozzáadás a polchoz'}</button>
          </form>
        </Modal>
      )}

      {!isOwn && (
        <p className="small muted" style={{ marginTop: 30 }}>
          <Link to="/profil">&larr; Saját profil</Link>
        </p>
      )}
    </section>
  );
}
