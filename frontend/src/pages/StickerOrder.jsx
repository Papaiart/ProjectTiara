import { assetUrl } from '../api';
import SubmissionForm from '../components/SubmissionForm.jsx';

export default function StickerOrder() {
  return (
    <section className="section container">
      <div className="center">
        <img src={assetUrl('decor/sticker.svg')} alt="" style={{ width: 110, margin: '0 auto' }} />
        <h1 className="section-title" style={{ marginTop: 10 }}>Matrica rendelés</h1>
        <p className="section-sub">
          Szeretnéd a kedvenc plecsnijeidet matricaként is? Töltsd ki az űrlapot, és felveszem veled
          a kapcsolatot a részletekről.
        </p>
      </div>
      <div className="form-narrow">
        <SubmissionForm
          type="sticker"
          subjectLabel="Közlemény / tárgy"
          subjectPlaceholder="Pl. Matrica csomag rendelés"
          extraFields={[
            { key: 'darab', label: 'Kívánt mennyiség (db)', placeholder: 'Pl. 10' },
            { key: 'cim', label: 'Szállítási cím (ha van)', placeholder: 'Irányítószám, város, utca' },
          ]}
        />
      </div>
    </section>
  );
}
