import { useState } from 'react';
import { medicalService } from '../../services/api';

export const PrescriptionForm = ({ patient, appointmentId, onSuccess }) => {
  const [form, setForm] = useState({
    diagnosis: '', symptoms: '', advice: '', notes: '',
  });
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const updatePrescription = (idx, field, value) => {
    setPrescriptions(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addMedicine = () =>
    setPrescriptions(prev => [
      ...prev,
      { medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' },
    ]);

  const removeMedicine = (idx) =>
    setPrescriptions(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.diagnosis) return setError('Diagnosis is required');
    setSaving(true);
    setError('');
    try {
      await medicalService.addRecord({
        patientId: patient.id,
        appointmentId,
        ...form,
        prescriptions: prescriptions.filter(p => p.medicineName),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {[
        { key: 'diagnosis', label: 'Diagnosis', placeholder: 'Primary diagnosis…' },
        { key: 'symptoms',  label: 'Symptoms',  placeholder: 'Observed symptoms…' },
        { key: 'advice',    label: 'Advice',     placeholder: 'Patient advice…' },
        { key: 'notes',     label: 'Notes',      placeholder: 'Internal notes…' },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
          <textarea
            rows={2}
            value={form[key]}
            onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      ))}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prescriptions</label>
          <button onClick={addMedicine} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Add medicine</button>
        </div>
        <div className="space-y-3">
          {prescriptions.map((p, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  placeholder="Medicine name"
                  value={p.medicineName}
                  onChange={e => updatePrescription(idx, 'medicineName', e.target.value)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  placeholder="Dosage (e.g. 500mg)"
                  value={p.dosage}
                  onChange={e => updatePrescription(idx, 'dosage', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  placeholder="Frequency (e.g. Twice daily)"
                  value={p.frequency}
                  onChange={e => updatePrescription(idx, 'frequency', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1" max="365" placeholder="Days"
                    value={p.durationDays}
                    onChange={e => updatePrescription(idx, 'durationDays', parseInt(e.target.value))}
                    className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span className="text-xs text-slate-500">days</span>
                </div>
                {prescriptions.length > 1 && (
                  <button onClick={() => removeMedicine(idx)} className="text-xs text-red-500 hover:text-red-700 text-right">Remove</button>
                )}
              </div>
              <input
                placeholder="Instructions (optional)"
                value={p.instructions}
                onChange={e => updatePrescription(idx, 'instructions', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Medical Record'}
      </button>
    </div>
  );
};
