import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../api';
import { useAuth } from '../auth.jsx';

export default function VoteWidget() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/api/polls/active').then(setPolls).catch((e) => setErr(e.message));
  }, []);

  async function vote(pollId, optionId) {
    if (!user) return;
    try {
      const updated = await api.post(`/api/polls/${pollId}/vote`, { optionId });
      setPolls((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err) return <p className="alert alert--error">{err}</p>;
  if (!polls.length) return <p className="empty">Most nincs aktív szavazás.</p>;

  return (
    <div className="grid" style={{ gap: 28 }}>
      {polls.map((poll) => (
        <div className="box" key={poll.id}>
          <h3 style={{ marginTop: 0 }}>{poll.question}</h3>
          {!user && (
            <p className="small muted">
              A szavazáshoz <Link to="/belepes">jelentkezz be</Link>.
            </p>
          )}
          {poll.options.map((o) => (
            <div
              key={o.id}
              className={'vote-option' + (poll.my_option === o.id ? ' chosen' : '')}
              onClick={() => vote(poll.id, o.id)}
              role="button"
            >
              <div className="vote-head">
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {o.image && (
                    <img src={assetUrl('books/' + o.image)} alt="" style={{ height: 40, borderRadius: 4 }} />
                  )}
                  <strong>{o.label}</strong>
                  {poll.my_option === o.id && <span className="tag tag--active">a te szavazatod</span>}
                </span>
                <span className="muted">{o.percent}%</span>
              </div>
              <div className="vote-bar">
                <div className="vote-bar__fill" style={{ width: o.percent + '%' }} />
              </div>
            </div>
          ))}
          <p className="small muted" style={{ marginBottom: 0 }}>
            Összesen {poll.total_votes} szavazat
          </p>
        </div>
      ))}
    </div>
  );
}
