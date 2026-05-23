export default function Stars({ value = 0, max = 5, onChange }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= value;
    stars.push(
      onChange ? (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i === value ? 0 : i)}
          aria-label={`${i} csillag`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: 0, color: filled ? 'var(--gold)' : 'var(--line)' }}
        >
          {filled ? '★' : '☆'}
        </button>
      ) : (
        <span key={i} className={filled ? '' : 'off'}>
          {filled ? '★' : '☆'}
        </span>
      )
    );
  }
  return <span className="stars">{stars}</span>;
}
