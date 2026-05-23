import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import Stars from './Stars.jsx';

function fmtDate(s) {
  if (!s) return '';
  return new Date(s.replace(' ', 'T')).toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function CommentList({ comments, setComments }) {
  const { user } = useAuth();
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState('');

  function patch(updated) {
    setComments((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function approve(c) {
    patch(await api.post(`/api/comments/${c.id}/approve`));
  }
  async function unapprove(c) {
    patch(await api.post(`/api/comments/${c.id}/unapprove`));
  }
  async function thanks(c) {
    patch(await api.post(`/api/comments/${c.id}/thanks`));
  }
  async function sendReply(c) {
    const updated = await api.post(`/api/comments/${c.id}/reply`, { reply: replyText });
    patch(updated);
    setReplyFor(null);
    setReplyText('');
  }

  if (!comments.length)
    return <p className="empty">Még nincs teljesítés. Legyél te az első!</p>;

  return (
    <div>
      {comments.map((c) => (
        <div key={c.id} className={'comment' + (c.approved ? ' approved' : '')}>
          <div className="comment__head">
            <span>
              <span className="comment__author" style={{ color: c.approved ? 'var(--green)' : 'var(--ink)' }}>
                {c.username}
              </span>{' '}
              <span className="small muted">/ {fmtDate(c.created_at)}</span>
            </span>
            {c.approved ? (
              <span className="tag tag--active">jóváhagyva ✓</span>
            ) : (
              <span className="tag">elbírálás alatt</span>
            )}
          </div>

          <p style={{ margin: '8px 0' }}>{c.body}</p>

          {c.rating ? (
            <div className="small">Értékelés: <Stars value={c.rating} /></div>
          ) : null}
          {c.moly_link && (
            <p className="small">
              Moly link:{' '}
              <a href={c.moly_link} target="_blank" rel="noreferrer">{c.moly_link}</a>
            </p>
          )}

          {/* Admin válasz */}
          {c.admin_reply && (
            <div className="comment__reply">
              <strong>Tiara</strong> <span className="small muted">/ {fmtDate(c.admin_reply_at)}</span>
              <p style={{ margin: '6px 0 0' }}>{c.admin_reply}</p>
              {/* „Köszönöm” gomb a hozzászólás tulajdonosának */}
              {user && user.id === c.user_id && (
                <button
                  className={'btn btn--sm ' + (c.thanked ? 'btn--green' : 'btn--ghost')}
                  style={{ marginTop: 8 }}
                  disabled={c.thanked}
                  onClick={() => thanks(c)}
                >
                  {c.thanked ? 'Megköszönted ✓' : 'Köszönöm'}
                </button>
              )}
            </div>
          )}

          {/* Admin vezérlők */}
          {user?.is_admin && (
            <div className="pill-row" style={{ marginTop: 12 }}>
              {c.approved ? (
                <button className="btn btn--ghost btn--sm" onClick={() => unapprove(c)}>
                  − Jóváhagyás visszavonása
                </button>
              ) : (
                <button className="btn btn--green btn--sm" onClick={() => approve(c)}>
                  + Jóváhagyom (plecsni kiosztása)
                </button>
              )}
              {replyFor === c.id ? null : (
                <button className="btn btn--outline btn--sm" onClick={() => { setReplyFor(c.id); setReplyText(c.admin_reply || ''); }}>
                  Válasz
                </button>
              )}
            </div>
          )}

          {user?.is_admin && replyFor === c.id && (
            <div style={{ marginTop: 10 }}>
              <textarea
                className="textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Köszönöm a teljesítést! ..."
              />
              <div className="pill-row" style={{ marginTop: 8 }}>
                <button className="btn btn--primary btn--sm" onClick={() => sendReply(c)}>Küldés</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setReplyFor(null)}>Mégse</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
