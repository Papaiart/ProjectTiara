import { assetUrl } from '../api';
import SubmissionForm from '../components/SubmissionForm.jsx';

export default function PrizeGame() {
  return (
    <section className="section container">
      <div className="center">
        <img src={assetUrl('decor/gift.svg')} alt="" style={{ width: 110, margin: '0 auto' }} />
        <h1 className="section-title" style={{ marginTop: 10 }}>Nyereményjáték</h1>
        <p className="section-sub">
          Töltsd ki az űrlapot, és benne vagy a sorsolásban! A jelentkezésedet emailben kapom meg,
          és hamarosan válaszolok.
        </p>
      </div>
      <div className="form-narrow">
        <SubmissionForm
          type="prize"
          subjectLabel="Közlemény / tárgy (pl. melyik játék?)"
          subjectPlaceholder="Pl. Tavaszi nyereményjáték"
        />
      </div>
    </section>
  );
}
