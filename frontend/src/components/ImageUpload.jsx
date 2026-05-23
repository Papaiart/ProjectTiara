import { useRef, useState } from 'react';
import { api, assetUrl } from '../api';

// Képfeltöltő. A feltöltött kép URL-jét az onUploaded(url) híváson át adja vissza.
export default function ImageUpload({ value, onUploaded, label = 'Kép feltöltése' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      const { url } = await api.upload(file);
      onUploaded(url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="upload-drop" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={assetUrl(value)} alt="" style={{ maxHeight: 140, margin: '0 auto', borderRadius: 8 }} />
        ) : (
          <p className="muted" style={{ margin: 0 }}>{busy ? 'Feltöltés...' : `📷 ${label}`}</p>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {err && <p className="small" style={{ color: '#9c4a4a' }}>{err}</p>}
      {value && (
        <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => onUploaded('')}>
          Kép törlése
        </button>
      )}
    </div>
  );
}
