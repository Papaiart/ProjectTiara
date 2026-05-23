import { useEffect, useState } from 'react';

function diff(deadline) {
  const end = new Date(deadline.replace(' ', 'T')).getTime();
  const now = Date.now();
  let s = Math.max(0, Math.floor((end - now) / 1000));
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const mins = Math.floor(s / 60);
  const secs = s - mins * 60;
  return { days, hours, mins, secs, ended: end <= now };
}

export default function Countdown({ deadline }) {
  const [t, setT] = useState(() => diff(deadline));
  useEffect(() => {
    const id = setInterval(() => setT(diff(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (t.ended) return <span className="tag tag--closed">Lejárt</span>;

  const boxes = [
    { n: t.days, l: 'nap' },
    { n: t.hours, l: 'óra' },
    { n: t.mins, l: 'perc' },
    { n: t.secs, l: 'mp' },
  ];
  return (
    <div className="countdown">
      {boxes.map((b) => (
        <div className="countdown__box" key={b.l}>
          <div className="countdown__num">{String(b.n).padStart(2, '0')}</div>
          <div className="countdown__label">{b.l}</div>
        </div>
      ))}
    </div>
  );
}
