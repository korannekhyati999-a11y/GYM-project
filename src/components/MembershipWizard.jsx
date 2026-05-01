import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Wand2 } from 'lucide-react';

const symptomsList = {
  "Head and neck": ["Headache", "Neck pain/stiffness", "Lump or swelling"],
  "Heart/Circulation": ["High Blood Pressure", "Low Blood Pressure", "Swelling in feet or ankles", "Leg cramps", "Varicose/spider veins"],
  "Digestive": ["Bloating", "Constipation", "Diarrhoea"],
  "Eyes": ["Blurred vision", "Wear contacts", "Wear glasses", "Excessive/little tearing"],
  "Female Genito/Urinary": ["Late Period", "Pregnant", "Lump/pain in breasts", "Menstrual cramps", "Urinary Tract Infection", "Pain in genitals/groin"],
  "Skin": ["Bruise easily", "Open cuts/sores", "Skin allergies", "Tender areas on skin", "Infection/inflammation"],
  "Musculoskeletal": ["Aching Muscles", "Muscles sore to touch", "Aching joints", "Chronic low back problems"],
  "Male Genito/Urinary": ["Painful/Slow Urination", "Nighttime Urinary frequency", "Urinary Tract Infection", "Pain in genitals/groin"],
  "Nervous System": ["Difficulty in relaxing", "Difficulty in sleeping"],
  "Respiratory System": ["Easily out of breath", "Airborne allergies"]
};

const diagnosesList = [
  "Abdominal hernia", "Heart Disease", "Severe neurological disorder", "Arthritis/Rheumatism", 
  "Hypertension", "Severe venous or arterial circulatory disorder", "Asthma", "Bleeding tendency, haemophilia", 
  "Sprains/dislocations", "Broken bones", "Infection or inflammation", "Stroke/CVA/TIA", "Bursitis", 
  "Lupus Erythematosus", "Thrombosis/Phlebitis", "Cancer", "Lactating", "TMJ (Jaw) Dysfunction", 
  "Carpel Tunnel Syndrome", "Migraine headaches", "Tuberculosis", "Diabetes", "Multiple Sclerosis", 
  "Disk problem (slipped, herniated)", "Muscular Dystrophy", "Ulcer/Colitis/Diverticulitis", "Emphysema", 
  "Osteoporosis", "Vertigo", "Epilepsy", "Parkinson's Disease", "A pacemaker", "Fibrositis / Fibromyalgia", "Sciatica"
];

const generalQuestions = [
  "Suffering from asthma?", "Suffering from Rheumatic fever?", "Do you drink alcohol?", 
  "Recent surgery (last 12 months)?", "Pregnancy (now or within last 3 months)?", 
  "Any gynaecological disorders?", "Are you under a lot of stress?", 
  "History of breathing difficulty or lung problems?", "Muscle injury?", 
  "Joint or back disorder?", "Any previous injury?", "Diabetes or thyroid condition?", 
  "Cigarette smoking habit?", "Obesity (more than 20% over ideal body weight)?", 
  "Hernia?", "Any condition that has been aggravated by lifting weights?", 
  "Any surgery or fracture of bone, muscle pull, sprain, back pain?", 
  "Impairment or disability, including a joint?", "Bone or muscle problem?", 
  "Do you engage in regular exercise?", "Do you take dietary supplements?", 
  "Taking steroids in the past or currently?", "Do you have frequent falls/lose consciousness/balance?"
];

