import React from 'react';
import { Microscope, ShieldCheck, FileText, CheckCircle2, Award, FlaskConical, Scale } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

export const QualityPage: React.FC = () => {
  const { certifications, companySettings } = useData();

  return (
    <div className="gov-quality-page">
      {/* 1. INSTITUTIONAL PAGE HEADER */}
      <section className="gov-page-header">
        <div className="gov-section-container">
          <div className="section-pre-tag">STATUTORY QUALITY MANAGEMENT & ANALYTICAL STANDARDS</div>
          <h1 className="gov-page-title">Quality Assurance & Laboratory Accreditation</h1>
          <p className="gov-page-lead">
            Raghav Texchems Chemical Private Limited operates in strict accordance with ISO 9001:2015 standards, Zero Discharge of Hazardous Chemicals (ZDHC) guidelines, and European REACH protocols to deliver zero-compromise chemical formulations.
          </p>
        </div>
      </section>

      <div className="gov-section-container" style={{ padding: '3rem 1.5rem' }}>
        {/* 2. QUALITY TESTING PROTOCOLS */}
        <div className="section-header-block">
          <div className="section-pre-tag">ANALYTICAL RIGOR</div>
          <h2 className="section-title">In-House Laboratory Verification Protocols</h2>
          <div className="section-accent-rule" />
        </div>

        <div className="quality-protocols-grid">
          <div className="protocol-card">
            <div className="protocol-icon-wrap"><Microscope size={26} /></div>
            <h3 className="protocol-title">Spectrophotometric Fastness & Chromatic Strength</h3>
            <p className="protocol-desc">
              Dyestuffs and colorants are evaluated for optical absorbance, chromatic yield, and wash/light fastness under standard daylight cabinets (D65).
            </p>
            <ul className="protocol-checks">
              <li><CheckCircle2 size={14} /> Color matching to ±0.5 DE tolerances</li>
              <li><CheckCircle2 size={14} /> Wash fastness testing (ISO 105-C06)</li>
            </ul>
          </div>

          <div className="protocol-card">
            <div className="protocol-icon-wrap"><FlaskConical size={26} /></div>
            <h3 className="protocol-title">Rheology & Rotational Viscosity Profiling</h3>
            <p className="protocol-desc">
              Polymer and acrylic emulsions undergo Brookfield rotational viscometer testing across variable shear rates to verify flow properties.
            </p>
            <ul className="protocol-checks">
              <li><CheckCircle2 size={14} /> Brookfield RVT/DV-II profiling</li>
              <li><CheckCircle2 size={14} /> Mechanical shear & freeze-thaw stability</li>
            </ul>
          </div>

          <div className="protocol-card">
            <div className="protocol-icon-wrap"><Scale size={26} /></div>
            <h3 className="protocol-title">Physicochemical Purity & Active Solids</h3>
            <p className="protocol-desc">
              Moisture analyzer ovens, digital refractometers, and calibrated pH meters verify active matter percentage before pre-dispatch sealing.
            </p>
            <ul className="protocol-checks">
              <li><CheckCircle2 size={14} /> Halogen thermogravimetric active solids</li>
              <li><CheckCircle2 size={14} /> Multi-point calibrated pH buffering</li>
            </ul>
          </div>

          <div className="protocol-card">
            <div className="protocol-icon-wrap"><FileText size={26} /></div>
            <h3 className="protocol-title">Pre-Dispatch COA (Certificate of Analysis)</h3>
            <p className="protocol-desc">
              Every dispatched tanker, IBC tote, or HDPE drum batch is accompanied by an authenticated Certificate of Analysis signed by laboratory chemists.
            </p>
            <ul className="protocol-checks">
              <li><CheckCircle2 size={14} /> Traceable lot & reactor batch numbering</li>
              <li><CheckCircle2 size={14} /> Complete physicochemical parameter logging</li>
            </ul>
          </div>
        </div>

        {/* 3. OFFICIAL STATUTORY ACCREDITATIONS */}
        <div className="section-header-block" style={{ marginTop: '4rem' }}>
          <div className="section-pre-tag">FORMAL ACCREDITATIONS</div>
          <h2 className="section-title">Recognized National & Global Certifications</h2>
          <div className="section-accent-rule" />
        </div>

        <div className="compliance-grid">
          {certifications.map((cert) => (
            <div key={cert.id} className="compliance-card">
              <div className="compliance-head">
                <ShieldCheck size={20} className="compliance-icon" />
                {cert.certificateNumber && (
                  <span className="cert-code">{cert.certificateNumber}</span>
                )}
              </div>
              <h3 className="compliance-title">{cert.title}</h3>
              <span className="compliance-body">{cert.issuingBody}</span>
              <p className="compliance-desc">{cert.description}</p>
            </div>
          ))}
        </div>

        {/* 4. DIRECTORATE COMMITMENT BANNER */}
        <div className="directorate-pledge-banner">
          <div className="pledge-left">
            <Award size={36} className="pledge-icon" />
            <div>
              <h3 className="pledge-title">Our Zero-Compromise Quality Guarantee</h3>
              <p className="pledge-desc">
                "We stake our enterprise reputation on the repeatability of every chemical drum that leaves our synthesis facility. Should any batch deviate from agreed COA specifications, our directorate guarantees immediate technical resolution."
              </p>
              <div className="pledge-signatories">
                <span>— {companySettings.contact1Name} (Director / Technical Sales)</span> &nbsp;|&nbsp;
                <span>{companySettings.contact2Name} (Director / Operations)</span>
              </div>
            </div>
          </div>
          <Link to="/contact" className="btn-gov-primary" style={{ flexShrink: 0 }}>
            <span>Request Sample Testing</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
