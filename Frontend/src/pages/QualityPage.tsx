import React from 'react';
import { Microscope, ShieldCheck, FileText } from 'lucide-react';

export const QualityPage: React.FC = () => {
  return (
    <div className="section-padding" style={{ paddingTop: '3rem' }}>
      <div className="section-header">
        <div className="section-badge">QUALITY ASSURANCE</div>
        <h2 className="section-title">Laboratory & Testing Standards</h2>
        <p className="section-subtitle">
          Every chemical batch manufactured at Raghav Texchems undergoes thorough analytical verification to satisfy strict global specifications.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <div className="quality-card" style={{ background: 'white', border: '1px solid var(--divider)', color: 'var(--text-primary)' }}>
          <div className="quality-icon"><Microscope size={26} /></div>
          <h3 className="quality-card-title" style={{ color: 'var(--text-primary)' }}>Spectrophotometric Color Testing</h3>
          <p className="quality-card-desc" style={{ color: 'var(--text-secondary)' }}>
            Dyestuffs and colorants are evaluated for chromatic strength, solubility, and fastness rating under standard light cabinets.
          </p>
        </div>

        <div className="quality-card" style={{ background: 'white', border: '1px solid var(--divider)', color: 'var(--text-primary)' }}>
          <div className="quality-icon"><ShieldCheck size={26} /></div>
          <h3 className="quality-card-title" style={{ color: 'var(--text-primary)' }}>Rheology & Viscosity Profiling</h3>
          <p className="quality-card-desc" style={{ color: 'var(--text-secondary)' }}>
            Polymer and acrylic emulsions undergo rotational viscometer testing to guarantee precise flow behavior and storage stability.
          </p>
        </div>

        <div className="quality-card" style={{ background: 'white', border: '1px solid var(--divider)', color: 'var(--text-primary)' }}>
          <div className="quality-icon"><FileText size={26} /></div>
          <h3 className="quality-card-title" style={{ color: 'var(--text-primary)' }}>COA & TDS Generation</h3>
          <p className="quality-card-desc" style={{ color: 'var(--text-secondary)' }}>
            Every shipment includes a Certificate of Analysis (COA) specifying pH, active solids content, specific gravity, and batch purity.
          </p>
        </div>
      </div>
    </div>
  );
};