// CSS specific to inputs for cleaner syntax in the wizard
const inputStyles = `
  .wizard-input, .wizard-select {
    width: 100%;
    padding: 12px;
    background: var(--bg-soft);
    border: 1px solid var(--bg-border);
    border-radius: 8px;
    color: var(--text-primary);
    margin-top: 5px;
    outline: none;
    font-family: inherit;
  }
  .wizard-input:focus, .wizard-select:focus {
    border-color: var(--gold);
  }
  .wizard-label {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const MembershipWizard = ({ onComplete, showAutoFill = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personal: { name: '', bloodGroup: '', address: '', pincode: '', phone: '', mobile: '', email: '', dob: '', occupation: '', nationality: '', maritalStatus: 'Unmarried', anniversary: '', gender: 'Male', durationFrom: '', durationTo: '' },
    emergency: { name: '', relationship: '', phone: '' },
    physician: { name: '', phone: '' },
    services: [],
    generalQuestions: {},
    symptoms: [],
    diagnoses: [],
    agreed: false,
    declarationName: '',
    parentName: ''
  });

  const handleAutoFill = () => {
    // Generate dates
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    setFormData({
      personal: { 
        name: 'John Doe', bloodGroup: 'O+', address: '123 SkyFit Avenue, Fitness District', 
        pincode: '90210', phone: '555-0100', mobile: '555-0199', email: 'john.doe@example.com', 
        dob: '1990-05-15', occupation: 'Software Engineer', nationality: 'American', 
        maritalStatus: 'Unmarried', anniversary: '', gender: 'Male', 
        durationFrom: today.toISOString().split('T')[0], 
        durationTo: nextYear.toISOString().split('T')[0] 
      },
      emergency: { name: 'Jane Doe', relationship: 'Sister', phone: '555-0200' },
      physician: { name: 'Dr. Smith', phone: '555-0300' },
      services: ['Gym Membership / Complete Health', 'Personal Training'],
      generalQuestions: {
        "Do you engage in regular exercise?": "Yes",
        "Do you drink alcohol?": "No",
        "History of breathing difficulty or lung problems?": "No"
      },
      symptoms: ['Aching Muscles'],
      diagnoses: [],
      agreed: true,
      declarationName: 'John Doe',
      parentName: 'Robert Doe'
    });
    setStep(5); // Jump to the end for quick prototype submission
  };

  const updatePersonal = (field, value) => setFormData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  const updateEmergency = (field, value) => setFormData(prev => ({ ...prev, emergency: { ...prev.emergency, [field]: value } }));
  
  const toggleArrayItem = (arrayName, item) => {
    setFormData(prev => {
      const arr = prev[arrayName];
      return { ...prev, [arrayName]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item] };
    });
  };

  const setGeneralQuestion = (q, val) => {
    setFormData(prev => ({ ...prev, generalQuestions: { ...prev.generalQuestions, [q]: val } }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--bg-card)', padding: '20px 40px', borderRadius: '20px', border: '1px solid var(--bg-border)', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <style>{inputStyles}</style>
      
      {/* Header & Progress */}
      <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
        {showAutoFill && (
          <button 
            onClick={handleAutoFill}
            style={{ position: 'absolute', right: 0, top: 0, background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Wand2 size={16} /> Auto-Fill Data
          </button>
        )}
        <h2 style={{ color: 'var(--gold)', fontSize: '1.8rem', marginBottom: '10px' }}>MEMBERSHIP FORM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ width: '30px', height: '4px', borderRadius: '2px', background: i <= step ? 'var(--gold)' : 'var(--bg-border)' }} />
          ))}
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '0.85rem' }}>Step {step} of 5</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        
        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="animation-fade-in">
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label className="wizard-label">Full Name</label><input className="wizard-input" type="text" value={formData.personal.name} onChange={e => updatePersonal('name', e.target.value)} /></div>
              <div><label className="wizard-label">Blood Group</label><input className="wizard-input" type="text" value={formData.personal.bloodGroup} onChange={e => updatePersonal('bloodGroup', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="wizard-label">Address</label><input className="wizard-input" type="text" value={formData.personal.address} onChange={e => updatePersonal('address', e.target.value)} /></div>
              <div><label className="wizard-label">Pincode</label><input className="wizard-input" type="text" value={formData.personal.pincode} onChange={e => updatePersonal('pincode', e.target.value)} /></div>
              <div><label className="wizard-label">Email Address</label><input className="wizard-input" type="email" value={formData.personal.email} onChange={e => updatePersonal('email', e.target.value)} /></div>
              <div><label className="wizard-label">Mobile</label><input className="wizard-input" type="tel" value={formData.personal.mobile} onChange={e => updatePersonal('mobile', e.target.value)} /></div>
              <div><label className="wizard-label">Date of Birth</label><input className="wizard-input" type="date" value={formData.personal.dob} onChange={e => updatePersonal('dob', e.target.value)} /></div>
              <div><label className="wizard-label">Occupation</label><input className="wizard-input" type="text" value={formData.personal.occupation} onChange={e => updatePersonal('occupation', e.target.value)} /></div>
              <div><label className="wizard-label">Nationality</label><input className="wizard-input" type="text" value={formData.personal.nationality} onChange={e => updatePersonal('nationality', e.target.value)} /></div>
              <div>
                <label className="wizard-label">Gender</label>
                <select className="wizard-select" value={formData.personal.gender} onChange={e => updatePersonal('gender', e.target.value)}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className="wizard-label">Marital Status</label>
                <select className="wizard-select" value={formData.personal.maritalStatus} onChange={e => updatePersonal('maritalStatus', e.target.value)}>
                  <option>Unmarried</option><option>Married</option>
                </select>
              </div>
            </div>

            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px', marginTop: '30px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Emergency Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label className="wizard-label">Contact Name</label><input className="wizard-input" type="text" value={formData.emergency.name} onChange={e => updateEmergency('name', e.target.value)} /></div>
              <div><label className="wizard-label">Relationship</label><input className="wizard-input" type="text" value={formData.emergency.relationship} onChange={e => updateEmergency('relationship', e.target.value)} /></div>
              <div><label className="wizard-label">Contact No.</label><input className="wizard-input" type="tel" value={formData.emergency.phone} onChange={e => updateEmergency('phone', e.target.value)} /></div>
            </div>
            
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px', marginTop: '30px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Interested Services</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-soft)', padding: '15px', borderRadius: '8px' }}>
              {["Gym Membership / Complete Health", "Personal Training", "Massage and Steam", "Weight Loss", "Weight Gain"].map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={formData.services.includes(service)} onChange={() => toggleArrayItem('services', service)} style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
                  {service}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: General Medical Questions */}
        {step === 2 && (
          <div className="animation-fade-in">
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>General Medical History</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.85rem' }}>Please answer Yes or No to the following conditions.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {generalQuestions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--bg-border)' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', width: '70%' }}>{q}</span>
                  <div style={{ display: 'flex', gap: '15px', width: '30%', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <input type="radio" name={`gq_${idx}`} checked={formData.generalQuestions[q] === 'Yes'} onChange={() => setGeneralQuestion(q, 'Yes')} style={{ accentColor: 'var(--gold)' }} /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <input type="radio" name={`gq_${idx}`} checked={formData.generalQuestions[q] === 'No'} onChange={() => setGeneralQuestion(q, 'No')} style={{ accentColor: 'var(--gold)' }} /> No
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Par-Q & Diagnoses */}
        {step === 3 && (
          <div className="animation-fade-in">
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Observed Symptoms</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(symptomsList).map(([category, items]) => (
                <div key={category} style={{ background: 'var(--bg-soft)', padding: '10px 15px', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--gold)', margin: '0 0 10px 0', fontSize: '0.9rem' }}>{category}</h4>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                    {items.map(item => (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={formData.symptoms.includes(item)} onChange={() => toggleArrayItem('symptoms', item)} style={{ accentColor: 'var(--gold)' }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '15px', marginTop: '30px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Doctor Diagnosed Conditions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-soft)', padding: '15px', borderRadius: '8px' }}>
              {diagnosesList.map(item => (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={formData.diagnoses.includes(item)} onChange={() => toggleArrayItem('diagnoses', item)} style={{ accentColor: 'var(--gold)' }} />
                  {item}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Consents */}
        {step === 4 && (
          <div className="animation-fade-in">
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Consents & Acknowledgments</h3>
            
            <div style={{ background: 'var(--bg-soft)', padding: '20px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>A. General Consent</h4>
              <p style={{marginTop: 0, marginBottom: '15px'}}>I know and have been informed about the benefits of exercise. I understand that the reaction of the heart, lung, and blood vessel system cannot always be predicted. Skyfit shall not be liable for any damage arising from injuries sustained by me. I am fully responsible for my health care.</p>
              
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>B. Massage Consent (If applicable)</h4>
              <p style={{marginTop: 0, marginBottom: '15px'}}>I understand the massage therapist does not diagnose illness. I have declared all known medical conditions. The flooring may become slippery, and I will make every effort to be extra careful.</p>
              
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>C. Personal Training Consent (If applicable)</h4>
              <p style={{marginTop: 0, marginBottom: '15px'}}>My workout time will be finalized before sessions start. Physical contact will occur between myself and the instructor. Experienced fitness trainers will provide undivided attention, but in case of emergency, the gym is not liable.</p>

              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>D. Nutrition Products</h4>
              <p style={{marginTop: 0, marginBottom: '0'}}>The shoppe selling nutritional goods inside Skyfit is a third-party partner. Products shall be consumed under medical supervision. Any trade between client and associate shall be their mutual business.</p>
            </div>
          </div>
        )}

        {/* STEP 5: Final Declaration */}
        {step === 5 && (
          <div className="animation-fade-in">
            <h3 style={{ borderBottom: '1px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Final Declaration</h3>
            
            <div style={{ background: 'var(--bg-soft)', padding: '20px', borderRadius: '8px', border: '1px solid var(--bg-border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', lineHeight: '2', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <span>I, </span>
                <input type="text" placeholder="Your Name" value={formData.declarationName} onChange={e => setFormData({...formData, declarationName: e.target.value})} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--gold)', color: 'var(--text-primary)', width: '150px', outline: 'none' }} />
                <span> Son/Daughter/Wife of </span>
                <input type="text" placeholder="Parent/Guardian Name" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--gold)', color: 'var(--text-primary)', width: '150px', outline: 'none' }} />
                <span> do solemnly affirm that the terms and conditions prescribed in this form have been carefully read by me.</span>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', background: 'rgba(201, 168, 76, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid var(--gold)' }}>
                <input type="checkbox" checked={formData.agreed} onChange={e => setFormData({...formData, agreed: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--gold)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)', lineHeight: '1.4', fontSize: '0.85rem' }}>
                  I hereby declare that all the information furnished by me in this form is correct to the best of my knowledge and nothing here is being concealed from Skyfit. I agree to follow all terms and conditions and understand that providing false information can lead to immediate termination without refund.
                </span>
              </label>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--bg-border)' }}>
        <button 
          onClick={prevStep} 
          disabled={step === 1}
          style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--bg-border)', color: 'var(--text-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.5 : 1, fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Prev
        </button>

        {step < 5 ? (
          <button 
            onClick={nextStep} 
            style={{ padding: '10px 16px', background: 'var(--gold)', border: 'none', color: 'var(--bg-body)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={() => formData.agreed && onComplete(formData)}
            disabled={!formData.agreed}
            style={{ padding: '10px 20px', background: formData.agreed ? 'var(--gold)' : 'var(--bg-border)', border: 'none', color: formData.agreed ? 'var(--bg-body)' : 'var(--text-muted)', borderRadius: '8px', cursor: formData.agreed ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            SUBMIT
          </button>
        )}
      </div>

    </div>
  );
};

export default MembershipWizard;
